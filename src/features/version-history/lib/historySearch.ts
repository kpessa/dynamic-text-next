import { Version, VersionFilterOptions, ChangeTracking } from '@/entities/version';
import { VersionStorage } from './versionStorage';

export interface SearchResult {
  version: Version;
  matches: SearchMatch[];
  relevance: number;
}

export interface SearchMatch {
  field: string;
  value: string;
  context?: string;
}

export class HistorySearchService {
  private static instance: HistorySearchService;
  private versionStorage: VersionStorage;

  private constructor() {
    this.versionStorage = VersionStorage.getInstance();
  }

  static getInstance(): HistorySearchService {
    if (!HistorySearchService.instance) {
      HistorySearchService.instance = new HistorySearchService();
    }
    return HistorySearchService.instance;
  }

  async searchVersionHistory(
    documentId: string,
    options: VersionFilterOptions
  ): Promise<SearchResult[]> {
    const allVersions = await this.versionStorage.getVersionHistory(documentId);
    let filteredVersions = allVersions;

    if (options.author) {
      filteredVersions = filteredVersions.filter(v => 
        v.metadata.createdBy.toLowerCase().includes(options.author!.toLowerCase())
      );
    }

    if (options.dateFrom) {
      filteredVersions = filteredVersions.filter(v => 
        v.metadata.createdAt >= options.dateFrom!
      );
    }

    if (options.dateTo) {
      filteredVersions = filteredVersions.filter(v => 
        v.metadata.createdAt <= options.dateTo!
      );
    }

    if (options.branch) {
      filteredVersions = filteredVersions.filter(v => 
        v.metadata.branch === options.branch
      );
    }

    if (options.tags && options.tags.length > 0) {
      filteredVersions = filteredVersions.filter(v => 
        options.tags!.some(tag => v.metadata.tags?.includes(tag))
      );
    }

    const results: SearchResult[] = [];

    for (const version of filteredVersions) {
      const matches: SearchMatch[] = [];
      let relevance = 0;

      if (options.searchQuery) {
        const query = options.searchQuery.toLowerCase();

        if (version.metadata.commitMessage?.toLowerCase().includes(query)) {
          matches.push({
            field: 'commitMessage',
            value: version.metadata.commitMessage,
            context: this.getContext(version.metadata.commitMessage, query)
          });
          relevance += 10;
        }

        if (version.metadata.changesSummary?.toLowerCase().includes(query)) {
          matches.push({
            field: 'changesSummary',
            value: version.metadata.changesSummary,
            context: this.getContext(version.metadata.changesSummary, query)
          });
          relevance += 5;
        }

        if (version.content) {
          const contentMatches = await this.searchInContent(version.content, query);
          matches.push(...contentMatches);
          relevance += contentMatches.length * 2;
        }
      } else {
        relevance = 1;
      }

      if (matches.length > 0 || !options.searchQuery) {
        results.push({
          version,
          matches,
          relevance
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  private async searchInContent(content: any, query: string): Promise<SearchMatch[]> {
    const matches: SearchMatch[] = [];
    const contentString = JSON.stringify(content).toLowerCase();

    if (contentString.includes(query)) {
      if (content.sections) {
        for (const section of content.sections) {
          const sectionString = JSON.stringify(section).toLowerCase();
          if (sectionString.includes(query)) {
            matches.push({
              field: `section:${section.id}`,
              value: section.title || section.content?.substring(0, 100),
              context: this.getContext(sectionString, query)
            });
          }
        }
      }

      if (content.ingredients) {
        for (const ingredient of content.ingredients) {
          const ingredientString = JSON.stringify(ingredient).toLowerCase();
          if (ingredientString.includes(query)) {
            matches.push({
              field: `ingredient:${ingredient.id}`,
              value: ingredient.name,
              context: this.getContext(ingredientString, query)
            });
          }
        }
      }
    }

    return matches;
  }

  private getContext(text: string, query: string, contextLength: number = 50): string {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return '';

    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + query.length + contextLength);
    
    let context = text.substring(start, end);
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';
    
    return context;
  }

  async buildAdvancedQuery(
    documentId: string,
    queryBuilder: {
      must?: string[];
      should?: string[];
      mustNot?: string[];
      dateRange?: { from?: Date; to?: Date };
      authors?: string[];
      tags?: string[];
      minChanges?: number;
      maxChanges?: number;
    }
  ): Promise<SearchResult[]> {
    const allVersions = await this.versionStorage.getVersionHistory(documentId);
    const results: SearchResult[] = [];

    for (const version of allVersions) {
      let score = 0;
      const matches: SearchMatch[] = [];

      if (queryBuilder.must && queryBuilder.must.length > 0) {
        const allMustMatch = queryBuilder.must.every(term => 
          this.versionContainsTerm(version, term)
        );
        if (!allMustMatch) continue;
        score += 10 * queryBuilder.must.length;
      }

      if (queryBuilder.mustNot && queryBuilder.mustNot.length > 0) {
        const anyMustNotMatch = queryBuilder.mustNot.some(term => 
          this.versionContainsTerm(version, term)
        );
        if (anyMustNotMatch) continue;
      }

      if (queryBuilder.should && queryBuilder.should.length > 0) {
        queryBuilder.should.forEach(term => {
          if (this.versionContainsTerm(version, term)) {
            score += 5;
            matches.push({
              field: 'content',
              value: term
            });
          }
        });
      }

      if (queryBuilder.dateRange) {
        const inRange = 
          (!queryBuilder.dateRange.from || version.metadata.createdAt >= queryBuilder.dateRange.from) &&
          (!queryBuilder.dateRange.to || version.metadata.createdAt <= queryBuilder.dateRange.to);
        if (!inRange) continue;
      }

      if (queryBuilder.authors && queryBuilder.authors.length > 0) {
        const authorMatches = queryBuilder.authors.includes(version.metadata.createdBy);
        if (!authorMatches) continue;
      }

      if (queryBuilder.tags && queryBuilder.tags.length > 0) {
        const hasTag = queryBuilder.tags.some(tag => 
          version.metadata.tags?.includes(tag)
        );
        if (!hasTag) continue;
      }

      if (queryBuilder.minChanges || queryBuilder.maxChanges) {
        const totalChanges = (version.diff?.added || 0) + 
                           (version.diff?.removed || 0) + 
                           (version.diff?.modified || 0);
        
        if (queryBuilder.minChanges && totalChanges < queryBuilder.minChanges) continue;
        if (queryBuilder.maxChanges && totalChanges > queryBuilder.maxChanges) continue;
      }

      if (score > 0 || matches.length > 0) {
        results.push({
          version,
          matches,
          relevance: score
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  private versionContainsTerm(version: Version, term: string): boolean {
    const searchableContent = [
      version.metadata.commitMessage,
      version.metadata.changesSummary,
      version.metadata.createdBy,
      JSON.stringify(version.content),
      version.metadata.tags?.join(' ')
    ].filter(Boolean).join(' ').toLowerCase();

    return searchableContent.includes(term.toLowerCase());
  }
}
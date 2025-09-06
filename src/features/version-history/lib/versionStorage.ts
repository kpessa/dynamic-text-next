import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase/config';
import { Version, VersionStorageInfo } from '@/entities/version';
import { DiffEngine } from './diffEngine';
import pako from 'pako';

export class VersionStorage {
  private static instance: VersionStorage;
  private diffEngine: DiffEngine;
  private compressionEnabled = true;
  private maxVersionsPerDocument = 100;
  private baselineInterval = 10;

  private constructor() {
    this.diffEngine = new DiffEngine();
  }

  static getInstance(): VersionStorage {
    if (!VersionStorage.instance) {
      VersionStorage.instance = new VersionStorage();
    }
    return VersionStorage.instance;
  }

  async saveVersion(version: Version): Promise<void> {
    const previousVersion = version.parentVersionId 
      ? await this.getVersion(version.parentVersionId)
      : null;

    let versionToStore: any = { ...version };
    let storageInfo: VersionStorageInfo;

    const shouldStoreFullContent = 
      !previousVersion || 
      version.version % this.baselineInterval === 0 ||
      version.isBaseline;

    if (shouldStoreFullContent) {
      storageInfo = await this.storeFullContent(versionToStore);
      versionToStore.isBaseline = true;
    } else {
      storageInfo = await this.storeDiff(versionToStore, previousVersion!);
      versionToStore.content = undefined;
    }

    versionToStore.storageInfo = storageInfo;
    versionToStore.metadata.createdAt = Timestamp.fromDate(
      version.metadata.createdAt
    );

    await setDoc(doc(db, 'versions', version.id), versionToStore);
    
    await this.pruneOldVersions(version.documentId);
  }

  private async storeFullContent(version: Version): Promise<VersionStorageInfo> {
    const contentString = JSON.stringify(version.content);
    let dataToStore = contentString;
    let compressionType: 'gzip' | 'none' = 'none';

    if (this.compressionEnabled && contentString.length > 1024) {
      try {
        const compressed = pako.gzip(contentString);
        const base64 = btoa(String.fromCharCode(...compressed));
        dataToStore = base64;
        compressionType = 'gzip';
      } catch (error) {
        console.error('Compression failed:', error);
      }
    }

    return {
      storageType: 'full',
      compressionType,
      size: dataToStore.length,
      checksum: version.checksum || await this.calculateChecksum(contentString)
    };
  }

  private async storeDiff(
    version: Version,
    previousVersion: Version
  ): Promise<VersionStorageInfo> {
    if (!version.content || !previousVersion.content) {
      throw new Error('Content required for diff storage');
    }

    const oldContent = JSON.stringify(previousVersion.content);
    const newContent = JSON.stringify(version.content);
    
    const patch = this.diffEngine.createPatch(
      'content',
      oldContent,
      newContent,
      `v${previousVersion.version}`,
      `v${version.version}`
    );

    version.diff = {
      added: 0,
      removed: 0,
      modified: 0,
      patches: []
    };

    const diffResult = this.diffEngine.computeDiff(oldContent, newContent);
    version.diff.added = diffResult.stats.additions;
    version.diff.removed = diffResult.stats.deletions;
    version.diff.modified = diffResult.stats.modifications;

    let dataToStore = patch;
    let compressionType: 'gzip' | 'none' = 'none';

    if (this.compressionEnabled && patch.length > 512) {
      try {
        const compressed = pako.gzip(patch);
        const base64 = btoa(String.fromCharCode(...compressed));
        dataToStore = base64;
        compressionType = 'gzip';
      } catch (error) {
        console.error('Compression failed:', error);
      }
    }

    (version as any).patchData = dataToStore;

    return {
      storageType: 'diff',
      compressionType,
      size: dataToStore.length,
      checksum: version.checksum || await this.calculateChecksum(newContent)
    };
  }

  async getVersion(versionId: string): Promise<Version | null> {
    const docSnap = await getDoc(doc(db, 'versions', versionId));
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    const version = this.documentDataToVersion(data);

    if (!version.content && version.baseVersionId) {
      version.content = await this.reconstructVersion(versionId);
    }

    return version;
  }

  async reconstructVersion(versionId: string): Promise<any> {
    const version = await this.getRawVersion(versionId);
    
    if (!version) {
      throw new Error(`Version ${versionId} not found`);
    }

    if (version.content) {
      return version.content;
    }

    if (!version.baseVersionId) {
      throw new Error(`Cannot reconstruct version ${versionId}: no base version`);
    }

    const baseContent = await this.reconstructVersion(version.baseVersionId);
    
    if (!(version as any).patchData) {
      throw new Error(`Cannot reconstruct version ${versionId}: no patch data`);
    }

    let patch = (version as any).patchData;
    
    if (version.storageInfo?.compressionType === 'gzip') {
      try {
        const binary = atob(patch);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const decompressed = pako.ungzip(bytes, { to: 'string' });
        patch = decompressed;
      } catch (error) {
        console.error('Decompression failed:', error);
        throw new Error('Failed to decompress patch data');
      }
    }

    const baseContentString = JSON.stringify(baseContent);
    const reconstructed = this.diffEngine.applyPatch(baseContentString, patch);
    
    return JSON.parse(reconstructed);
  }

  private async getRawVersion(versionId: string): Promise<any> {
    const docSnap = await getDoc(doc(db, 'versions', versionId));
    
    if (!docSnap.exists()) {
      return null;
    }

    return this.documentDataToVersion(docSnap.data());
  }

  async getVersionHistory(
    documentId: string,
    limitCount?: number
  ): Promise<Version[]> {
    const q = query(
      collection(db, 'versions'),
      where('documentId', '==', documentId),
      orderBy('version', 'desc'),
      limit(limitCount || 50)
    );

    const querySnapshot = await getDocs(q);
    const versions: Version[] = [];

    for (const doc of querySnapshot.docs) {
      const version = this.documentDataToVersion(doc.data());
      versions.push(version);
    }

    return versions;
  }

  async getVersionsByDateRange(
    documentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Version[]> {
    const q = query(
      collection(db, 'versions'),
      where('documentId', '==', documentId),
      where('metadata.createdAt', '>=', Timestamp.fromDate(startDate)),
      where('metadata.createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('metadata.createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const versions: Version[] = [];

    for (const doc of querySnapshot.docs) {
      const version = this.documentDataToVersion(doc.data());
      versions.push(version);
    }

    return versions;
  }

  private async pruneOldVersions(documentId: string): Promise<void> {
    const versions = await this.getVersionHistory(
      documentId,
      this.maxVersionsPerDocument + 10
    );

    if (versions.length <= this.maxVersionsPerDocument) {
      return;
    }

    const versionsToKeep = new Set<string>();
    
    versions.slice(0, this.maxVersionsPerDocument).forEach(v => {
      versionsToKeep.add(v.id);
    });

    versions.forEach(v => {
      if (v.isBaseline) {
        versionsToKeep.add(v.id);
      }
    });

    const versionsToDelete = versions.filter(v => !versionsToKeep.has(v.id));
    
    console.log(`Pruning ${versionsToDelete.length} old versions for document ${documentId}`);
  }

  private documentDataToVersion(data: DocumentData): Version {
    return {
      id: data.id,
      documentId: data.documentId,
      version: data.version,
      parentVersionId: data.parentVersionId,
      content: data.content,
      metadata: {
        ...data.metadata,
        createdAt: data.metadata.createdAt?.toDate() || new Date()
      },
      diff: data.diff,
      baseVersionId: data.baseVersionId,
      isBaseline: data.isBaseline,
      checksum: data.checksum
    };
  }

  private async calculateChecksum(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  }

  async archiveVersion(versionId: string): Promise<void> {
    const version = await this.getVersion(versionId);
    if (!version) {
      throw new Error(`Version ${versionId} not found`);
    }

    await setDoc(
      doc(db, 'archived_versions', version.id),
      {
        ...version,
        archivedAt: Timestamp.now()
      }
    );
  }

  async restoreFromArchive(versionId: string): Promise<Version | null> {
    const docSnap = await getDoc(doc(db, 'archived_versions', versionId));
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    const version = this.documentDataToVersion(data);
    
    await this.saveVersion(version);
    
    return version;
  }

  async validateVersionIntegrity(versionId: string): Promise<boolean> {
    const version = await this.getVersion(versionId);
    
    if (!version || !version.content) {
      return false;
    }

    const calculatedChecksum = await this.calculateChecksum(
      JSON.stringify(version.content)
    );
    
    return calculatedChecksum === version.checksum;
  }

  setCompressionEnabled(enabled: boolean): void {
    this.compressionEnabled = enabled;
  }

  setMaxVersionsPerDocument(max: number): void {
    this.maxVersionsPerDocument = max;
  }

  setBaselineInterval(interval: number): void {
    this.baselineInterval = interval;
  }
}
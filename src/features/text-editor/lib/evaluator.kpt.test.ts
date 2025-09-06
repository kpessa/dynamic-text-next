import { describe, it, expect } from 'vitest';
import { evaluateDynamicSection, interpolateVariables } from './evaluator';

describe('KPT Namespace Integration', () => {
  describe('evaluateDynamicSection with KPT', () => {
    it('should have access to KPT text formatting functions', () => {
      const code = `return kpt.redText("Critical")`;
      const result = evaluateDynamicSection(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('color: #ef4444');
      expect(result.output).toContain('Critical');
    });

    it('should have access to KPT number formatting functions', () => {
      const code = `return kpt.formatNumber(1234567.89)`;
      const result = evaluateDynamicSection(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toBe('1,234,567.89');
    });

    it('should have access to KPT TPN formatters', () => {
      const code = `return kpt.formatWeight(0.5)`;
      const result = evaluateDynamicSection(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toBe('500 g');
    });

    it('should have access to KPT conditional display functions', () => {
      const code = `return kpt.showIf(true, "Visible")`;
      const result = evaluateDynamicSection(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toBe('Visible');
    });

    it('should have access to KPT range checking functions', () => {
      const code = `return kpt.isNormal(5, 2, 8)`;
      const result = evaluateDynamicSection(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toBe('true');
    });

    it('should have access to KPT HTML builders', () => {
      const code = `return kpt.createList(["Item 1", "Item 2"])`;
      const result = evaluateDynamicSection(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('<ul');
      expect(result.output).toContain('<li');
      expect(result.output).toContain('Item 1');
    });

    it('should have access to KPT utility functions', () => {
      const code = `return kpt.pluralize(5, "item")`;
      const result = evaluateDynamicSection(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toBe('5 items');
    });

    it('should work with context variables and KPT functions', () => {
      const code = `return kpt.formatDose(dose, "mg")`;
      const context = { dose: 0.5 };
      const result = evaluateDynamicSection(code, context);
      
      expect(result.success).toBe(true);
      expect(result.output).toBe('500 mcg');
    });

    it('should chain KPT functions', () => {
      const code = `
        const weight = 75;
        const formatted = kpt.formatWeight(weight);
        return kpt.boldText(formatted);
      `;
      const result = evaluateDynamicSection(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('<strong>');
      expect(result.output).toContain('75 kg');
    });
  });

  describe('interpolateVariables with KPT', () => {
    it('should interpolate KPT text formatting functions', () => {
      const text = 'Status: ${kpt.redText("Critical")}';
      const result = interpolateVariables(text, {});
      
      expect(result).toContain('Status:');
      expect(result).toContain('color: #ef4444');
      expect(result).toContain('Critical');
    });

    it('should interpolate KPT number formatting', () => {
      const text = 'Total: ${kpt.formatCurrency(1234.56)}';
      const result = interpolateVariables(text, {});
      
      expect(result).toBe('Total: $1,234.56');
    });

    it('should interpolate KPT functions with variables', () => {
      const text = 'Weight: ${kpt.formatWeight(weight)}';
      const variables = { weight: 0.025 };
      const result = interpolateVariables(text, variables);
      
      expect(result).toBe('Weight: 25 g');
    });

    it('should interpolate KPT conditional functions', () => {
      const text = '${kpt.whenAbove(value, 10, "High")}';
      const variables = { value: 15 };
      const result = interpolateVariables(text, variables);
      
      expect(result).toBe('High');
    });

    it('should interpolate KPT range checking', () => {
      const text = 'Status: ${kpt.checkRange(value, [2, 8])}';
      const variables = { value: 5 };
      const result = interpolateVariables(text, variables);
      
      expect(result).toBe('Status: normal');
    });

    it('should interpolate KPT HTML builders', () => {
      const text = 'Alert: ${kpt.createAlert("Warning!", "warning")}';
      const result = interpolateVariables(text, {});
      
      expect(result).toContain('Alert:');
      expect(result).toContain('kpt-alert-warning');
      expect(result).toContain('Warning!');
    });

    it('should handle complex expressions with KPT', () => {
      const text = 'Dose: ${kpt.boldText(kpt.formatDose(dose * 2))}';
      const variables = { dose: 250 };
      const result = interpolateVariables(text, variables);
      
      expect(result).toContain('Dose:');
      expect(result).toContain('<strong>');
      expect(result).toContain('500 mg');
    });

    it('should handle multiple KPT interpolations', () => {
      const text = 'Weight: ${kpt.formatWeight(weight)} | Volume: ${kpt.formatVolume(volume)}';
      const variables = { weight: 75, volume: 1500 };
      const result = interpolateVariables(text, variables);
      
      expect(result).toBe('Weight: 75 kg | Volume: 1.5 L');
    });
  });

  describe('KPT Functions in Dynamic Sections', () => {
    it('should create formatted tables', () => {
      const code = `
        const data = [
          ["Name", "Value"],
          ["Glucose", 250],
          ["Sodium", 140]
        ];
        return kpt.createTable(data, ["Parameter", "Result"]);
      `;
      const result = evaluateDynamicSection(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('<table');
      expect(result.output).toContain('Parameter');
      expect(result.output).toContain('Glucose');
    });

    it('should format TPN calculations', () => {
      const code = `
        const weight = 70; // kg
        const infusionRate = 125; // mL/hr
        const concentration = 10; // mg/mL
        
        const output = [
          "Patient Weight: " + kpt.formatWeight(weight),
          "Infusion Rate: " + kpt.formatInfusionRate(infusionRate),
          "Concentration: " + kpt.formatConcentration(concentration)
        ].join("\\n");
        
        return output;
      `;
      const result = evaluateDynamicSection(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Patient Weight: 70 kg');
      expect(result.output).toContain('Infusion Rate: 125 mL/hr');
      expect(result.output).toContain('Concentration: 10 mg/mL');
    });

    it('should handle conditional display based on ranges', () => {
      const code = `
        const sodium = 135;
        const status = kpt.checkRange(sodium, [136, 145], [130, 150]);
        
        if (status === 'normal') {
          return kpt.greenText("Sodium Normal");
        } else if (status === 'abnormal') {
          return kpt.redText("Sodium Abnormal");
        } else {
          return kpt.redText(kpt.boldText("Sodium Critical"));
        }
      `;
      const result = evaluateDynamicSection(code);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('color: #ef4444'); // Red
      expect(result.output).toContain('Sodium Abnormal');
    });
  });
});
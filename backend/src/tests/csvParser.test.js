import { 
  parseStringsCSV, 
  parseClassificationsCSV,
  stringifyStringsCSV,
  stringifyClassificationsCSV,
  validateCSVStructure 
} from '../services/csvParser.js';

describe('CSV Parser Service', () => {
  describe('parseStringsCSV', () => {
    it('should parse valid strings CSV data', () => {
      const csvData = `Tier,Industry,Topic,Subtopic,Prefix,Fuzzing-Idx,Prompt,Risks,Keywords
1,General,Compliance,Audit Findings,Co-Au-,0,What issues were found?,,
2,Healthcare,Clinical Trials,Safety,CT-Sa-,1,Any safety concerns?,0.5,0.8`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const result = parseStringsCSV(buffer);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        Tier: 1,
        Industry: 'General',
        Topic: 'Compliance',
        Subtopic: 'Audit Findings',
        Prefix: 'Co-Au-',
        'Fuzzing-Idx': 0,
        Prompt: 'What issues were found?',
        Risks: null,
        Keywords: null
      });
      expect(result.data[1].Risks).toBe(0.5);
      expect(result.data[1].Keywords).toBe(0.8);
    });

    it('should handle invalid CSV data', () => {
      const invalidCSV = 'not,valid,csv,data\n1,2';
      const buffer = Buffer.from(invalidCSV, 'utf-8');
      const result = parseStringsCSV(buffer);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to parse strings CSV');
    });
  });

  describe('parseClassificationsCSV', () => {
    it('should parse classifications CSV with trimmed headers', () => {
      const csvData = `Topic ,SubTopic ,Industry ,Classification
Audit,Audit Issues,General,Standard
Compliance,Regulatory Issues,Healthcare,Critical`;

      const buffer = Buffer.from(csvData, 'utf-8');
      const result = parseClassificationsCSV(buffer);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        Topic: 'Audit',
        SubTopic: 'Audit Issues',
        Industry: 'General',
        Classification: 'Standard'
      });
    });
  });

  describe('stringifyStringsCSV', () => {
    it('should convert strings data to CSV format', () => {
      const data = [
        {
          Tier: 1,
          Industry: 'General',
          Topic: 'Compliance',
          Subtopic: 'Audit',
          Prefix: 'Co-Au-',
          'Fuzzing-Idx': 0,
          Prompt: 'Test prompt',
          Risks: null,
          Keywords: 0.5
        }
      ];

      const result = stringifyStringsCSV(data);

      expect(result.success).toBe(true);
      expect(result.data).toContain('Tier,Industry,Topic,Subtopic,Prefix,Fuzzing-Idx,Prompt,Risks,Keywords');
      expect(result.data).toContain('1,General,Compliance,Audit,Co-Au-,0,Test prompt,,0.5');
    });
  });

  describe('validateCSVStructure', () => {
    it('should validate correct strings CSV structure', () => {
      const validData = [
        {
          Tier: 1,
          Industry: 'General',
          Topic: 'Compliance',
          Subtopic: 'Audit',
          Prefix: 'Co-Au-',
          'Fuzzing-Idx': 0,
          Prompt: 'Test',
          Risks: null,
          Keywords: null
        }
      ];

      const result = validateCSVStructure(validData, 'strings');
      expect(result.valid).toBe(true);
    });

    it('should reject CSV with missing fields', () => {
      const invalidData = [
        {
          Tier: 1,
          Industry: 'General'
          // Missing required fields
        }
      ];

      const result = validateCSVStructure(invalidData, 'strings');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Missing required fields');
    });

    it('should reject empty data', () => {
      const result = validateCSVStructure([], 'strings');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('empty or invalid');
    });
  });
});
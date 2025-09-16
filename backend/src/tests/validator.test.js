import { validateDataIntegrity, validateRowData, validateData } from '../services/validator.js';

describe('Validator Service', () => {
  const mockClassificationsData = [
    { Topic: 'Audit', SubTopic: 'Audit Issues', Industry: 'General', Classification: 'Standard' },
    { Topic: 'Compliance', SubTopic: 'Regulatory Issues', Industry: 'Healthcare', Classification: 'Critical' },
    { Topic: 'Clinical Trials', SubTopic: 'Safety', Industry: 'Healthcare', Classification: 'Standard' }
  ];

  describe('validateDataIntegrity', () => {
    it('should validate correct Topic+SubTopic+Industry combinations', () => {
      const stringsData = [
        { Topic: 'Audit', Subtopic: 'Audit Issues', Industry: 'General' },
        { Topic: 'Compliance', Subtopic: 'Regulatory Issues', Industry: 'Healthcare' }
      ];

      const result = validateDataIntegrity(stringsData, mockClassificationsData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid combinations', () => {
      const stringsData = [
        { Topic: 'Audit', Subtopic: 'Audit Issues', Industry: 'General' }, // Valid
        { Topic: 'InvalidTopic', Subtopic: 'InvalidSubTopic', Industry: 'InvalidIndustry' } // Invalid
      ];

      const result = validateDataIntegrity(stringsData, mockClassificationsData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        rowIndex: 1,
        field: 'Topic+SubTopic+Industry',
        message: 'Topic "InvalidTopic" + SubTopic "InvalidSubTopic" + Industry "InvalidIndustry" combination not found in classifications data'
      });
    });

    it('should handle trimming whitespace in comparisons', () => {
      const stringsData = [
        { Topic: ' Audit ', Subtopic: ' Audit Issues ', Industry: ' General ' }
      ];

      const result = validateDataIntegrity(stringsData, mockClassificationsData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateRowData', () => {
    it('should validate correct strings row data', () => {
      const stringsData = [
        {
          Tier: 1,
          Industry: 'General',
          Topic: 'Compliance',
          Subtopic: 'Audit',
          'Fuzzing-Idx': 0
        }
      ];

      const result = validateRowData(stringsData, 'strings');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields in strings data', () => {
      const stringsData = [
        {
          Tier: 1,
          Industry: '', // Empty
          Topic: 'Compliance',
          Subtopic: '', // Empty
          'Fuzzing-Idx': 0
        }
      ];

      const result = validateRowData(stringsData, 'strings');

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.some(e => e.field === 'Industry')).toBe(true);
      expect(result.errors.some(e => e.field === 'Subtopic')).toBe(true);
    });

    it('should validate invalid data types in strings data', () => {
      const stringsData = [
        {
          Tier: 'invalid', // Should be number
          Industry: 'General',
          Topic: 'Compliance',
          Subtopic: 'Audit',
          'Fuzzing-Idx': -1 // Should be non-negative
        }
      ];

      const result = validateRowData(stringsData, 'strings');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'Tier')).toBe(true);
      expect(result.errors.some(e => e.field === 'Fuzzing-Idx')).toBe(true);
    });

    it('should validate classifications row data', () => {
      const classificationsData = [
        {
          Topic: 'Audit',
          SubTopic: 'Audit Issues',
          Industry: 'General',
          Classification: 'Standard'
        }
      ];

      const result = validateRowData(classificationsData, 'classifications');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields in classifications data', () => {
      const classificationsData = [
        {
          Topic: '',
          SubTopic: 'Audit Issues',
          Industry: '',
          Classification: 'Standard'
        }
      ];

      const result = validateRowData(classificationsData, 'classifications');

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.some(e => e.field === 'Topic')).toBe(true);
      expect(result.errors.some(e => e.field === 'Industry')).toBe(true);
    });
  });

  describe('validateData', () => {
    it('should perform comprehensive validation', () => {
      const stringsData = [
        {
          Tier: 1,
          Industry: 'General',
          Topic: 'Audit',
          Subtopic: 'Audit Issues',
          'Fuzzing-Idx': 0
        }
      ];

      const result = validateData(stringsData, mockClassificationsData);

      expect(result.isValid).toBe(true);
      expect(result.stringsValid).toBe(true);
      expect(result.classificationsValid).toBe(true);
      expect(result.integrityValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect multiple validation issues', () => {
      const invalidStringsData = [
        {
          Tier: 'invalid',
          Industry: '',
          Topic: 'NonExistentTopic',
          Subtopic: 'NonExistentSubTopic',
          'Fuzzing-Idx': -1
        }
      ];

      const result = validateData(invalidStringsData, mockClassificationsData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
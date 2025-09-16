import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

/**
 * Parse strings CSV file buffer
 */
export const parseStringsCSV = (buffer) => {
  try {
    const records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, { column }) => {
        // Handle specific data type conversions
        if (column === 'Tier' || column === 'Fuzzing-Idx') {
          return value === '' ? 0 : parseInt(value) || 0;
        }
        if (column === 'Risks' || column === 'Keywords') {
          return value === '' ? null : parseFloat(value) || null;
        }
        return value;
      }
    });

    return {
      success: true,
      data: records
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to parse strings CSV: ${error.message}`
    };
  }
};

/**
 * Parse classifications CSV file buffer
 */
export const parseClassificationsCSV = (buffer) => {
  try {
    const records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value) => {
        // All fields are strings, just trim whitespace
        return typeof value === 'string' ? value.trim() : value;
      }
    });

    // Clean up any trailing spaces in column names
    const cleanedRecords = records.map(record => ({
      Topic: record.Topic || record['Topic '] || '',
      SubTopic: record.SubTopic || record['SubTopic '] || '',
      Industry: record.Industry || record['Industry '] || '',
      Classification: record.Classification || record['Classification '] || ''
    }));

    return {
      success: true,
      data: cleanedRecords
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to parse classifications CSV: ${error.message}`
    };
  }
};

/**
 * Convert strings data to CSV string
 */
export const stringifyStringsCSV = (data) => {
  try {
    const csvString = stringify(data, {
      header: true,
      columns: ['Tier', 'Industry', 'Topic', 'Subtopic', 'Prefix', 'Fuzzing-Idx', 'Prompt', 'Risks', 'Keywords']
    });
    
    return {
      success: true,
      data: csvString
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to generate strings CSV: ${error.message}`
    };
  }
};

/**
 * Convert classifications data to CSV string
 */
export const stringifyClassificationsCSV = (data) => {
  try {
    const csvString = stringify(data, {
      header: true,
      columns: ['Topic', 'SubTopic', 'Industry', 'Classification']
    });
    
    return {
      success: true,
      data: csvString
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to generate classifications CSV: ${error.message}`
    };
  }
};

/**
 * Validate CSV structure matches expected format
 */
export const validateCSVStructure = (data, type) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      valid: false,
      message: 'CSV file is empty or invalid'
    };
  }

  const expectedFields = type === 'strings' 
    ? ['Tier', 'Industry', 'Topic', 'Subtopic', 'Prefix', 'Fuzzing-Idx', 'Prompt', 'Risks', 'Keywords']
    : ['Topic', 'SubTopic', 'Industry', 'Classification'];

  const actualFields = Object.keys(data[0]);
  const missingFields = expectedFields.filter(field => !actualFields.includes(field));

  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    };
  }

  return {
    valid: true
  };
};
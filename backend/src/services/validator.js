/**
 * Validate that all Topic + SubTopic + Industry combinations in strings data
 * exist in classifications data
 */
export const validateDataIntegrity = (stringsData, classificationsData) => {
  const errors = [];
  
  // Create lookup set from classifications data
  const validCombinations = new Set(
    classificationsData.map(row => 
      `${row.Topic?.trim() || ''}|${row.SubTopic?.trim() || ''}|${row.Industry?.trim() || ''}`
    )
  );

  // Check each strings row
  stringsData.forEach((row, index) => {
    const topic = row.Topic?.trim() || '';
    const subtopic = row.Subtopic?.trim() || '';
    const industry = row.Industry?.trim() || '';
    
    const combination = `${topic}|${subtopic}|${industry}`;
    
    if (!validCombinations.has(combination)) {
      errors.push({
        rowIndex: index,
        field: 'Topic+SubTopic+Industry',
        message: `Topic "${topic}" + SubTopic "${subtopic}" + Industry "${industry}" combination not found in classifications data`
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate individual row data types and required fields
 */
export const validateRowData = (data, type) => {
  const errors = [];
  
  data.forEach((row, index) => {
    if (type === 'strings') {
      // Validate strings row
      if (typeof row.Tier !== 'number' || row.Tier < 1) {
        errors.push({
          rowIndex: index,
          field: 'Tier',
          message: 'Tier must be a positive number'
        });
      }
      
      if (!row.Industry?.trim()) {
        errors.push({
          rowIndex: index,
          field: 'Industry',
          message: 'Industry is required'
        });
      }
      
      if (!row.Topic?.trim()) {
        errors.push({
          rowIndex: index,
          field: 'Topic',
          message: 'Topic is required'
        });
      }
      
      if (!row.Subtopic?.trim()) {
        errors.push({
          rowIndex: index,
          field: 'Subtopic',
          message: 'Subtopic is required'
        });
      }
      
      if (typeof row['Fuzzing-Idx'] !== 'number' || row['Fuzzing-Idx'] < 0) {
        errors.push({
          rowIndex: index,
          field: 'Fuzzing-Idx',
          message: 'Fuzzing-Idx must be a non-negative number'
        });
      }
      
    } else if (type === 'classifications') {
      // Validate classifications row
      if (!row.Topic?.trim()) {
        errors.push({
          rowIndex: index,
          field: 'Topic',
          message: 'Topic is required'
        });
      }
      
      if (!row.SubTopic?.trim()) {
        errors.push({
          rowIndex: index,
          field: 'SubTopic',
          message: 'SubTopic is required'
        });
      }
      
      if (!row.Industry?.trim()) {
        errors.push({
          rowIndex: index,
          field: 'Industry',
          message: 'Industry is required'
        });
      }
      
      if (!row.Classification?.trim()) {
        errors.push({
          rowIndex: index,
          field: 'Classification',
          message: 'Classification is required'
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Comprehensive validation that checks both data types and integrity
 */
export const validateData = (stringsData, classificationsData) => {
  const stringsValidation = validateRowData(stringsData, 'strings');
  const classificationsValidation = validateRowData(classificationsData, 'classifications');
  const integrityValidation = validateDataIntegrity(stringsData, classificationsData);

  const allErrors = [
    ...stringsValidation.errors,
    ...classificationsValidation.errors,
    ...integrityValidation.errors
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    stringsValid: stringsValidation.isValid,
    classificationsValid: classificationsValidation.isValid,
    integrityValid: integrityValidation.isValid
  };
};
import express from 'express';
import { uploadCSVFiles, handleUploadError } from '../middleware/upload.js';
import { 
  parseStringsCSV, 
  parseClassificationsCSV,
  stringifyStringsCSV,
  stringifyClassificationsCSV,
  validateCSVStructure 
} from '../services/csvParser.js';
import { validateData } from '../services/validator.js';

const router = express.Router();

// In-memory storage for uploaded data
let dataStore = {
  strings: [],
  classifications: []
};

/**
 * POST /api/upload
 * Upload and parse both CSV files
 */
router.post('/upload', uploadCSVFiles, handleUploadError, (req, res) => {
  try {
    const { stringsFile, classificationsFile } = req.files;

    // Check if both files are provided
    if (!stringsFile || !classificationsFile) {
      return res.status(400).json({
        success: false,
        message: 'Both stringsFile and classificationsFile are required'
      });
    }

    // Parse strings CSV
    const stringsResult = parseStringsCSV(stringsFile[0].buffer);
    if (!stringsResult.success) {
      return res.status(400).json({
        success: false,
        message: stringsResult.message
      });
    }

    // Parse classifications CSV
    const classificationsResult = parseClassificationsCSV(classificationsFile[0].buffer);
    if (!classificationsResult.success) {
      return res.status(400).json({
        success: false,
        message: classificationsResult.message
      });
    }

    // Validate CSV structure
    const stringsStructure = validateCSVStructure(stringsResult.data, 'strings');
    if (!stringsStructure.valid) {
      return res.status(400).json({
        success: false,
        message: `Strings CSV structure error: ${stringsStructure.message}`
      });
    }

    const classificationsStructure = validateCSVStructure(classificationsResult.data, 'classifications');
    if (!classificationsStructure.valid) {
      return res.status(400).json({
        success: false,
        message: `Classifications CSV structure error: ${classificationsStructure.message}`
      });
    }

    // Store data
    dataStore.strings = stringsResult.data;
    dataStore.classifications = classificationsResult.data;

    // Validate data integrity
    const validation = validateData(dataStore.strings, dataStore.classifications);

    res.json({
      success: true,
      data: {
        strings: dataStore.strings,
        classifications: dataStore.classifications
      },
      validation,
      message: `Uploaded ${dataStore.strings.length} strings rows and ${dataStore.classifications.length} classifications rows`
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process uploaded files'
    });
  }
});

/**
 * PUT /api/data/:type
 * Update data with validation
 */
router.put('/data/:type', (req, res) => {
  try {
    const { type } = req.params;
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: 'Data must be a non-empty array'
      });
    }

    if (type !== 'strings' && type !== 'classifications') {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "strings" or "classifications"'
      });
    }

    // Validate CSV structure
    const structureValidation = validateCSVStructure(data, type);
    if (!structureValidation.valid) {
      return res.status(400).json({
        success: false,
        message: structureValidation.message,
        validation: {
          isValid: false,
          errors: [{ rowIndex: 0, field: 'structure', message: structureValidation.message }]
        }
      });
    }

    // Update data store
    dataStore[type] = data;

    // Validate data integrity (only if we have both datasets)
    if (dataStore.strings.length > 0 && dataStore.classifications.length > 0) {
      const validation = validateData(dataStore.strings, dataStore.classifications);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Data validation failed',
          validation
        });
      }

      res.json({
        success: true,
        message: `${type} data updated successfully`,
        validation
      });
    } else {
      res.json({
        success: true,
        message: `${type} data updated successfully`,
        validation: { isValid: true, errors: [] }
      });
    }

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update data'
    });
  }
});

/**
 * GET /api/export/:type
 * Export data as CSV file
 */
router.get('/export/:type', (req, res) => {
  try {
    const { type } = req.params;

    if (type !== 'strings' && type !== 'classifications') {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "strings" or "classifications"'
      });
    }

    const data = dataStore[type];
    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No ${type} data found. Please upload files first.`
      });
    }

    // Generate CSV string
    const csvResult = type === 'strings' 
      ? stringifyStringsCSV(data)
      : stringifyClassificationsCSV(data);

    if (!csvResult.success) {
      return res.status(500).json({
        success: false,
        message: csvResult.message
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}.csv"`);
    res.send(csvResult.data);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data'
    });
  }
});

/**
 * GET /api/data/:type
 * Get current data (useful for debugging)
 */
router.get('/data/:type', (req, res) => {
  try {
    const { type } = req.params;

    if (type !== 'strings' && type !== 'classifications') {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "strings" or "classifications"'
      });
    }

    const data = dataStore[type];
    res.json({
      success: true,
      data,
      count: data.length
    });

  } catch (error) {
    console.error('Get data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve data'
    });
  }
});

export default router;
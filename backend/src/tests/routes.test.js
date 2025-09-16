import request from 'supertest';
import express from 'express';
import cors from 'cors';
import csvRoutes from '../routes/csv.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', csvRoutes);

describe('CSV Routes', () => {
  const validStringsCSV = `Tier,Industry,Topic,Subtopic,Prefix,Fuzzing-Idx,Prompt,Risks,Keywords
1,General,Audit,Audit Issues,Au-Au-,0,Test prompt,,`;

  const validClassificationsCSV = `Topic,SubTopic,Industry,Classification
Audit,Audit Issues,General,Standard`;

  const invalidCombinationStringsCSV = `Tier,Industry,Topic,Subtopic,Prefix,Fuzzing-Idx,Prompt,Risks,Keywords
1,General,NonExistent,NonExistent,Ne-Ne-,0,Test prompt,,`;

  describe('POST /api/upload', () => {
    it('should upload valid CSV files successfully', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('stringsFile', Buffer.from(validStringsCSV), 'strings.csv')
        .attach('classificationsFile', Buffer.from(validClassificationsCSV), 'classifications.csv');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.strings).toHaveLength(1);
      expect(response.body.data.classifications).toHaveLength(1);
      expect(response.body.validation.isValid).toBe(true);
    });

    it('should reject upload with missing files', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('stringsFile', Buffer.from(validStringsCSV), 'strings.csv');
        // Missing classificationsFile

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Both stringsFile and classificationsFile are required');
    });

    it('should detect validation errors in uploaded data', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('stringsFile', Buffer.from(invalidCombinationStringsCSV), 'strings.csv')
        .attach('classificationsFile', Buffer.from(validClassificationsCSV), 'classifications.csv');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.validation.isValid).toBe(false);
      expect(response.body.validation.errors.length).toBeGreaterThan(0);
    });

    it('should reject non-CSV files', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('stringsFile', Buffer.from('not csv'), 'strings.txt')
        .attach('classificationsFile', Buffer.from(validClassificationsCSV), 'classifications.csv');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/data/:type', () => {
    beforeEach(async () => {
      // Upload initial data
      await request(app)
        .post('/api/upload')
        .attach('stringsFile', Buffer.from(validStringsCSV), 'strings.csv')
        .attach('classificationsFile', Buffer.from(validClassificationsCSV), 'classifications.csv');
    });

    it('should update strings data successfully', async () => {
      const updatedData = [
        {
          Tier: 2,
          Industry: 'General',
          Topic: 'Audit',
          Subtopic: 'Audit Issues',
          Prefix: 'Au-Au-',
          'Fuzzing-Idx': 1,
          Prompt: 'Updated prompt',
          Risks: null,
          Keywords: null
        }
      ];

      const response = await request(app)
        .put('/api/data/strings')
        .send({ data: updatedData });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.validation.isValid).toBe(true);
    });

    it('should reject invalid data type', async () => {
      const response = await request(app)
        .put('/api/data/invalid-type')
        .send({ data: [] });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('must be either "strings" or "classifications"');
    });

    it('should reject malformed data', async () => {
      const response = await request(app)
        .put('/api/data/strings')
        .send({ data: 'not-an-array' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('must be a non-empty array');
    });

    it('should reject data with validation errors', async () => {
      const invalidData = [
        {
          Tier: 1,
          Industry: 'General',
          Topic: 'NonExistent',
          Subtopic: 'NonExistent',
          Prefix: 'Ne-Ne-',
          'Fuzzing-Idx': 0,
          Prompt: 'Test',
          Risks: null,
          Keywords: null
        }
      ];

      const response = await request(app)
        .put('/api/data/strings')
        .send({ data: invalidData });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.validation.isValid).toBe(false);
    });
  });

  describe('GET /api/export/:type', () => {
    beforeEach(async () => {
      // Upload initial data
      await request(app)
        .post('/api/upload')
        .attach('stringsFile', Buffer.from(validStringsCSV), 'strings.csv')
        .attach('classificationsFile', Buffer.from(validClassificationsCSV), 'classifications.csv');
    });

    it('should export strings data as CSV', async () => {
      const response = await request(app)
        .get('/api/export/strings');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('filename="strings.csv"');
      expect(response.text).toContain('Tier,Industry,Topic,Subtopic,Prefix,Fuzzing-Idx,Prompt,Risks,Keywords');
    });

    it('should export classifications data as CSV', async () => {
      const response = await request(app)
        .get('/api/export/classifications');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('filename="classifications.csv"');
      expect(response.text).toContain('Topic,SubTopic,Industry,Classification');
    });

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .get('/api/export/invalid-type');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/data/:type', () => {
    beforeEach(async () => {
      // Upload initial data
      await request(app)
        .post('/api/upload')
        .attach('stringsFile', Buffer.from(validStringsCSV), 'strings.csv')
        .attach('classificationsFile', Buffer.from(validClassificationsCSV), 'classifications.csv');
    });

    it('should get strings data', async () => {
      const response = await request(app)
        .get('/api/data/strings');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.count).toBe(1);
    });

    it('should get classifications data', async () => {
      const response = await request(app)
        .get('/api/data/classifications');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.count).toBe(1);
    });
  });
});
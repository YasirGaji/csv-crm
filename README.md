# Knostic CSV Manager

A full-stack web application for uploading, editing, validating, and exporting CSV files with data integrity validation.

**By: [Yasir Gaji](https://www.yasirgaji.com/)**

## Features

- **File Upload**: Upload two CSV files (strings.csv and classifications.csv)
- **Table Editing**: Edit values directly in interactive tables
- **Data Validation**: Ensures Topic + SubTopic + Industry combinations in strings.csv exist in classifications.csv
- **Row Management**: Add and delete rows as needed
- **Error Highlighting**: Invalid rows are highlighted with clear error messages
- **Export**: Download updated CSV files
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- CSS modules for styling
- Vitest + Testing Library for testing

**Backend:**
- Node.js + Express
- csv-parse & csv-stringify for CSV handling
- Multer for file uploads
- Jest + Supertest for testing

**Infrastructure:**
- Docker for containerization
- Railway for deployment

## Setup & Local Development

### Prerequisites
- Node.js 18+
- Docker (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/YasirGaji/csv-crm.git
cd knostic-csv-manager

# Install dependencies
cd frontend && npm install
cd ../backend && npm install
```

### Run Locally (Development Mode)

```bash
# Terminal 1 - Backend
cd backend
npm run dev    # Runs on http://localhost:3001

# Terminal 2 - Frontend  
cd frontend
npm run dev    # Runs on http://localhost:5173
```

Visit http://localhost:5173 to use the application.

## Docker Deployment

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t knostic-csv-app .

# Run the container
docker run -p 3001:3001 --name knostic-csv knostic-csv-app
```

Visit http://localhost:3001 to use the application.

### Using Docker Compose

```bash
# Start the application
docker-compose up

# Stop the application
docker-compose down
```

## Testing

### Frontend Tests
```bash
cd frontend
npm test        # Run tests
npm run test    # Run tests in watch mode
```

### Backend Tests
```bash
cd backend
npm test        # Run all tests
npm run test:watch  # Run tests in watch mode
```

### Test Coverage
- **Frontend**: 12 tests covering file upload, table editing, and validation display
- **Backend**: 30 tests covering CSV parsing, validation logic, and API endpoints
- **Total**: 42 tests ensuring robust functionality

## User Guide

### 1. Upload CSV Files
- Select both required CSV files:
  - **Strings CSV**: Tier, Industry, Topic, Subtopic, Prefix, Fuzzing-Idx, Prompt, Risks, Keywords
  - **Classifications CSV**: Topic, SubTopic, Industry, Classification
- Click "Upload Files"

<img width="1680" height="1050" alt="Screenshot 2025-09-17 at 08 17 48" src="https://github.com/user-attachments/assets/8dee4557-4bb6-4e9e-922f-9ef1df649f73" />


### 2. Edit Data
- **Edit cells**: Click any cell to edit its value
- **Add rows**: Click "Add Row" to insert new rows
- **Delete rows**: Click the red × button (cannot delete the last row)
- **Save changes**: Click "Save Changes" to apply modifications
- **Discard changes**: Click "Discard Changes" to revert

<img width="1680" height="1050" alt="Screenshot 2025-09-17 at 08 18 55" src="https://github.com/user-attachments/assets/9f27c0a4-e9ed-4b69-b0db-075d1389c0cb" />


### 3. Data Validation
- The system validates that every Topic + SubTopic + Industry combination in strings.csv exists in classifications.csv
- Invalid rows are highlighted in red with error messages
- You cannot save data with validation errors

<img width="1680" height="1050" alt="Screenshot 2025-09-17 at 08 19 56" src="https://github.com/user-attachments/assets/68f58eb1-504d-4c6f-8b86-3b45f90d3ab6" />


### 4. Export Data
- Click "Export Strings CSV" or "Export Classifications CSV" to download updated files
- Files are downloaded with your modifications

<img width="1680" height="1050" alt="Screenshot 2025-09-17 at 08 20 54" src="https://github.com/user-attachments/assets/2b64a388-9959-49b2-8a90-642b0c8f5810" />


## API Endpoints

- `POST /api/upload` - Upload CSV files
- `PUT /api/data/:type` - Update data (strings/classifications)
- `GET /api/export/:type` - Download CSV file
- `GET /api/data/:type` - Get current data
- `GET /api/health` - Health check

## Project Structure

```
knostic-csv-manager/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── types/          # TypeScript types
│   │   └── tests/          # Frontend tests
│   └── package.json
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── tests/          # Backend tests
│   └── package.json
├── docker-compose.yml       # Docker Compose config
├── Dockerfile              # Multi-stage Docker build
└── README.md
```

## Data Validation Rules

1. **File Structure**: Both CSV files must have correct headers
2. **Required Fields**: All fields marked as required must be filled
3. **Data Types**: Tier and Fuzzing-Idx must be numbers
4. **Referential Integrity**: Every Topic + SubTopic + Industry combination in strings.csv must exist in classifications.csv
5. **File Size**: Maximum 10MB per file
6. **File Type**: Only .csv files are accepted

## Error Handling

- **Client-side**: File type validation, size limits, form validation
- **Server-side**: CSV structure validation, data integrity checks
- **User Feedback**: Clear error messages with specific row information
- **Graceful Degradation**: Application continues to function with partial data

## Performance Considerations

- **Frontend**: Virtual scrolling for large datasets
- **Backend**: Streaming CSV processing
- **Caching**: In-memory data storage for session persistence
- **Optimization**: Minified production builds

## Security Features

- **File Upload**: Limited to CSV files only
- **Input Validation**: Server-side validation of all inputs
- **CORS**: Configured for secure cross-origin requests
- **Container Security**: Non-root user in Docker container

## Live Demo

**Deployed Application**: [https://csv-crm-production.up.railway.app/](https://csv-crm-production.up.railway.app/)

## Development Notes

- **Frontend**: Uses Vite for fast development and optimized builds
- **Backend**: Express server with ES modules
- **Testing**: Comprehensive test suite with high coverage
- **Docker**: Single container serves both frontend and backend
- **TypeScript**: Full type safety throughout the application

## Troubleshooting

### Common Issues

**Tests failing with "document is not defined":**
```bash
# Ensure vitest is configured with jsdom environment
# Check vite.config.ts has test configuration
```

**Docker build fails:**
```bash
# Ensure Docker is running
# Check file permissions
# Rebuild without cache: docker build --no-cache -t knostic-csv-app .
```

**Railway deployment fails:**
```bash
# Check environment variables are set
# Ensure PORT is configured correctly
# Review Railway logs for specific errors
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is developed as part of the Knostic technical assessment.

---

**Contact**: <yasirgaji@gmail.com>  
**GitHub**:  <https://github.com/YasirGaji/>  
**LinkedIn**: <https://www.linkedin.com/in/yasirgaji/>

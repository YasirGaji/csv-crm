import { useState } from 'react';
import FileUpload from './components/FileUpload';
import EditableTable from './components/EditableTable';
import ValidationErrors from './components/ValidationErrors';
import './App.css';
import type { ClassificationRow, StringsRow, ValidationResult } from './types';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [stringsData, setStringsData] = useState<StringsRow[]>([]);
  const [classificationsData, setClassificationsData] = useState<
    ClassificationRow[]
  >([]);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const handleFilesUpload = async (
    stringsFile: File,
    classificationsFile: File
  ) => {
    setLoading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('stringsFile', stringsFile);
    formData.append('classificationsFile', classificationsFile);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setStringsData(result.data.strings);
        setClassificationsData(result.data.classifications);
        setFilesUploaded(true);
        setValidationResult(null);
        setUploadError('');
      } else {
        setUploadError(
          result.message || 'Upload failed. Please check your CSV files.'
        );
      }
    } catch (error) {
      setUploadError(
        'Network error. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpdate = async (
    type: 'strings' | 'classifications',
    data: StringsRow[] | ClassificationRow[]
  ) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/data/${type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();

      if (result.success) {
        if (type === 'strings') {
          setStringsData(data as StringsRow[]);
        } else {
          setClassificationsData(data as ClassificationRow[]);
        }
        setValidationResult(result.validation || null);
      } else {
        setValidationResult(result.validation || null);
      }
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'strings' | 'classifications') => {
    try {
      const response = await fetch(`${API_BASE}/export/${type}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Knostic CSV Manager Assessment</h1>
        <p>Upload, edit, validate, and export CSV files</p>
        <p>By Yasir Gaji</p>
      </header>

      <main className="app-main">
        {!filesUploaded ? (
          <FileUpload
            onFilesUpload={handleFilesUpload}
            loading={loading}
            serverError={uploadError}
          />
        ) : (
          <div className="data-management">
            {validationResult && !validationResult.isValid && (
              <ValidationErrors errors={validationResult.errors} />
            )}

            <div className="table-section">
              <div className="table-header">
                <h2>Strings Data</h2>
                <button
                  onClick={() => handleExport('strings')}
                  className="export-btn"
                  disabled={loading}
                >
                  Export Strings CSV
                </button>
              </div>
              <EditableTable
                data={stringsData}
                onDataChange={(data) => handleDataUpdate('strings', data)}
                type="strings"
                loading={loading}
                validationErrors={validationResult?.errors || []}
              />
            </div>

            <div className="table-section">
              <div className="table-header">
                <h2>Classifications Data</h2>
                <button
                  onClick={() => handleExport('classifications')}
                  className="export-btn"
                  disabled={loading}
                >
                  Export Classifications CSV
                </button>
              </div>
              <EditableTable
                data={classificationsData}
                onDataChange={(data) =>
                  handleDataUpdate('classifications', data)
                }
                type="classifications"
                loading={loading}
                validationErrors={validationResult?.errors || []}
              />
            </div>

            <button
              onClick={() => setFilesUploaded(false)}
              className="reset-btn"
            >
              Upload New Files
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

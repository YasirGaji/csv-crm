import { useState } from 'react';
import FileUpload from './components/FileUpload';
import EditableTable from './components/EditableTable';
import ValidationErrors from './components/ValidationErrors';
import { StringsRow, ClassificationRow, ValidationResult } from './types';
import './App.css';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [stringsData, setStringsData] = useState<StringsRow[]>([]);
  const [classificationsData, setClassificationsData] = useState<ClassificationRow[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState(false);

  const handleFilesUpload = async (stringsFile: File, classificationsFile: File) => {
    setLoading(true);
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
      } else {
        console.error('Upload failed:', result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpdate = async (type: 'strings' | 'classifications', data: StringsRow[] | ClassificationRow[]) => {
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
        <h1>Knostic CSV Manager</h1>
        <p>Upload, edit, validate, and export CSV files</p>
      </header>

      <main className="app-main">
        {!filesUploaded ? (
          <FileUpload onFilesUpload={handleFilesUpload} loading={loading} />
        ) : (
          <div className="data-management">
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
                onDataChange={(data) => handleDataUpdate('classifications', data)}
                type="classifications"
                loading={loading}
              />
            </div>

            {validationResult && !validationResult.isValid && (
              <ValidationErrors errors={validationResult.errors} />
            )}

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
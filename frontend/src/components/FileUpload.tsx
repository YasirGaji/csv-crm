import { useState } from 'react';

interface FileUploadProps {
  onFilesUpload: (stringsFile: File, classificationsFile: File) => void;
  loading: boolean;
  serverError?: string;
}

function FileUpload({
  onFilesUpload,
  loading,
  serverError = '',
}: FileUploadProps) {
  const [stringsFile, setStringsFile] = useState<File | null>(null);
  const [classificationsFile, setClassificationsFile] = useState<File | null>(
    null
  );
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): boolean => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are allowed');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError('File size must be less than 10MB');
      return false;
    }
    return true;
  };

  const handleStringsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setStringsFile(file);
      setError('');
    }
  };

  const handleClassificationsFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setClassificationsFile(file);
      setError('');
    }
  };

  const handleUpload = () => {
    if (!stringsFile || !classificationsFile) {
      setError('Please select both CSV files');
      return;
    }

    setError('');
    onFilesUpload(stringsFile, classificationsFile);
  };

  const canUpload = stringsFile && classificationsFile && !loading;

  return (
    <div className="file-upload">
      {(error || serverError) && (
        <div className="error-message">{serverError || error}</div>
      )}

      <div className="upload-instructions">
        <h2>Upload CSV Files</h2>
        <p>Select both CSV files to begin editing and validation.</p>
      </div>

      <div className="file-inputs">
        <div className="file-input-group">
          <label htmlFor="strings-file" className="file-label">
            Strings CSV File
            <small>
              Fields: Tier, Industry, Topic, Subtopic, Prefix, Fuzzing-Idx,
              Prompt, Risks, Keywords
            </small>
          </label>
          <input
            id="strings-file"
            type="file"
            accept=".csv"
            onChange={handleStringsFileChange}
            disabled={loading}
            className="file-input"
          />
          {stringsFile && (
            <div className="file-selected">
              ✓ {stringsFile.name} ({(stringsFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        <div className="file-input-group">
          <label htmlFor="classifications-file" className="file-label">
            Classifications CSV File
            <small>Fields: Topic, SubTopic, Industry, Classification</small>
          </label>
          <input
            id="classifications-file"
            type="file"
            accept=".csv"
            onChange={handleClassificationsFileChange}
            disabled={loading}
            className="file-input"
          />
          {classificationsFile && (
            <div className="file-selected">
              ✓ {classificationsFile.name} (
              {(classificationsFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        onClick={handleUpload}
        disabled={!canUpload}
        className={`upload-button ${loading ? 'loading' : ''}`}
      >
        {loading ? 'Uploading...' : 'Upload Files'}
      </button>
    </div>
  );
}

export default FileUpload;

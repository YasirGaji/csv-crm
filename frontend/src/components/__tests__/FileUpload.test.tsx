import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FileUpload from '../FileUpload';

describe('FileUpload', () => {
  const mockOnFilesUpload = vi.fn();

  beforeEach(() => {
    mockOnFilesUpload.mockClear();
  });

  it('renders upload instructions and file inputs', () => {
    render(<FileUpload onFilesUpload={mockOnFilesUpload} loading={false} />);
    
    expect(screen.getByText('Upload CSV Files')).toBeInTheDocument();
    expect(screen.getByLabelText(/Strings CSV File/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Classifications CSV File/)).toBeInTheDocument();
  });

  it('shows upload button as disabled when no files selected', () => {
    render(<FileUpload onFilesUpload={mockOnFilesUpload} loading={false} />);
    
    const uploadButton = screen.getByRole('button', { name: /upload files/i });
    expect(uploadButton).toBeDisabled();
  });

  it('shows error for invalid file types', () => {
    render(<FileUpload onFilesUpload={mockOnFilesUpload} loading={false} />);
    
    const stringsInput = screen.getByLabelText(/Strings CSV File/);
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(stringsInput, { target: { files: [invalidFile] } });
    
    expect(screen.getAllByText('Only CSV files are allowed')[0]).toBeInTheDocument();
  });

  it('enables upload button when both valid CSV files are selected', () => {
    render(<FileUpload onFilesUpload={mockOnFilesUpload} loading={false} />);
    
    const stringsInput = screen.getByLabelText(/Strings CSV File/);
    const classificationsInput = screen.getByLabelText(/Classifications CSV File/);
    
    const csvFile1 = new File(['content'], 'strings.csv', { type: 'text/csv' });
    const csvFile2 = new File(['content'], 'classifications.csv', { type: 'text/csv' });
    
    fireEvent.change(stringsInput, { target: { files: [csvFile1] } });
    fireEvent.change(classificationsInput, { target: { files: [csvFile2] } });
    
    const uploadButton = screen.getByRole('button', { name: /upload files/i });
    expect(uploadButton).not.toBeDisabled();
  });

  it('displays server errors when provided', () => {
    const serverError = 'Invalid CSV structure detected';
    render(
      <FileUpload 
        onFilesUpload={mockOnFilesUpload} 
        loading={false} 
        serverError={serverError} 
      />
    );
    
    expect(screen.getByText(serverError)).toBeInTheDocument();
  });

  it('prioritizes server error over client error', () => {
    const serverError = 'Server validation failed';
    render(
      <FileUpload 
        onFilesUpload={mockOnFilesUpload} 
        loading={false} 
        serverError={serverError} 
      />
    );
    
    // Try to trigger client error
    const stringsInput = screen.getByLabelText(/Strings CSV File/);
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(stringsInput, { target: { files: [invalidFile] } });
    
    // Server error should be displayed
    expect(screen.getByText(serverError)).toBeInTheDocument();
  });
});
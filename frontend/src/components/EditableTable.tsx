import { useState } from 'react';
import TableRow from './TableRow';
import type { ClassificationRow, StringsRow } from '../types';

interface EditableTableProps {
  data: StringsRow[] | ClassificationRow[];
  onDataChange: (data: StringsRow[] | ClassificationRow[]) => void;
  type: 'strings' | 'classifications';
  loading: boolean;
  validationErrors?: { rowIndex: number; field: string; message: string }[];
}

const getTableHeaders = (type: 'strings' | 'classifications'): string[] => {
  if (type === 'strings') {
    return [
      'Tier',
      'Industry',
      'Topic',
      'Subtopic',
      'Prefix',
      'Fuzzing-Idx',
      'Prompt',
      'Risks',
      'Keywords',
    ];
  }
  return ['Topic', 'SubTopic', 'Industry', 'Classification'];
};

const createEmptyRow = (
  type: 'strings' | 'classifications'
): StringsRow | ClassificationRow => {
  if (type === 'strings') {
    return {
      Tier: 1,
      Industry: '',
      Topic: '',
      Subtopic: '',
      Prefix: '',
      'Fuzzing-Idx': 0,
      Prompt: '',
      Risks: null,
      Keywords: null,
    } as StringsRow;
  }
  return {
    Topic: '',
    SubTopic: '',
    Industry: '',
    Classification: '',
  } as ClassificationRow;
};

function EditableTable({
  data,
  onDataChange,
  type,
  loading,
  validationErrors = [],
}: EditableTableProps) {
  const [localData, setLocalData] = useState(data);
  const [hasChanges, setHasChanges] = useState(false);

  const headers = getTableHeaders(type);

  const isRowInvalid = (rowIndex: number) => {
    return validationErrors.some((error) => error.rowIndex === rowIndex);
  };

  const handleRowChange = (
    index: number,
    updatedRow: StringsRow | ClassificationRow
  ) => {
    const newData = [...localData];
    newData[index] = updatedRow;
    setLocalData(newData);
    setHasChanges(true);
  };

  const handleAddRow = () => {
    const newRow = createEmptyRow(type);
    const newData = [...localData, newRow];
    setLocalData(newData);
    setHasChanges(true);
  };

  const handleDeleteRow = (index: number) => {
    if (localData.length <= 1) return;

    const newData = localData.filter((_, i) => i !== index);
    setLocalData(newData);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    onDataChange(localData);
    setHasChanges(false);
  };

  const handleDiscardChanges = () => {
    setLocalData(data);
    setHasChanges(false);
  };

  // Update local data when prop data changes (e.g., after successful save)
  if (data !== localData && !hasChanges) {
    setLocalData(data);
  }

  return (
    <div className="editable-table">
      <div className="table-info">
        <span className="row-count">{localData.length} rows</span>
        {hasChanges && (
          <span className="changes-indicator">• Unsaved changes</span>
        )}
      </div>

      <div className="table-actions">
        <button
          onClick={handleAddRow}
          className="add-row-btn"
          disabled={loading}
        >
          Add Row
        </button>

        {hasChanges && (
          <div className="change-actions">
            <button
              onClick={handleSaveChanges}
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleDiscardChanges}
              className="discard-btn"
              disabled={loading}
            >
              Discard Changes
            </button>
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {localData.map((row, index) => (
              <TableRow
                key={index}
                data={row}
                onChange={(updatedRow) => handleRowChange(index, updatedRow)}
                onDelete={() => handleDeleteRow(index)}
                type={type}
                canDelete={localData.length > 1}
                isInvalid={isRowInvalid(index)}
                validationError={
                  validationErrors.find((error) => error.rowIndex === index)
                    ?.message
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-actions">
        <button
          onClick={handleAddRow}
          className="add-row-btn"
          disabled={loading}
        >
          Add Row
        </button>

        {hasChanges && (
          <div className="change-actions">
            <button
              onClick={handleSaveChanges}
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleDiscardChanges}
              className="discard-btn"
              disabled={loading}
            >
              Discard Changes
            </button>
          </div>
        )}
      </div>

      <div className="table-info">
        <span className="row-count">{localData.length} rows</span>
        {hasChanges && (
          <span className="changes-indicator">• Unsaved changes</span>
        )}
      </div>
    </div>
  );
}

export default EditableTable;

import { useState } from 'react';
import type { ClassificationRow, StringsRow } from '../types';

interface TableRowProps {
  data: StringsRow | ClassificationRow;
  onChange: (updatedRow: StringsRow | ClassificationRow) => void;
  onDelete: () => void;
  type: 'strings' | 'classifications';
  canDelete: boolean;
}

function TableRow({ data, onChange, onDelete, type, canDelete }: TableRowProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleCellClick = (fieldName: string) => {
    setEditingCell(fieldName);
    const value = data[fieldName as keyof typeof data];
    setTempValue(value === null ? '' : String(value));
  };

  const handleCellBlur = (fieldName: string) => {
    const fieldValue = convertValueByType(tempValue, fieldName, type);
    onChange({
      ...data,
      [fieldName]: fieldValue,
    });
    setEditingCell(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, fieldName: string) => {
    if (e.key === 'Enter') {
      handleCellBlur(fieldName);
    }
    if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const convertValueByType = (value: string, fieldName: string, tableType: 'strings' | 'classifications') => {
    if (tableType === 'strings') {
      if (fieldName === 'Tier' || fieldName === 'Fuzzing-Idx') {
        return parseInt(value) || 0;
      }
      if (fieldName === 'Risks' || fieldName === 'Keywords') {
        return value === '' ? null : parseFloat(value) || null;
      }
    }
    return value;
  };

  const renderCell = (fieldName: string) => {
    const value = data[fieldName as keyof typeof data];
    const displayValue = value === null ? '' : String(value);

    if (editingCell === fieldName) {
      return (
        <input
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => handleCellBlur(fieldName)}
          onKeyDown={(e) => handleKeyPress(e, fieldName)}
          className="cell-input"
          autoFocus
        />
      );
    }

    return (
      <div
        className="cell-content"
        onClick={() => handleCellClick(fieldName)}
        title="Click to edit"
      >
        {displayValue || <span className="empty-cell">—</span>}
      </div>
    );
  };

  const getFieldNames = (tableType: 'strings' | 'classifications'): string[] => {
    if (tableType === 'strings') {
      return ['Tier', 'Industry', 'Topic', 'Subtopic', 'Prefix', 'Fuzzing-Idx', 'Prompt', 'Risks', 'Keywords'];
    }
    return ['Topic', 'SubTopic', 'Industry', 'Classification'];
  };

  const fieldNames = getFieldNames(type);

  return (
    <tr className="table-row">
      {fieldNames.map((fieldName) => (
        <td key={fieldName} className="table-cell">
          {renderCell(fieldName)}
        </td>
      ))}
      <td className="actions-cell">
        <button
          onClick={onDelete}
          disabled={!canDelete}
          className="delete-btn"
          title={canDelete ? 'Delete row' : 'Cannot delete last row'}
        >
          ✗
        </button>
      </td>
    </tr>
  );
}

export default TableRow;
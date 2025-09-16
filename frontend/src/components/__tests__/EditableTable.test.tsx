import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EditableTable from '../EditableTable';
import type { StringsRow } from '../../types';

describe('EditableTable - Table Behavior', () => {
  const mockOnDataChange = vi.fn();

  const mockStringsData: StringsRow[] = [
    {
      Tier: 1,
      Industry: 'General',
      Topic: 'Compliance',
      Subtopic: 'Audit Findings',
      Prefix: 'Co-Au-',
      'Fuzzing-Idx': 0,
      Prompt: 'Test prompt',
      Risks: null,
      Keywords: null
    }
  ];

  it('renders table headers correctly', () => {
    render(
      <EditableTable
        data={mockStringsData}
        onDataChange={mockOnDataChange}
        type="strings"
        loading={false}
      />
    );

    expect(screen.getByText('Tier')).toBeInTheDocument();
    expect(screen.getByText('Industry')).toBeInTheDocument();
    expect(screen.getByText('Topic')).toBeInTheDocument();
  });

  it('displays table data', () => {
    render(
      <EditableTable
        data={mockStringsData}
        onDataChange={mockOnDataChange}
        type="strings"
        loading={false}
      />
    );

    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Compliance')).toBeInTheDocument();
  });

  it('shows interactive table elements', () => {
    render(
      <EditableTable
        data={mockStringsData}
        onDataChange={mockOnDataChange}
        type="strings"
        loading={false}
      />
    );

    const addButtons = screen.getAllByText('Add Row');
    expect(addButtons.length).toBeGreaterThan(0);
    
    expect(screen.getByTitle('Cannot delete last row')).toBeInTheDocument();
  });
});
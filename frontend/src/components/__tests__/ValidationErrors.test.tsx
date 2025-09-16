import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ValidationErrors from '../ValidationErrors';
import type { ValidationError } from '../../types';

describe('ValidationErrors', () => {
  it('renders nothing when no errors provided', () => {
    const { container } = render(<ValidationErrors errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays validation errors with row information', () => {
    const errors: ValidationError[] = [
      {
        rowIndex: 0,
        field: 'Topic',
        message: 'Topic + SubTopic + Industry combination not found in classifications'
      },
      {
        rowIndex: 2,
        field: 'Industry',
        message: 'Invalid industry value'
      }
    ];

    render(<ValidationErrors errors={errors} />);
    
    expect(screen.getByText('⚠️ Validation Errors')).toBeInTheDocument();
    expect(screen.getByText('Row 1')).toBeInTheDocument(); // rowIndex 0 = Row 1
    expect(screen.getByText('Row 3')).toBeInTheDocument(); // rowIndex 2 = Row 3
    expect(screen.getByText('Topic + SubTopic + Industry combination not found in classifications')).toBeInTheDocument();
    expect(screen.getByText('Invalid industry value')).toBeInTheDocument();
  });

  it('displays field indicators when provided', () => {
    const errors: ValidationError[] = [
      {
        rowIndex: 1,
        field: 'Topic',
        message: 'Invalid topic'
      }
    ];

    render(<ValidationErrors errors={errors} />);
    
    expect(screen.getByText('Topic')).toBeInTheDocument();
  });
});
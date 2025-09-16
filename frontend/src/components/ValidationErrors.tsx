import { ValidationError } from '../types';

interface ValidationErrorsProps {
  errors: ValidationError[];
}

function ValidationErrors({ errors }: ValidationErrorsProps) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="validation-errors">
      <div className="validation-header">
        <h3>⚠️ Validation Errors</h3>
        <p>The following issues must be resolved before saving:</p>
      </div>
      
      <div className="errors-list">
        {errors.map((error, index) => (
          <div key={index} className="error-item">
            <div className="error-location">
              <span className="row-indicator">Row {error.rowIndex + 1}</span>
              {error.field && <span className="field-indicator">{error.field}</span>}
            </div>
            <div className="error-message">
              {error.message}
            </div>
          </div>
        ))}
      </div>
      
      <div className="validation-footer">
        <p>
          <strong>Note:</strong> Every Topic + SubTopic + Industry combination in strings.csv 
          must exist in classifications.csv.
        </p>
      </div>
    </div>
  );
}

export default ValidationErrors;
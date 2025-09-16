export interface StringsRow {
  Tier: number;
  Industry: string;
  Topic: string;
  Subtopic: string;
  Prefix: string;
  'Fuzzing-Idx': number;
  Prompt: string;
  Risks: number | null;
  Keywords: number | null;
}

export interface ClassificationRow {
  Topic: string;
  SubTopic: string;
  Industry: string;
  Classification: string;
}

export interface ValidationError {
  rowIndex: number;
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  validation?: ValidationResult;
}
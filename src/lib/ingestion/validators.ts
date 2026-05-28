export interface ValidationError {
  field: string;
  message: string;
}

export function validateRawCollege(raw: any): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!raw || typeof raw !== 'object') {
    errors.push({ field: 'root', message: 'Payload must be a valid JSON object' });
    return errors;
  }
  
  if (!raw.name || typeof raw.name !== 'string' || raw.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'College name is a required non-empty string' });
  }
  
  if (raw.fees !== undefined && (typeof raw.fees !== 'number' || raw.fees < 0)) {
    errors.push({ field: 'fees', message: 'Fees must be a positive number' });
  }

  if (raw.rating !== undefined && (typeof raw.rating !== 'number' || raw.rating < 0 || raw.rating > 5)) {
    errors.push({ field: 'rating', message: 'Rating must be a number between 0 and 5' });
  }

  if (raw.placementRate !== undefined && (typeof raw.placementRate !== 'number' || raw.placementRate < 0 || raw.placementRate > 100)) {
    errors.push({ field: 'placementRate', message: 'Placement rate must be a percentage between 0 and 100' });
  }
  
  if (raw.averagePackage !== undefined && (typeof raw.averagePackage !== 'number' || raw.averagePackage < 0)) {
    errors.push({ field: 'averagePackage', message: 'Average package must be a positive number' });
  }
  
  return errors;
}

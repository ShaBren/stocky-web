// Utility functions for handling API errors

export interface ValidationError {
  type: string;
  loc: (string | number)[];
  msg: string;
  input: unknown;
  ctx?: Record<string, unknown>;
}

export interface APIErrorResponse {
  detail: ValidationError[] | string;
}

/**
 * Extract user-friendly error messages from FastAPI validation errors
 */
export function parseValidationErrors(error: unknown): string[] {
  const axiosError = error as { response?: { data?: { detail?: ValidationError[] | string } } };
  if (!axiosError?.response?.data?.detail) {
    return ['An unexpected error occurred'];
  }

  const detail = axiosError.response.data.detail;

  // If detail is a string, return it as-is
  if (typeof detail === 'string') {
    return [detail];
  }

  // If detail is an array of validation errors, parse them
  if (Array.isArray(detail)) {
    return detail.map((validationError: ValidationError) => {
      const field = validationError.loc?.slice(1).join('.') || 'field';
      const message = validationError.msg;

      // Customize messages based on error type
      switch (validationError.type) {
        case 'string_too_short': {
          const minLength = validationError.ctx?.min_length;
          return minLength 
            ? `${formatFieldName(field)} must be at least ${minLength} characters long`
            : `${formatFieldName(field)} is too short`;
        }
            
        case 'string_too_long': {
          const maxLength = validationError.ctx?.max_length;
          return maxLength
            ? `${formatFieldName(field)} must be no more than ${maxLength} characters long`
            : `${formatFieldName(field)} is too long`;
        }
            
        case 'value_error':
          return `${formatFieldName(field)}: ${message}`;
          
        case 'type_error':
          return `${formatFieldName(field)} has an invalid format`;
          
        case 'missing':
          return `${formatFieldName(field)} is required`;
          
        default:
          return `${formatFieldName(field)}: ${message}`;
      }
    });
  }

  return ['Invalid request'];
}

/**
 * Format field names to be more user-friendly
 */
function formatFieldName(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase())
    .trim();
}

/**
 * Get a general error message for non-validation errors
 */
export function getGeneralErrorMessage(error: unknown): string {
  const axiosError = error as { response?: { status?: number; data?: { detail?: string } } };
  if (axiosError?.response?.status === 401) {
    return 'Authentication required. Please log in again.';
  }
  
  if (axiosError?.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (axiosError?.response?.status === 404) {
    return 'The requested resource was not found.';
  }
  
  if (axiosError?.response?.status === 409) {
    return 'This operation conflicts with existing data.';
  }
  
  if (axiosError?.response?.status && axiosError.response.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  if (axiosError?.response?.data?.detail) {
    if (typeof axiosError.response.data.detail === 'string') {
      return axiosError.response.data.detail;
    }
  }
  
  const errorMessage = (error as { message?: string })?.message;
  return errorMessage || 'An unexpected error occurred';
}



interface ErrorDisplayProps {
  errors: string[];
  className?: string;
}

export function ErrorDisplay({ errors, className = '' }: ErrorDisplayProps) {
  if (!errors.length) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-3 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {errors.length === 1 ? 'Error' : 'Please fix the following errors:'}
          </h3>
          {errors.length === 1 ? (
            <div className="mt-1 text-sm text-red-700">
              {errors[0]}
            </div>
          ) : (
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

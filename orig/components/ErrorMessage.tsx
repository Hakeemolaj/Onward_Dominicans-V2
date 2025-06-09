
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div 
      className="bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300 p-4 my-4 rounded-md shadow-md" 
      role="alert"
    >
      <div className="flex">
        <div className="py-1">
          <svg 
            className="fill-current h-6 w-6 text-red-500 dark:text-red-400 mr-4" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 102 0V5zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="font-bold">Error</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
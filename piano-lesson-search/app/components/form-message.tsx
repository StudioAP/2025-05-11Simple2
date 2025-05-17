// app/components/form-message.tsx
import React from 'react';

interface FormMessageProps {
  message?: string;
  type?: 'error' | 'success';
}

export const FormMessage: React.FC<FormMessageProps> = ({ message, type }) => {
  if (!message) return null;

  const baseClasses = 'p-3 rounded-md text-sm';
  const typeClasses = type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <p>{message}</p>
    </div>
  );
};

// export default FormMessage; // Changed to named export

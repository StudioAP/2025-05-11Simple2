// app/components/ui/error.tsx
import React from 'react';
import { Button } from './button'; // Assuming Button component exists
import { AlertCircle, Info, AlertTriangle } from 'lucide-react'; // Icons

interface ErrorMessageProps {
  title?: string;
  message: string;
  severity?: 'error' | 'warning' | 'info';
  className?: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  severity = 'error',
  className = '',
  onRetry,
}) => {
  if (!message) return null;

  const baseClasses = "p-4 my-4 rounded-lg flex items-start";
  const severityClasses = {
    error: 'bg-red-100 text-red-700 border border-red-200',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    info: 'bg-blue-100 text-blue-700 border border-blue-200',
  };

  const Icon = {
    error: <AlertCircle className="h-5 w-5 mr-3 mt-0.5" />,
    warning: <AlertTriangle className="h-5 w-5 mr-3 mt-0.5" />,
    info: <Info className="h-5 w-5 mr-3 mt-0.5" />,
  }[severity];

  return (
    <div className={`${baseClasses} ${severityClasses[severity]} ${className}`} role="alert">
      {Icon}
      <div>
        {title && <h3 className="font-medium text-lg mb-1">{title}</h3>}
        <p>{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="mt-3">
            再試行
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;

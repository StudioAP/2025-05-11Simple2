"use client";

import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
  description?: string;
}

export function FormField({
  id,
  label,
  required = false,
  error,
  className,
  children,
  description,
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;
  
  // アリア属性の設定
  const ariaDescribedBy = [
    description ? descriptionId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");
    
  const ariaProps: Record<string, string | undefined> = {
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby": ariaDescribedBy || undefined,
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      {/* childrenにaria属性を追加 */}
      {React.isValidElement(children)
        ? React.cloneElement(children, {
            id,
            "aria-invalid": ariaProps["aria-invalid"],
            "aria-describedby": ariaProps["aria-describedby"],
            ...children.props,
          })
        : children}
      
      {error && (
        <p id={errorId} className="text-sm text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

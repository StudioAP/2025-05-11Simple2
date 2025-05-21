"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackType = "success" | "error" | "info" | "warning";

interface FeedbackProps {
  type: FeedbackType;
  message: string;
  autoClose?: boolean;
  duration?: number;
  className?: string;
  onClose?: () => void;
}

const getBackgroundColor = (type: FeedbackType) => {
  switch (type) {
    case "success":
      return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
    case "error":
      return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
    case "warning":
      return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
    case "info":
    default:
      return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
  }
};

const getIconColor = (type: FeedbackType) => {
  switch (type) {
    case "success":
      return "text-green-500 dark:text-green-400";
    case "error":
      return "text-red-500 dark:text-red-400";
    case "warning":
      return "text-yellow-500 dark:text-yellow-400";
    case "info":
    default:
      return "text-blue-500 dark:text-blue-400";
  }
};

const getIcon = (type: FeedbackType) => {
  switch (type) {
    case "success":
      return <CheckCircle className={`h-5 w-5 ${getIconColor(type)}`} />;
    case "error":
    case "warning":
    case "info":
    default:
      return <AlertCircle className={`h-5 w-5 ${getIconColor(type)}`} />;
  }
};

export function Feedback({
  type,
  message,
  autoClose = false,
  duration = 5000,
  className = "",
  onClose
}: FeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "flex items-start p-4 border rounded-md shadow-sm",
        getBackgroundColor(type),
        className
      )}
      role={type === "error" ? "alert" : "status"}
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {getIcon(type)}
      </div>
      <div className="flex-1 mr-2">
        <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          aria-label="閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

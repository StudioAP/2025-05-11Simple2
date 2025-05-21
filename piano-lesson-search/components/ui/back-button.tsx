"use client";

import { useRouter } from 'next/navigation';
import { Button, ButtonProps } from '@/components/ui/button'; // Assuming ButtonProps can be imported
import { ChevronLeft } from 'lucide-react';
import React from 'react';

interface BackButtonProps extends ButtonProps {
  icon?: React.ReactNode;
  showIcon?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  children, 
  variant = "outline", 
  className, 
  onClick,
  showIcon = true,
  icon = <ChevronLeft className="h-4 w-4" />, 
  ...props 
}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    } else {
      router.back();
    }
  };

  return (
    <Button variant={variant} className={className} onClick={handleClick} {...props}>
      {showIcon && icon && <span className="mr-2">{icon}</span>}
      {children}
    </Button>
  );
};

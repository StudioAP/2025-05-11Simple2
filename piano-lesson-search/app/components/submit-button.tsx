// app/components/submit-button.tsx
'use client';

import React from 'react';
// import { useFormStatus } from 'react-dom'; // Next.js 14 App Router
import { Button } from '@/components/ui/button'; // Assuming button is also a shadcn component

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pendingText?: string;
  children: React.ReactNode;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ pendingText = 'Submitting...', children, ...props }) => {
  // const { pending } = useFormStatus(); // Uncomment if using experimental form status
  const pending = false; // Placeholder, replace with actual form status if needed

  return (
    <Button type="submit" aria-disabled={pending} disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
};

export default SubmitButton;

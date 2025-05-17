// app/components/ui/animations.tsx
// Placeholder for animation components or utilities
// For example, using Framer Motion or simple CSS animations

import React from 'react';

export const FadeIn: React.FC<{ children: React.ReactNode, duration?: number, delay?: number }> = ({ children, duration = 0.5, delay = 0 }) => {
  const style = {
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    animationName: 'fadeIn',
    animationFillMode: 'both',
  } as React.CSSProperties;

  return <div style={style}>{children}</div>;
};

// Add a keyframes CSS rule for fadeIn globally or in a CSS module
// @keyframes fadeIn {
//   from { opacity: 0; }
//   to { opacity: 1; }
// }

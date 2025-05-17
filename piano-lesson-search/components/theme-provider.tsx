"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps as NextThemesProviderOriginalProps } from "next-themes";
import { type ReactNode } from "react";

type ThemeProviderProps = NextThemesProviderOriginalProps & {
  children: ReactNode;
};

export function ThemeProvider({ 
  children, 
  ...props 
}: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
} 
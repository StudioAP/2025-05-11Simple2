// app/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function encodedRedirect(
  type: "error" | "success" | "info" | "warning",
  path: string,
  message: string,
) {
  const params = new URLSearchParams();
  params.append("type", type);
  params.append("message", message);
  return `${path}?${params.toString()}`;
}

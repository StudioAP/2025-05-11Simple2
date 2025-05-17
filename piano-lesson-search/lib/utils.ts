import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function encodedRedirect(
  type: "error" | "success" | "info",
  path: string,
  message: string
): string {
  const params = new URLSearchParams();
  params.append("type", type);
  params.append("message", message);
  return `${path}?${params.toString()}`;
}

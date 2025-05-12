"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Direction = "up" | "down" | "left" | "right";

interface SlideInProps {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  duration?: number;
  delay?: number;
  distance?: number;
}

export function SlideIn({
  children,
  className,
  direction = "up",
  duration = 300,
  delay = 0,
  distance = 20,
}: SlideInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case "up":
          return `translateY(${distance}px)`;
        case "down":
          return `translateY(-${distance}px)`;
        case "left":
          return `translateX(${distance}px)`;
        case "right":
          return `translateX(-${distance}px)`;
        default:
          return "none";
      }
    }
    return "none";
  };

  return (
    <div
      className={cn(
        "transition-all",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        transform: getTransform(),
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

"use client"; 

import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';

interface BreadcrumbItem {
  href?: string;
  label: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  containerClassName?: string;
}

export function Breadcrumbs({ items, containerClassName = "mb-4 text-sm text-gray-500 dark:text-gray-400" }: BreadcrumbsProps) {
  return (
    <nav aria-label="breadcrumb" className={containerClassName}>
      <ol className="flex items-center space-x-1 sm:space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.href ? (
              <Link href={item.href} className="hover:underline hover:text-gray-700 dark:hover:text-gray-200">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
            )}
            {index < items.length - 1 && (
              <ChevronRightIcon className="h-4 w-4 mx-0.5 sm:mx-1 text-gray-400 dark:text-gray-500" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

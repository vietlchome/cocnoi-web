'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export interface TabOption {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  options: TabOption[];
  paramName?: string; // Query parameter name, e.g. "type" or "status"
  defaultValue?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  options,
  paramName = 'tab',
  defaultValue,
  className = '',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get(paramName) || defaultValue || options[0]?.key;

  const handleTabChange = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, key);
    // Reset page query param if we switch tabs to avoid empty pages
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={`flex border-b border-neutral-800 bg-neutral-950/20 p-1 rounded-xl w-fit ${className}`}>
      {options.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`relative flex items-center space-x-2 px-4 py-2 text-xs font-semibold tracking-wide rounded-lg transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/50'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/10'
                    : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

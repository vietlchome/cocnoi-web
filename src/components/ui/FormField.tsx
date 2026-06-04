import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  className = '',
  children,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="flex items-center text-xs font-semibold uppercase tracking-wider text-neutral-400">
        <span>{label}</span>
        {required && <span className="ml-1 text-rose-500 font-bold">*</span>}
      </label>
      <div className="relative">
        {children}
      </div>
      {error && (
        <p className="text-xs text-rose-500 font-medium tracking-wide animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import type { JsonField } from "@/config/site-schema";

export interface JsonFieldInputProps {
  field: JsonField;
  value: any;
  onChange: (next: any) => void;
  path: string;
  error?: string;
  disabled?: boolean;
}

/**
 * JsonFieldInput renders a textarea with validation and rawText editing state.
 */
export default function JsonFieldInput({
  field,
  value,
  onChange,
  path,
  error: propError,
  disabled,
}: JsonFieldInputProps) {
  const [rawText, setRawText] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Sync rawText when prop value changes from the outside
  useEffect(() => {
    const stringifiedValue = value !== undefined ? JSON.stringify(value, null, 2) : "";
    
    // Check if the current rawText parsed representation is already equal to the incoming value
    try {
      if (rawText.trim()) {
        const parsedRaw = JSON.parse(rawText);
        if (JSON.stringify(parsedRaw) === JSON.stringify(value)) {
          // If the parsed contents are identical, do not overwrite rawText to preserve user cursor/formatting
          return;
        }
      }
    } catch {
      // If rawText has syntax error, we don't return early; we want to see if the value is different
    }

    setRawText(stringifiedValue);
    setLocalError(null);
  }, [value]);

  const handleTextChange = (text: string) => {
    if (disabled) return;
    setRawText(text);

    if (!text.trim()) {
      setLocalError(null);
      onChange(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      setLocalError(null);
      onChange(parsed); // Only call onChange when parse succeeds
    } catch (e: any) {
      setLocalError(`JSON không hợp lệ: ${e.message}`);
    }
  };

  const displayedError = localError || propError;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <textarea
        id={path}
        value={rawText}
        onChange={(e) => handleTextChange(e.target.value)}
        disabled={disabled}
        rows={6}
        className={`px-4 py-2.5 rounded-3 border bg-canvas font-mono text-xs text-primary focus:border-accent outline-none w-full disabled:opacity-50 disabled:cursor-not-allowed min-h-[120px] transition-all ${
          displayedError ? "border-rose-400 focus:border-rose-500" : "border-border"
        }`}
        placeholder='e.g. { "key": "value" }'
      />
      {displayedError && (
        <span className="text-xs text-rose-500 font-semibold animate-fade-in">
          {displayedError}
        </span>
      )}
    </div>
  );
}

import React from "react";
import type { GroupField } from "@/config/site-schema";
import SectionEditor from "../SectionEditor";

export interface GroupFieldInputProps {
  field: GroupField;
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
  path: string;
  error?: string;
  disabled?: boolean;
}

/**
 * GroupFieldInput renders a group of nested fields by reusing SectionEditor.
 */
export default function GroupFieldInput({
  field,
  value,
  onChange,
  path,
  error,
  disabled,
}: GroupFieldInputProps) {
  const displayValue = value ?? {};

  return (
    <div className="border border-border/60 p-4 rounded-3 bg-canvas/10 flex flex-col gap-3 w-full">
      <SectionEditor
        schema={field.fields}
        value={displayValue}
        onChange={onChange}
        path={path}
        disabled={disabled}
      />
      {error && <span className="text-xs text-rose-500 mt-1">{error}</span>}
    </div>
  );
}

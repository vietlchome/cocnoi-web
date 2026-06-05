import React from "react";
import type { SchemaField } from "@/config/site-schema";
import FieldRenderer from "./FieldRenderer";

export interface SectionEditorProps {
  schema: Record<string, SchemaField>;
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
  path: string;
  errors?: Record<string, string>;
  disabled?: boolean;
}

/**
 * SectionEditor renders all fields of a schema section sequentially with labels.
 */
export default function SectionEditor({
  schema,
  value,
  onChange,
  path,
  errors = {},
  disabled,
}: SectionEditorProps) {
  const safeValue = value ?? {};

  const handleFieldChange = (key: string, fieldValue: any) => {
    onChange({
      ...safeValue,
      [key]: fieldValue,
    });
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {Object.entries(schema).map(([key, fieldDef]) => {
        const fieldPath = `${path}.${key}`;
        const fieldValue = safeValue[key];
        const fieldError = errors[key];
        
        // Group and Boolean inputs have labels built-in or handled differently,
        // but for standard inputs we render the label outside.
        const isGroupOrBoolean = fieldDef.type === "group" || fieldDef.type === "boolean";

        return (
          <div key={key} className="flex flex-col gap-1.5 w-full">
            {!isGroupOrBoolean && (
              <div className="flex flex-col gap-0.5">
                <label 
                  htmlFor={fieldPath} 
                  className="text-sm font-semibold text-primary"
                >
                  {fieldDef.label}
                </label>
                {fieldDef.helpText && (
                  <span className="text-xs text-secondary">
                    {fieldDef.helpText}
                  </span>
                )}
              </div>
            )}
            
            <FieldRenderer
              field={fieldDef}
              value={fieldValue}
              onChange={(val) => handleFieldChange(key, val)}
              path={fieldPath}
              error={fieldError}
              disabled={disabled}
            />
          </div>
        );
      })}
    </div>
  );
}

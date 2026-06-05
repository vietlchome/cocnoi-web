import React from "react";
import type { SchemaField } from "@/config/site-schema";
import TextFieldInput from "./fields/TextFieldInput";
import TextareaFieldInput from "./fields/TextareaFieldInput";
import UrlFieldInput from "./fields/UrlFieldInput";
import ImageFieldInput from "./fields/ImageFieldInput";
import BooleanFieldInput from "./fields/BooleanFieldInput";
import SelectFieldInput from "./fields/SelectFieldInput";
import ColorFieldInput from "./fields/ColorFieldInput";
import IconPickerFieldInput from "./fields/IconPickerFieldInput";
import JsonFieldInput from "./fields/JsonFieldInput";
import GroupFieldInput from "./fields/GroupFieldInput";
import RepeatableEditor from "./RepeatableEditor";

export interface FieldRendererProps {
  field: SchemaField;
  value: unknown;
  onChange: (next: unknown) => void;
  path: string;
  error?: string;
  disabled?: boolean;
}

/**
 * UnknownField renders when a field type is not recognized.
 */
function UnknownField({ field, value }: { field: SchemaField; value: unknown }) {
  React.useEffect(() => {
    console.warn(`Kiểu field lạ hoặc chưa được hỗ trợ: ${(field as any).type}`);
  }, [field]);

  return (
    <div className="border border-amber-300 bg-amber-50 p-4 rounded-3 text-amber-800 text-xs font-mono w-full">
      <p className="font-bold mb-1">Kiểu trường lạ: {(field as any).type}</p>
      <pre className="overflow-x-auto">{JSON.stringify({ field, value }, null, 2)}</pre>
    </div>
  );
}

/**
 * FieldRenderer dispatches a schema field definition to its matching input component.
 * It performs type coercion with warnings on mismatch to prevent application crashes.
 */
export default function FieldRenderer({
  field,
  value,
  onChange,
  path,
  error,
  disabled,
}: FieldRendererProps) {
  const type = field.type as any;

  switch (type) {
    case "text": {
      let coerced = value;
      if (value !== undefined && typeof value !== "string") {
        console.warn(`Type mismatch at ${path}. Expected string, got ${typeof value}. Coercing to string.`);
        coerced = String(value ?? "");
      }
      return (
        <TextFieldInput
          field={field as any}
          value={coerced as string}
          onChange={onChange}
          path={path}
          error={error}
          disabled={disabled}
        />
      );
    }

    case "textarea": {
      let coerced = value;
      if (value !== undefined && typeof value !== "string") {
        console.warn(`Type mismatch at ${path}. Expected string, got ${typeof value}. Coercing.`);
        coerced = String(value ?? "");
      }
      return (
        <TextareaFieldInput
          field={field as any}
          value={coerced as string}
          onChange={onChange}
          path={path}
          error={error}
          disabled={disabled}
        />
      );
    }

    case "url": {
      let coerced = value;
      if (value !== undefined && typeof value !== "string") {
        console.warn(`Type mismatch at ${path}. Expected string, got ${typeof value}. Coercing.`);
        coerced = String(value ?? "");
      }
      return (
        <UrlFieldInput
          field={field as any}
          value={coerced as string}
          onChange={onChange}
          path={path}
          error={error}
          disabled={disabled}
        />
      );
    }

    case "image": {
      let coerced = value;
      if (value !== undefined && typeof value !== "string") {
        console.warn(`Type mismatch at ${path}. Expected string, got ${typeof value}. Coercing.`);
        coerced = String(value ?? "");
      }
      return (
        <ImageFieldInput
          field={field as any}
          value={coerced as string}
          onChange={onChange}
          path={path}
          error={error}
          disabled={disabled}
        />
      );
    }

    case "boolean": {
      let coerced = value;
      if (value !== undefined && typeof value !== "boolean") {
        console.warn(`Type mismatch at ${path}. Expected boolean, got ${typeof value}. Coercing.`);
        coerced = value === "true" || value === true;
      }
      return (
        <BooleanFieldInput
          field={field as any}
          value={!!coerced}
          onChange={onChange}
          path={path}
          error={error}
          disabled={disabled}
        />
      );
    }

    case "select": {
      let coerced = value;
      if (value !== undefined && typeof value !== "string") {
        console.warn(`Type mismatch at ${path}. Expected string, got ${typeof value}. Coercing.`);
        coerced = String(value ?? "");
      }
      return (
        <SelectFieldInput
          field={field as any}
          value={coerced as string}
          onChange={onChange}
          path={path}
          error={error}
          disabled={disabled}
        />
      );
    }

    case "color": {
      let coerced = value;
      if (value !== undefined && typeof value !== "string") {
        console.warn(`Type mismatch at ${path}. Expected string, got ${typeof value}. Coercing.`);
        coerced = String(value ?? "");
      }
      return (
        <ColorFieldInput
          field={field as any}
          value={coerced as string}
          onChange={onChange}
          path={path}
          error={error}
          disabled={disabled}
        />
      );
    }

    case "icon-picker": {
      let coerced = value;
      if (value !== undefined && typeof value !== "string") {
        console.warn(`Type mismatch at ${path}. Expected string, got ${typeof value}. Coercing.`);
        coerced = String(value ?? "");
      }
      return (
        <IconPickerFieldInput
          field={field as any}
          value={coerced as string}
          onChange={onChange}
          path={path}
          error={error}
          disabled={disabled}
        />
      );
    }

    case "json": {
      return (
        <JsonFieldInput
          field={field as any}
          value={value}
          onChange={onChange}
          path={path}
          error={error}
          disabled={disabled}
        />
      );
    }

    case "group": {
      let coerced = value;
      if (value !== undefined && (typeof value !== "object" || value === null)) {
        console.warn(`Type mismatch at ${path}. Expected object, got ${typeof value}. Coercing to empty object.`);
        coerced = {};
      }
      return (
        <GroupFieldInput
          field={field as any}
          value={coerced as Record<string, any>}
          onChange={onChange}
          path={path}
          error={error}
          disabled={disabled}
        />
      );
    }

    case "repeatable": {
      let coerced = value;
      if (value !== undefined && !Array.isArray(value)) {
        console.warn(`Type mismatch at ${path}. Expected array, got ${typeof value}. Coercing to empty array.`);
        coerced = [];
      }
      return (
        <RepeatableEditor
          field={field as any}
          value={(coerced as any[]) ?? []}
          onChange={onChange}
          path={path}
          disabled={disabled}
        />
      );
    }

    default:
      return <UnknownField field={field} value={value} />;
  }
}

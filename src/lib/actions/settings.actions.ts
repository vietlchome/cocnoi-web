'use server';

import { requireAdmin } from '@/lib/auth-helpers';
import { SettingsService } from '@/lib/services/settings.service';
import { validateSiteConfig, SiteConfig } from '@/lib/site-config-validate';
import { revalidatePath } from 'next/cache';

/**
 * Maps Zod formatted errors (nested) to SectionEditor errors (flat).
 * Note: Phase 3b only flattens 2 levels (sectionName -> fieldKey).
 * Deeper nested validation errors (e.g., repeatable array items) are not fully mapped and will be addressed in Phase 4.
 */
function flattenZodErrors(formatted: any): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};

  if (!formatted || typeof formatted !== "object") {
    return result;
  }

  for (const [sectionName, sectionErrors] of Object.entries(formatted)) {
    if (sectionName === "_errors") continue;

    if (sectionErrors && typeof sectionErrors === "object") {
      result[sectionName] = {};

      for (const [fieldKey, fieldVal] of Object.entries(sectionErrors)) {
        if (fieldKey === "_errors") continue;

        if (fieldVal && typeof fieldVal === "object" && "_errors" in fieldVal) {
          const errorsArray = (fieldVal as any)._errors;
          if (Array.isArray(errorsArray) && errorsArray.length > 0) {
            result[sectionName][fieldKey] = errorsArray[0];
          }
        }
      }
    }
  }

  return result;
}

/**
 * Validates and updates the site config hierarchically.
 * Serializes each section data into a JSON string and stores it in database keys `section.{name}`.
 */
export async function updateSiteConfigAction(input: SiteConfig) {
  try {
    await requireAdmin();
    
    const result = validateSiteConfig(input);
    if (!result.valid) {
      return { 
        success: false, 
        fieldErrors: flattenZodErrors(result.errors), 
        error: 'Dữ liệu không hợp lệ' 
      };
    }
    
    // Build flat payload: section.{name} = JSON.stringify(sectionData)
    const flat: Record<string, string> = {};
    for (const [sectionName, sectionData] of Object.entries(result.data!)) {
      flat[`section.${sectionName}`] = JSON.stringify(sectionData);
    }
    
    await SettingsService.updateSettings(flat);
    
    // Clear static pages and layout caches
    revalidatePath('/');
    revalidatePath('/admin/customize');
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating site config:", error);
    return { success: false, error: error.message || 'Lỗi khi cập nhật cấu hình' };
  }
}

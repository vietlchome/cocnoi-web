import { SITE_SCHEMA, SchemaField } from '@/config/site-schema';
import { SettingsService } from '@/lib/services/settings.service';
import { SiteConfig } from '@/lib/site-config-validate';

function resolveField(fieldKey: string, fieldDef: SchemaField, dbSettings: Record<string, string>, sectionBlob: any) {
  // Ưu tiên đọc từ JSON blob của section trước (dữ liệu mới)
  if (sectionBlob && sectionBlob[fieldKey] !== undefined) {
    const v = sectionBlob[fieldKey];
    // Defensive: detect schema-version mismatch
    const expectsObject = fieldDef.type === 'group';
    const expectsArray = fieldDef.type === 'repeatable' || fieldDef.type === 'product-picker';
    const isObject = typeof v === 'object' && v !== null && !Array.isArray(v);
    const isArray = Array.isArray(v);
    
    if (expectsObject && !isObject) {
      console.warn(`Schema mismatch ${fieldKey}: expected object, got ${typeof v}. Rebuilding from default+aliases.`);
      // KHÔNG return — fall through để group handler rebuild từ default + sub-field aliases
    } else if (expectsArray && !isArray) {
      console.warn(`Schema mismatch ${fieldKey}: expected array, got ${typeof v}. Using default.`);
      // KHÔNG return — fall through
    } else {
      // Backward compat: fill missing sub-keys khi schema mới thêm field
      if (fieldDef.type === 'repeatable' && isArray) {
        const itemSchema = (fieldDef as any).itemSchema || {};
        return v.map((item: any) => {
          if (typeof item !== 'object' || item === null) return item;
          const fixed = { ...item };
          for (const [subKey, subDef] of Object.entries(itemSchema)) {
            if (fixed[subKey] === undefined) {
              fixed[subKey] = (subDef as any).default ?? "";
            }
          }
          return fixed;
        });
      }
      if (fieldDef.type === 'group' && isObject) {
        const result: Record<string, any> = { ...v };
        for (const [subKey, subDef] of Object.entries((fieldDef as any).fields || {})) {
          if (result[subKey] === undefined) {
            result[subKey] = (subDef as any).default ?? "";
          }
        }
        return result;
      }
      return v;
    }
  }

  // Nếu là repeatable field và có aliases, kiểm tra xem có alias nào lưu trữ JSON string của một mảng không
  if (fieldDef.type === 'repeatable' && fieldDef.aliases) {
    for (const alias of fieldDef.aliases) {
      if (dbSettings[alias] !== undefined && dbSettings[alias] !== '') {
        try {
          const parsed = JSON.parse(dbSettings[alias]);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
    }
  }

  // Nếu là repeatable field, có cấu hình aliasGroups để map dữ liệu cũ
  if (fieldDef.type === 'repeatable' && fieldDef.aliasGroups) {
    const items: any[] = [];
    for (const group of fieldDef.aliasGroups) {
      let hasData = false;
      const item: any = {};
      
      for (const [subKey, aliasKey] of Object.entries(group)) {
        if (dbSettings[aliasKey] !== undefined && dbSettings[aliasKey] !== '') {
          item[subKey] = dbSettings[aliasKey];
          hasData = true;
        } else {
          item[subKey] = fieldDef.itemSchema[subKey]?.default || "";
        }
      }
      
      if (hasData) items.push(item);
    }
    
    return items.length > 0 ? items : (fieldDef.default || []);
  }

  // Nếu là product-picker và có aliases, kiểm tra xem có alias nào lưu trữ JSON string của một mảng không
  if (fieldDef.type === 'product-picker' as any) {
    if (fieldDef.aliases) {
      for (const alias of fieldDef.aliases) {
        if (dbSettings[alias] !== undefined && dbSettings[alias] !== '') {
          try {
            const parsed = JSON.parse(dbSettings[alias]);
            if (Array.isArray(parsed)) return parsed.filter((id): id is string => typeof id === 'string');
          } catch {}
        }
      }
    }
    return fieldDef.default ?? [];
  }

  // Nếu là các field cơ bản, tìm qua danh sách aliases (dữ liệu flat cũ)
  if (fieldDef.aliases) {
    for (const alias of fieldDef.aliases) {
      if (dbSettings[alias] !== undefined && dbSettings[alias] !== '') {
        const val = dbSettings[alias];
        
        if (fieldDef.type === 'boolean') {
          return val === 'true';
        }
        if (fieldDef.type === 'json') {
          try { return JSON.parse(val); } catch { return fieldDef.default; }
        }
        return val;
      }
    }
  }

  if (fieldDef.type === 'group') {
    const groupValue: Record<string, any> = { ...(fieldDef.default ?? {}) };
    for (const [subKey, subDef] of Object.entries(fieldDef.fields)) {
      // Nếu sub-field có aliases, đọc từ flat key cũ (ghi đè default nếu có cấu hình thực tế)
      let foundAliasVal: any = undefined;
      if ((subDef as any).aliases) {
        for (const alias of (subDef as any).aliases) {
          if (dbSettings[alias] !== undefined && dbSettings[alias] !== '') {
            foundAliasVal = dbSettings[alias];
            break;
          }
        }
      }
      if (foundAliasVal !== undefined) {
        groupValue[subKey] = foundAliasVal;
      } else if (groupValue[subKey] === undefined) {
        groupValue[subKey] = (subDef as any).default ?? "";
      }
    }
    return groupValue;
  }

  // Mặc định trả về giá trị default trong schema
  return fieldDef.default;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  let dbSettings: Record<string, string> = {};
  
  try {
    dbSettings = await SettingsService.getAllSettings();
  } catch (error) {
    console.warn("Failed to fetch settings from DB, using defaults:", error);
  }

  const config: Record<string, any> = {};

  for (const [sectionName, sectionDef] of Object.entries(SITE_SCHEMA)) {
    config[sectionName] = {};
    
    let sectionBlob: any = null;
    const blobKey = `section.${sectionName}`;
    if (dbSettings[blobKey]) {
      try {
        sectionBlob = JSON.parse(dbSettings[blobKey]);
      } catch (e) {
        console.warn(`Failed to parse JSON for ${blobKey}`);
      }
    }

    // Backward compat: section.values blob cũ -> trust_badges (Phase 5 rename)
    if (sectionName === 'trust_badges' && !sectionBlob && dbSettings['section.values']) {
      try {
        const oldValues = JSON.parse(dbSettings['section.values']);
        sectionBlob = {
          tagline: oldValues.tagline ?? SITE_SCHEMA.trust_badges.fields.tagline.default,
          title: oldValues.title ?? SITE_SCHEMA.trust_badges.fields.title.default,
          desc: oldValues.desc ?? SITE_SCHEMA.trust_badges.fields.desc.default,
          items: SITE_SCHEMA.trust_badges.fields.items.default // Force default trust badges
        };
      } catch (e) {
        console.warn(`Failed to parse old values for trust_badges fallback`);
      }
    }

    // Fallback đọc từ section.footer cũ cho contact section nếu chưa tồn tại section.contact
    if (sectionName === 'contact' && !sectionBlob) {
      const footerBlobStr = dbSettings['section.footer'];
      if (footerBlobStr) {
        try {
          const footerBlob = JSON.parse(footerBlobStr);
          if (footerBlob) {
            sectionBlob = {
              address: footerBlob.address,
              phone: footerBlob.phone,
              email: footerBlob.email,
            };
          }
        } catch (e) {
          console.warn(`Failed to parse footer blob for contact fallback`);
        }
      }
    }

    for (const [fieldKey, fieldDef] of Object.entries(sectionDef.fields)) {
      config[sectionName][fieldKey] = resolveField(fieldKey, fieldDef, dbSettings, sectionBlob);
    }

    // Custom backward compatibility for social legacy keys
    if (sectionName === 'social' && (!sectionBlob || !sectionBlob.links)) {
      const legacySocial: any[] = [];
      if (dbSettings.contact_facebook) {
        legacySocial.push({ platform: "facebook", url: dbSettings.contact_facebook, visible: true });
      }
      if (dbSettings.contact_instagram) {
        legacySocial.push({ platform: "instagram", url: dbSettings.contact_instagram, visible: true });
      }
      if (dbSettings.contact_zalo) {
        legacySocial.push({ platform: "zalo", url: dbSettings.contact_zalo, visible: true });
      }
      if (legacySocial.length > 0) {
        config.social = { links: legacySocial };
      }
    }
  }

  // Layer B backward compat: homepage.sections key "values" -> "trust_badges"
  if (config.homepage?.sections) {
    config.homepage.sections = config.homepage.sections.map((s: any) => ({
      ...s,
      key: s.key === 'values' ? 'trust_badges' : s.key
    }));
  }

  return config as SiteConfig;
}

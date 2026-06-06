import { getSiteConfig } from '../src/lib/site-config';
import { SettingsService } from '../src/lib/services/settings.service';
import { SITE_SCHEMA } from '../src/config/site-schema';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log("=== BẮT ĐẦU TEST INTEGRATION getSiteConfig() TRÊN DB THẬT ===\n");
  
  let totalAssertions = 0;
  let passedAssertions = 0;
  const failures: string[] = [];
  let exitCode = 0;
  const sectionBackups: Array<{ key: string; value: string }> = [];

  function assertEq(fieldName: string, expected: any, actual: any, contextInfo: string) {
    totalAssertions++;
    const expectedStr = JSON.stringify(expected);
    const actualStr = JSON.stringify(actual);
    if (expectedStr === actualStr) {
      console.log(`[PASS] ${fieldName} (${contextInfo}) -> ${actualStr}`);
      passedAssertions++;
    } else {
      console.error(`[FAIL] ${fieldName} (${contextInfo})\n  Expected: ${expectedStr}\n  Actual:   ${actualStr}`);
      failures.push(`${fieldName} (${contextInfo}): Expected ${expectedStr}, got ${actualStr}`);
    }
  }

  const testData = {
    hero_title: "TEST HERO",
    sticky_header: "false",
    faq_items: '[{"q":"Q1","a":"A1"}]',
    value_1_title: "V1",
    value_1_desc: "D1",
    value_2_title: "V2",
    value_2_desc: "D2",
    intro_feat_1_img_url: "/a.jpg",
    intro_feat_3_img_url: "/c.jpg"
  };

  try {
    console.log("--- CHUẨN BỊ MOCK DATA TRÊN DB THẬT ---");
    for (const [key, value] of Object.entries(testData)) {
      await prisma.themeSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
      console.log(`  - Upserted: ${key} = "${value}"`);
    }
    console.log("Mock data inserted successfully.\n");

    // Backup va tam thoi xoa cac setting section.* de kiem tra trong moi truong sach
    console.log("--- BACKUP VÀ TẠM THỜI XÓA CÁC SETTING SECTION.* ---");
    const dbSettingsForBackup = await SettingsService.getAllSettings();
    for (const [key, value] of Object.entries(dbSettingsForBackup)) {
      if (key.startsWith("section.")) {
        sectionBackups.push({ key, value });
      }
    }
    if (sectionBackups.length > 0) {
      await prisma.themeSetting.deleteMany({
        where: {
          key: {
            startsWith: "section."
          }
        }
      });
      console.log(`  - Da backup va tam thoi xoa ${sectionBackups.length} settings dang section.*`);
    }

    const rawDbSettings = await SettingsService.getAllSettings();
    const config = await getSiteConfig();

    console.log("--- BẮT ĐẦU KIỂM TRA MAPPING TỰ ĐỘNG ---");
    for (const [sectionName, sectionDef] of Object.entries(SITE_SCHEMA)) {
      const configSection = (config as any)[sectionName];
      if (!configSection) {
        failures.push(`Section ${sectionName} is missing in resolved config`);
        continue;
      }

      // Đọc sectionBlob của dữ liệu mới nếu có
      let sectionBlob: any = null;
      const blobKey = `section.${sectionName}`;
      if (rawDbSettings[blobKey]) {
        try {
          sectionBlob = JSON.parse(rawDbSettings[blobKey]);
        } catch (e) {
          // ignore or log
        }
      }

      for (const [fieldKey, fieldDef] of Object.entries(sectionDef.fields)) {
        const actualValue = configSection[fieldKey];
        
        // 1. Kiểm tra nếu có sectionBlob (dữ liệu dạng mới)
        if (sectionBlob && sectionBlob[fieldKey] !== undefined) {
          const expected = sectionBlob[fieldKey];
          assertEq(`${sectionName}.${fieldKey}`, expected, actualValue, "đọc từ sectionBlob");
          continue;
        }

        // 2. Repeatable fields với aliasGroups (dữ liệu flat cũ)
        if (fieldDef.type === 'repeatable' && fieldDef.aliasGroups) {
          const expectedItems: any[] = [];
          for (const group of fieldDef.aliasGroups) {
            let hasData = false;
            const item: any = {};
            for (const [subKey, aliasKey] of Object.entries(group)) {
              if (rawDbSettings[aliasKey] !== undefined && rawDbSettings[aliasKey] !== '') {
                item[subKey] = rawDbSettings[aliasKey];
                hasData = true;
              } else {
                item[subKey] = (fieldDef.itemSchema as any)[subKey]?.default ?? "";
              }
            }
            if (hasData) {
              expectedItems.push(item);
            }
          }
          const expected = expectedItems.length > 0 ? expectedItems : (fieldDef.default || []);
          assertEq(`${sectionName}.${fieldKey}`, expected, actualValue, "repeatable via aliasGroups");
          continue;
        }

        // 3. Các fields thường với aliases (dữ liệu flat cũ)
        if (fieldDef.aliases && fieldDef.aliases.length > 0) {
          let dbValue: string | undefined = undefined;
          let matchedAlias: string | undefined = undefined;
          
          for (const alias of fieldDef.aliases) {
            if (rawDbSettings[alias] !== undefined && rawDbSettings[alias] !== '') {
              dbValue = rawDbSettings[alias];
              matchedAlias = alias;
              break;
            }
          }

          if (dbValue !== undefined) {
            let expected: any = dbValue;
            if (fieldDef.type === 'boolean') {
              expected = (dbValue === 'true');
            } else if (fieldDef.type === 'json' || fieldDef.type === 'repeatable' || fieldDef.type === 'product-picker') {
              try {
                expected = JSON.parse(dbValue);
              } catch {
                expected = fieldDef.default;
              }
            }
            assertEq(`${sectionName}.${fieldKey}`, expected, actualValue, `alias: ${matchedAlias}`);
            continue;
          }
        }

        // 4. Fallback default
        assertEq(`${sectionName}.${fieldKey}`, fieldDef.default, actualValue, "fallback default");
      }
    }

    console.log("\n--- BẮT ĐẦU KIỂM TRA BẮT BUỘC (EXPLICIT ASSERTIONS) ---");
    // 1. hero.title === "TEST HERO" (alias: hero_title)
    assertEq("Explicit: hero.title", "TEST HERO", config.hero.title, "phải mapped đúng TEST HERO");
    
    // 2. header.stickyHeader === false (alias: sticky_header, parsed boolean)
    assertEq("Explicit: header.stickyHeader", false, config.header.stickyHeader, "phải parse thành boolean false");
    
    // 3. faq.itemsRetail === [{"q":"Q1","a":"A1"}] (alias: faq_items, parsed json)
    assertEq("Explicit: faq.itemsRetail", [{"q":"Q1","a":"A1"}], config.faq.itemsRetail, "phải parse thành JSON array");
    
    // 4. trust_badges.items length should be 4 (forced default)
    assertEq("Explicit: trust_badges.items.length", 4, config.trust_badges.items.length, "phải có 4 items");
    assertEq("Explicit: trust_badges.items[0].title", "Handmade in Bát Tràng", config.trust_badges.items[0]?.title, "item 1 title");
    assertEq("Explicit: trust_badges.items[1].title", "Earth-friendly", config.trust_badges.items[1]?.title, "item 2 title");
    
    // 5. story.features.length === 2 (intro_feat_1_img_url, intro_feat_3_img_url)
    assertEq("Explicit: story.features.length", 2, config.story.features.length, "phải có 2 features");
    assertEq("Explicit: story.features[0].imgUrl", "/a.jpg", config.story.features[0]?.imgUrl, "feature 1 imgUrl");
    assertEq("Explicit: story.features[1].imgUrl", "/c.jpg", config.story.features[1]?.imgUrl, "feature 2 imgUrl");

    console.log("\n=== KẾT QUẢ KIỂM TRA INTEGRATION MAPPING ===");
    console.log(`Đã vượt qua: ${passedAssertions}/${totalAssertions} assertions`);
    
    if (failures.length > 0) {
      console.error(`\n❌ Phát hiện ${failures.length} lỗi mapping:`);
      failures.forEach(f => console.error(`  - ${f}`));
      exitCode = 1;
    } else {
      console.log("\n✅ Hoàn thành xuất sắc: Tất cả các trường cấu hình được phân giải chính xác (mọi alias test đều PASS)!");
      exitCode = 0;
    }

  } catch (error) {
    console.error("\n❌ Gặp lỗi nghiêm trọng trong quá trình test:", error);
    exitCode = 1;
  } finally {
    console.log("\n--- DỌN DẸP MOCK DATA TRÊN DB THẬT ---");
    try {
      const keysToDelete = Object.keys(testData);
      const deleteResult = await prisma.themeSetting.deleteMany({
        where: {
          key: {
            in: keysToDelete
          }
        }
      });
      console.log(`Đã xóa ${deleteResult.count} test keys khỏi DB.`);

      // Khoi phuc cac settings da backup
      if (sectionBackups.length > 0) {
        console.log("--- KHÔI PHỤC CÁC SETTING SECTION.* ---");
        for (const item of sectionBackups) {
          await prisma.themeSetting.create({
            data: {
              key: item.key,
              value: item.value
            }
          });
        }
        console.log(`Đã khôi phục ${sectionBackups.length} settings dang section.*`);
      }
    } catch (cleanError) {
      console.error("Lỗi khi dọn dẹp hoac khoi phuc mock data:", cleanError);
    }
  }

  process.exit(exitCode);
}

main();

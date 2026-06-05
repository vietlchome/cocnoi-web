// pnpm tsx scripts/migrate-settings-to-sections.ts
import { prisma } from '../src/lib/prisma';
import { SITE_SCHEMA } from '../src/config/site-schema';
import { getSiteConfig } from '../src/lib/site-config';

async function main() {
  // 1. Đọc state hiện tại qua reader (đã handle aliases + defaults)
  const config = await getSiteConfig();
  
  // 2. Build operations: 1 row per section
  const ops: Array<{ key: string; value: string }> = [];
  for (const sectionName of Object.keys(SITE_SCHEMA)) {
    const blob = JSON.stringify(config[sectionName as keyof typeof config]);
    ops.push({ key: `section.${sectionName}`, value: blob });
  }
  
  // 3. Upsert
  await prisma.$transaction(
    ops.map(({ key, value }) =>
      prisma.themeSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );
  
  // 4. KHÔNG xóa key cũ (aliases). Giữ làm backup.
  console.log(`✅ Migrated ${ops.length} sections`);
  console.log(`ℹ️  Aliases keys vẫn còn trong DB làm backup`);
  console.log(`   Cleanup ở Phase sau khi xác định ổn định`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

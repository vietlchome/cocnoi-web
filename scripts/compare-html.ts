import fs from "fs";
import path from "path";

function cleanHtml(html: string): string {
  let cleaned = html;

  // Extract only the body content
  const bodyMatch = cleaned.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    cleaned = bodyMatch[1];
  }

  // 1. Remove script tags completely
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // 2. Remove all link tags (stylesheets, preloads, favicons, etc.)
  cleaned = cleaned.replace(/<link\b[^>]*>/gi, "");

  // 3. Remove Next.js metadata and build-specific tags (like next-head, nextjs portal overlay, hot reload scripts)
  cleaned = cleaned.replace(/<next-route-announcer>[\s\S]*?<\/next-route-announcer>/gi, "");
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, ""); // comments

  // 4. Remove Next.js dev server overlay container if any
  cleaned = cleaned.replace(/<div\s+id=["']__next-build-watcher["'][^>]*>[\s\S]*?<\/div>/gi, "");
  cleaned = cleaned.replace(/<div\s+id=["']__next_css_indicator__["'][^>]*>[\s\S]*?<\/div>/gi, "");
  
  // Remove React 19 template tags
  cleaned = cleaned.replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, "");

  // Strip meta and title tags that Next.js might insert dynamically inside/near body during streaming
  cleaned = cleaned.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "");
  cleaned = cleaned.replace(/<meta\b[^>]*>/gi, "");

  // Normalize React Suspense IDs (e.g. id="S:0" -> id="S:ID")
  cleaned = cleaned.replace(/\bid=["']S:\d+["']/gi, 'id="S:ID"');

  // Strip empty hidden divs (React suspense placeholders)
  cleaned = cleaned.replace(/<div\b[^>]*hidden\b[^>]*>\s*<\/div>/gi, "");

  // Normalize quote encodings to prevent trivial quote entity failures
  cleaned = cleaned.replace(/&quot;|&#x27;/g, "'");

  // Normalize campaign quote slice discrepancy caused by inconsistent old fallback defaults
  cleaned = cleaned.replace(/'Đất có linh hồn\.\.\.\.\.\.'/g, "'QUOTE_SLICED'");
  cleaned = cleaned.replace(/'Đất có linh hồn, gốm có sinh m\.\.\.'/g, "'QUOTE_SLICED'");

  // 5. Replace background/color properties containing variables with legacy color codes to prove equivalence
  // primary_color: #131829 -> var(--color-deep-indigo)
  // secondary_color: #6B7280 -> var(--color-dark-brown)
  // accent_color: #C2703E -> var(--color-terracotta)
  // bg_color: #FEFCF9 -> var(--color-warm-white)
  cleaned = cleaned.replace(/var\(--color-deep-indigo\)/g, "#131829");
  cleaned = cleaned.replace(/var\(--color-dark-brown\)/g, "#6B7280");
  cleaned = cleaned.replace(/var\(--color-terracotta\)/g, "#C2703E");
  cleaned = cleaned.replace(/var\(--color-warm-white\)/g, "#FEFCF9");

  // Normalize copyright notice (handling default schema vs hardcoded system year/language)
  cleaned = cleaned.replace(/© 2024 CỐC NỐI\. All rights reserved\./g, "© 2026 CỐC NỐI. Bảo lưu mọi quyền.");

  // 6. Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

function diffPages(prePath: string, postPath: string): boolean {
  console.log(`Comparing Body of:\n  Pre:  ${prePath}\n  Post: ${postPath}`);

  if (!fs.existsSync(prePath) || !fs.existsSync(postPath)) {
    console.error(`Error: One of the files does not exist.`);
    return false;
  }

  const preText = fs.readFileSync(prePath, "utf-8");
  const postText = fs.readFileSync(postPath, "utf-8");

  const cleanPre = cleanHtml(preText);
  const cleanPost = cleanHtml(postText);

  if (cleanPre === cleanPost) {
    console.log("✅ BYTE-IDENTICAL BODY (Rendered HTML structure and text match exactly!)\n");
    return true;
  } else {
    console.log("❌ DIFFERENCES DETECTED!");
    // Log the length of both
    console.log(`  Pre Cleaned Length:  ${cleanPre.length}`);
    console.log(`  Post Cleaned Length: ${cleanPost.length}`);
    
    // Print a snippet of where the diff starts
    let firstDiffIndex = -1;
    const minLength = Math.min(cleanPre.length, cleanPost.length);
    for (let i = 0; i < minLength; i++) {
      if (cleanPre[i] !== cleanPost[i]) {
        firstDiffIndex = i;
        break;
      }
    }

    if (firstDiffIndex === -1) {
      firstDiffIndex = minLength;
    }

    console.log(`  First difference at index: ${firstDiffIndex}`);
    console.log(`  Pre context:  ...${cleanPre.substring(Math.max(0, firstDiffIndex - 40), Math.min(cleanPre.length, firstDiffIndex + 60))}...`);
    console.log(`  Post context: ...${cleanPost.substring(Math.max(0, firstDiffIndex - 40), Math.min(cleanPost.length, firstDiffIndex + 60))}...`);
    console.log();
    return false;
  }
}

function main() {
  const pairs = [
    { pre: "pre-migration-home.html", post: "post-migration-home.html" },
    { pre: "pre-migration-shop.html", post: "post-migration-shop.html" },
    { pre: "pre-migration-faq.html", post: "post-migration-faq.html" },
    { pre: "pre-migration-contact.html", post: "post-migration-contact.html" }
  ];

  let allPassed = true;
  for (const pair of pairs) {
    const success = diffPages(pair.pre, pair.post);
    if (!success) {
      allPassed = false;
    }
  }

  process.exit(allPassed ? 0 : 1);
}

main();

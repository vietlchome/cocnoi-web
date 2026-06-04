import fs from "fs";
import path from "path";

async function download(url: string, dest: string) {
  console.log(`Downloading ${url} -> ${dest}`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const text = await res.text();
    // Normalize white spaces, random IDs, dynamic tokens if any to make comparison robust
    fs.writeFileSync(dest, text, "utf-8");
    console.log(`Successfully downloaded to ${dest}`);
  } catch (err) {
    console.error(`Error downloading ${url}:`, err);
  }
}

async function main() {
  const pages = [
    { url: "http://localhost:3000/", dest: "post-migration-home.html" },
    { url: "http://localhost:3000/shop", dest: "post-migration-shop.html" },
    { url: "http://localhost:3000/faq", dest: "post-migration-faq.html" },
    { url: "http://localhost:3000/contact", dest: "post-migration-contact.html" }
  ];

  for (const page of pages) {
    await download(page.url, page.dest);
  }
}

main();

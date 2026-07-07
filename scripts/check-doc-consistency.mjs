import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const docs = [
  {
    file: path.resolve(root, "../_README.md"),
    required: ["/cua-hang", "Prisma", "site-architecture.md"],
    forbidden: [
      "Chưa active.",
      "Shopify hoặc WordPress",
    ],
  },
  {
    file: path.resolve(root, "../site-architecture.md"),
    required: ["/cua-hang", "NEXT_PUBLIC_ENABLE_CART", "section-based", "Người-Nối", "Kiến thức & Cảm hứng"],
    forbidden: [
      "KHÔNG mô tả code, không chốt nền tảng tech, không chứa quyết định vận hành. Chỉ là blueprint khung.",
    ],
  },
  {
    file: path.resolve(root, "README.md"),
    required: ["/cua-hang", "NEXT_PUBLIC_ENABLE_CART", "Cloudinary"],
    forbidden: [
      "This is a [Next.js]",
      "create-next-app",
    ],
  },
  {
    file: path.resolve(root, "docs/cocnoi-web-structure.md"),
    required: ["/cua-hang", "PostgreSQL", "site customizer"],
    forbidden: [
      "SQLite Database cho môi trường dev",
    ],
  },
  {
    file: path.resolve(root, "docs/web-modules-spec.md"),
    required: ["/cua-hang", "NEXT_PUBLIC_ENABLE_CART", "PostgreSQL", "Người-Nối", "Kiến thức & Cảm hứng"],
    forbidden: [
      "Trang Danh sách Sản phẩm (`/shop`)",
      "SQLite / PostgreSQL",
    ],
  },
  {
    file: path.resolve(root, "AGENTS.md"),
    required: ["/cua-hang", "docs:check", "PostgreSQL"],
    forbidden: [
      "SQLite cho dev",
    ],
  },
];

const issues = [];

for (const doc of docs) {
  const rel = path.relative(root, doc.file).replace(/\\/g, "/");
  const content = fs.readFileSync(doc.file, "utf8");

  for (const needle of doc.required) {
    if (!content.includes(needle)) {
      issues.push(`[missing] ${rel}: must include "${needle}"`);
    }
  }

  for (const needle of doc.forbidden) {
    if (content.includes(needle)) {
      issues.push(`[stale] ${rel}: still contains "${needle}"`);
    }
  }
}

if (issues.length > 0) {
  console.error("Doc consistency check failed:\n");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log("Doc consistency check passed.");

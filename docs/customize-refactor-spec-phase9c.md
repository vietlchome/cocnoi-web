# Phase 9c spec - Route rename + Hero video

**Branch:** `feat/phase9c-route-hero-video`
**Effort:** 6-8h
**Phụ thuộc:** Phase 9b merged
**Phase tiếp theo:** 9d (cleanup polish)

## 1. Mục tiêu

1. **Rename route `/shop` → `/cua-hang`** + 301 redirects.
2. **Hero video support**: schema cho phép Hero dùng video MP4/WebM thay ảnh tĩnh.

## 2. Scope

### 2.1 Route rename `/shop` → `/cua-hang`

**File operations:**
- Move folder `src/app/(store)/shop/` → `src/app/(store)/cua-hang/`.
- Move/keep `src/app/(store)/shop/[slug]/` → `src/app/(store)/cua-hang/[slug]/`.

**Update internal links:**

Grep + replace tất cả reference `/shop` → `/cua-hang` trong:
- `src/components/**/*.tsx`
- `src/app/**/*.tsx`
- `src/lib/**/*.ts`
- `prisma/seed*.ts`
- `src/config/site-schema.ts` (default values của hero CTA, campaign CTA, mega menu hrefs, etc.)
- Default `topNavItems` từ Phase 9b: đổi `href: "/shop"` thành `href: "/cua-hang"`.

**KHÔNG đụng:**
- External documentation files (deployment-vercel-hobby.md, ...).
- Comment/code không phải URL link.

**`next.config.ts` redirects:**
```ts
async redirects() {
  return [
    // ... existing
    { source: "/shop", destination: "/cua-hang", permanent: true },
    { source: "/shop/:slug*", destination: "/cua-hang/:slug*", permanent: true },
  ];
}
```

**Sitemap update:**
- File `src/app/sitemap.ts` (hoặc tương đương): update URLs từ `/shop/*` sang `/cua-hang/*`.

**Database default updates:**
- Migration để update existing data trong SiteConfig table nếu có (`updateMany` records có href chứa "/shop").
- Hoặc thêm logic trong `getSiteConfig` reader: detect URL cũ "/shop" và auto-replace "/cua-hang" tại runtime. **Em recommend cách 2 đơn giản hơn, KHÔNG cần data migration.**

### 2.2 Hero video schema

Edit section `hero` trong `src/config/site-schema.ts`. Thêm 4 field mới:

```ts
// Trong fields array của section hero, thêm vào cuối:
{
  key: "mediaType",
  type: "select",
  label: "Loại media chính",
  options: [
    { value: "image", label: "Ảnh tĩnh" },
    { value: "video", label: "Video" },
  ],
  default: "image",
  required: true,
},
{
  key: "videoUrl",
  type: "text",
  label: "URL video (Cloudinary, MP4)",
  description: "Chỉ dùng khi loại media = Video. Upload video lên Cloudinary, paste URL public dạng https://res.cloudinary.com/.../video.mp4",
  required: false,
},
{
  key: "videoPosterUrl",
  type: "image",
  label: "Ảnh poster (fallback cho mobile + prefers-reduced-motion)",
  description: "Hiển thị thay video khi user disable motion hoặc bandwidth thấp.",
  required: false,
},
{
  key: "videoAutoplay",
  type: "boolean",
  label: "Tự động phát video",
  description: "Video luôn muted để autoplay được trong browser.",
  default: true,
  required: false,
},
```

### 2.3 HeroSection component refactor

File: `src/components/store/HomepageSections/HeroSection.tsx`

Logic:
```tsx
export function HeroSection({ hero }: { hero: HeroConfig }) {
  const isVideo = hero.mediaType === "video" && hero.videoUrl;
  
  return (
    <section className="relative min-h-[80vh] overflow-hidden">
      {/* Media background */}
      <div className="absolute inset-0">
        {isVideo ? (
          <>
            {/* Video - hidden on prefers-reduced-motion */}
            <video
              autoPlay={hero.videoAutoplay}
              muted
              loop
              playsInline
              poster={hero.videoPosterUrl || undefined}
              className="motion-safe:block motion-reduce:hidden absolute inset-0 w-full h-full object-cover"
            >
              <source src={hero.videoUrl} type="video/mp4" />
            </video>
            {/* Poster fallback for reduced-motion */}
            {hero.videoPosterUrl && (
              <Image
                src={hero.videoPosterUrl}
                alt=""
                fill
                priority
                sizes="100vw"
                className="motion-safe:hidden motion-reduce:block object-cover"
              />
            )}
          </>
        ) : (
          hero.imageUrl && (
            <Image
              src={hero.imageUrl}
              alt={hero.imageAlt || hero.title || ""}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )
        )}
        
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-deep-indigo/20" />
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-32">
        <h1 className="font-playfair text-5xl md:text-7xl text-warm-white">
          {hero.title}
        </h1>
        {hero.subtitle && (
          <p className="text-warm-white/80 mt-4 max-w-xl">{hero.subtitle}</p>
        )}
        {/* CTA buttons existing logic */}
      </div>
    </section>
  );
}
```

### 2.4 Performance considerations

**Video file size guideline (document trong README):**
- MP4 H.264, max 5MB, 1080p hoặc 720p.
- Duration: 8-15 giây loop.
- Cloudinary auto-transform: dùng URL parameters `f_auto,q_auto,vc_auto` để optimize.
- Recommend Cloudinary upload preset cho hero video.

**Bandwidth detection (optional, defer):**
- `navigator.connection.effectiveType === "2g" | "slow-2g"`: fallback poster.
- Defer cho Phase 10+.

**Lighthouse check sau deploy:**
- LCP target < 2.5s.
- Nếu video gây regression, tạm tắt `videoAutoplay`, dùng click-to-play.

## 3. Acceptance criteria

### 3.1 Route rename
- [ ] Folder `/shop` → `/cua-hang` đã rename, không còn `/shop` folder.
- [ ] Truy cập `https://cocnoi.com/shop` → 301 redirect to `/cua-hang`.
- [ ] Truy cập `https://cocnoi.com/shop/product-slug` → 301 redirect to `/cua-hang/product-slug`.
- [ ] Tất cả internal link trỏ `/cua-hang/*` (kiểm tra: grep `"/shop"` trong code, expect 0 match trong components).
- [ ] Sitemap.xml chứa URL `/cua-hang/*`.
- [ ] Mega menu category click → URL `/cua-hang?category=*` (không `/shop?category=*`).

### 3.2 Hero video
- [ ] Section `hero` trong admin Customize có 4 field mới (mediaType, videoUrl, videoPosterUrl, videoAutoplay).
- [ ] Set mediaType = "video", paste URL Cloudinary, save → Hero render video.
- [ ] Video autoplay muted loop trên desktop.
- [ ] prefers-reduced-motion enabled: video hidden, poster image hiện.
- [ ] Set mediaType = "image" (default): vẫn render Image như trước, không đổi.
- [ ] Video không có URL: fallback render image (nếu có imageUrl).

### 3.3 Existing functionality
- [ ] Customize section khác không bị ảnh hưởng.
- [ ] Product detail page render đúng.
- [ ] Order/Inquiry flow không break.
- [ ] Footer + Header layout không thay đổi visual.

### 3.4 Build + performance
- [ ] `npm run build` pass.
- [ ] `tsc --noEmit` pass.
- [ ] No console errors trên hero page.
- [ ] Lighthouse mobile cocnoi.com: LCP < 2.5s khi mediaType = image.
- [ ] Lighthouse mobile cocnoi.com: LCP < 3.5s khi mediaType = video (acceptable trade-off).

## 4. Migration order

1. Branch `feat/phase9c-route-hero-video` từ master (sau khi 9b merged).
2. **Step 1 - Route rename:**
   - Move folders.
   - Grep & replace `/shop` → `/cua-hang` trong code.
   - Update `next.config.ts` redirects.
   - Update sitemap.ts.
   - Update default schema values (topNavItems, mega menu hrefs).
   - Test local: visit `/shop` redirect, visit `/cua-hang` render.
3. **Step 2 - Hero video:**
   - Edit site-schema.ts hero section thêm 4 field.
   - Refactor HeroSection component.
   - Test local: set mediaType = video, paste sample URL, see render.
   - Test prefers-reduced-motion (DevTools rendering tab).
4. Commit 2-3 commits logical.
5. Push PR.

## 5. Out of scope

- Sub-category routes `/cua-hang/[categorySlug]` (Phase 10).
- BST detail page `/bst/[slug]` (Phase 10).
- Video CDN optimization (lazy load, intersection observer): defer.
- Multi-format source (WebM + MP4): MP4 enough cho hiện tại.
- Footer cleanup, stub pages (Phase 9d).

## 6. Risk + mitigation

| Risk | Mitigation |
|---|---|
| Internal link sót `/shop` reference | Grep verify: `grep -rn '"/shop' src/` expect 0 results sau refactor |
| Existing user bookmark `/shop` break | 301 permanent redirect handle |
| Google Search cũ index `/shop` | 301 + sitemap update, Google sẽ re-crawl, transfer authority |
| Video LCP regression | Document trong AGENTS.md, fallback image nếu LCP > 3.5s |
| Cloudinary video URL incompatible | Test với sample URL trước deploy |

## 7. Sample Cloudinary URL cho test

Sample MP4 free từ Cloudinary demo:
```
https://res.cloudinary.com/demo/video/upload/q_auto,f_mp4/dog.mp4
```

Anh sẽ upload video Cốc Nối thật sau, format URL:
```
https://res.cloudinary.com/dxjplgard/video/upload/q_auto,f_mp4,vc_auto/v.../hero-video.mp4
```

---

Antigravity reference: Phase 9b phải merged trước (mega menu hrefs cần update sang `/cua-hang`). Start route rename trước, hero video sau.

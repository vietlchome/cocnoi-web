# Phase 6a - Discover sub-pages + Community nav + 4 brand pillar

**Người thực thi:** Antigravity.
**Người duyệt:** Việt.
**Base branch:** `master` (sau Phase 5 merged, tip `75c6d88`).
**Branch name:** `feature/phase-6a-discover-community-pillar`.

**Mục tiêu:** Refactor `/discover` single-page anchor thành 4 sub-pages riêng. Build `/discover/our-values` với 4 brand pillar đầy đủ (KẾT NỐI/CHÂN THÀNH/CHỈN CHU/CỞI MỞ) per `brand-core.md` v2.0. Thêm CỘNG ĐỒNG top-nav. Move `/nguoi-noi` vào `/community/nguoi-noi`. Update Header nav từ 4 mục thành 5 mục per blueprint.

---

## 0. Bối cảnh

`docs/customize-refactor-spec-phase5.md` đã merge. Master tip `75c6d88`.

Hiện tại:
- `/discover/page.tsx` là single page với content "Our Craft" 7-step hardcoded + anchor links (#story, #process, #values).
- `/nguoi-noi/page.tsx` ở root level, lạc loài, không nested dưới `/community/`.
- Header nav 4 mục: SHOP, KHÁM PHÁ, ĐỐI TÁC, HÀNH TRÌNH. Thiếu CỘNG ĐỒNG.
- 4 brand pillar (KẾT NỐI/CHÂN THÀNH/CHỈN CHU/CỞI MỞ) không hiện chính thức ở bất kỳ trang nào (trust badges trên homepage là content khác).

Per `D:\CỐC NỐI\07_Website\site-architecture.md`:
- Nav 5 mục: SHOP / KHÁM PHÁ / **CỘNG ĐỒNG** / ĐỐI TÁC / HÀNH TRÌNH
- KHÁM PHÁ có 4 sub-pages: `/discover/our-story`, `/our-human`, `/our-craft`, `/our-values`
- CỘNG ĐỒNG có 2 sub-pages: `/community/your-stories` (UGC `#cocnoiwithyou`), `/community/nguoi-noi` (Signature campaign Người Nối)

---

## 1. Scope Phase 6a (strict)

**Files mới:**
- `src/app/(store)/discover/our-story/page.tsx`
- `src/app/(store)/discover/our-human/page.tsx`
- `src/app/(store)/discover/our-craft/page.tsx`
- `src/app/(store)/discover/our-values/page.tsx`
- `src/app/(store)/community/page.tsx` (landing - optional, có thể skip nếu redirect về /community/your-stories)
- `src/app/(store)/community/your-stories/page.tsx`
- `src/app/(store)/community/nguoi-noi/page.tsx` (move content từ /nguoi-noi)

**Files modify:**
- `src/app/(store)/discover/page.tsx` - convert thành landing với 4 card link đi sub-pages. Bỏ 7-step craft hardcoded (chuyển sang /our-craft).
- `src/app/(store)/nguoi-noi/page.tsx` - replace content bằng `redirect("/community/nguoi-noi")` từ `next/navigation`.
- `src/components/shared/Header.tsx` - add CỘNG ĐỒNG vào nav, dropdown menu cho mỗi nav 5 mục.
- `src/components/shared/HeaderClient.tsx` - update mobile drawer + dropdown hover logic cho 5 mục.
- `src/config/site-schema.ts` - thêm section `our_values` với 4 pillar repeatable. Content default match brand-core.md v2.0.
- `src/lib/site-config-validate.ts` - validator cho `our_values`.

**Cấm động:**
- `src/components/admin/customize/**` (library Phase 3a)
- `src/components/admin/settings/SiteCustomizerClient.tsx`
- `src/lib/actions/settings.actions.ts`
- `src/lib/services/settings.service.ts`
- `src/lib/site-config.ts` (reader Phase 5 logic giữ nguyên, schema mới tự work với existing handlers)
- `prisma/schema.prisma`
- Sandbox
- Storefront homepage components (HomepageSections/**)

---

## 2. Detailed task breakdown

### 2.1. Schema add `our_values` section

**File:** `src/config/site-schema.ts`

Thêm section mới sau `seo` (hoặc `homepage`):

```ts
our_values: {
  label: "Trang Giá trị (/discover/our-values)",
  fields: {
    heroTagline: { 
      type: "text", 
      label: "Tagline hero", 
      default: "Core Principles" 
    },
    heroTitle: { 
      type: "text", 
      label: "Tiêu đề hero", 
      default: "Giá trị Cốc Nối" 
    },
    heroSubtitle: { 
      type: "textarea", 
      label: "Mô tả hero", 
      default: "Bốn pillar định hình mọi quyết định của Cốc Nối. Một cốt, ba chiều." 
    },
    pillars: {
      type: "repeatable",
      label: "4 Brand Pillar (1 cốt, 3 chiều)",
      min: 4,
      max: 4,
      default: [
        {
          name: "KẾT NỐI",
          role: "Cốt lõi",
          question: "Cốc Nối tồn tại để làm gì?",
          body: "Cốc Nối tồn tại để khơi mở những kết nối thực giữa người với người. Bạn bè, người yêu, gia đình, đồng nghiệp, người lạ, mọi mối quan hệ đều có một điểm chạm là khoảnh khắc 2 người ngồi cùng. Cốc Nối làm ra hiện vật cho khoảnh khắc đó.\n\nKết nối ở đây bao hàm cả văn hoá, di sản, con người, không chỉ giữa 2 người uống cùng nhau, mà còn giữa truyền thống và hiện tại, giữa Việt Nam và thế giới, giữa nghề thủ công và đời sống đương đại.",
          image: ""
        },
        {
          name: "CHÂN THÀNH",
          role: "Chiều sâu của Kết nối",
          question: "Kết nối ấy có thực chất không?",
          body: "Kết nối chưa đủ, kết nối phải là thực chất. Chân thành là chiều sâu khiến mối quan hệ bền vững. Trong brand, điều này thể hiện ở cách Cốc Nối kể chuyện không tô vẽ, không tâng bốc, không phóng đại, ở cách Cốc Nối thừa nhận lỗi sản phẩm và lứa nung không hoàn hảo, ở cách Cốc Nối từ chối hô hào marketing rỗng.\n\nMỗi cá nhân, từ người làm sản phẩm, đối tác, đến khách hàng, là một chấm trên hành trình kết nối, và luôn được trân trọng.",
          image: ""
        },
        {
          name: "CHỈN CHU",
          role: "Phẩm chất của Kết nối",
          question: "Kết nối ấy có kỷ luật không?",
          body: "Kết nối chân thành vẫn cần kỷ luật. Cốc Nối chọn làm kỹ hơn là làm nhanh, chất lượng hơn là sản lượng. Mỗi quyết định (từ chọn đất, pha men, vẽ tay từng hoạ tiết, đến cách kể chuyện trên mạng xã hội) đều mang chủ đích.\n\nCốc Nối không tìm sự hoàn hảo, nhưng không xuề xòa tùy tiện. Sự chỉn chu thể hiện trong từng đường vẽ, từng lần nung, từng dòng caption.",
          image: ""
        },
        {
          name: "CỞI MỞ",
          role: "Phạm vi của Kết nối",
          question: "Kết nối ấy mở đến đâu?",
          body: "Cốc Nối mở lòng đón nhận những con người, vùng đất, và góc nhìn khác biệt. Sản phẩm được thiết kế để đem lại cảm giác quen thuộc và giàu ý nghĩa, dù ở bất kỳ nền văn hoá hay bối cảnh nào. Bằng cách cân bằng giữa truyền thống và đổi mới, giữa tối giản và bản sắc riêng, Cốc Nối hướng tới những giá trị cởi mở, chân thật và đậm tính người.\n\nHiện thân vật lý của Cởi mở: Đôi cốc Cốc Nối gồm 2 chiếc có tương quan về màu sắc và thiết kế, nhưng vẫn có điểm khác nhau ở vị trí đặt hoạ tiết và cách hoàn thiện. Một đôi không phải là 2 bản sao, mà là 2 cá thể có chung tinh thần.",
          image: ""
        }
      ],
      itemSchema: {
        name: { type: "text", label: "Tên pillar (uppercase)", default: "" },
        role: { type: "text", label: "Vai trò (cốt / chiều sâu / phẩm chất / phạm vi)", default: "" },
        question: { type: "text", label: "Câu hỏi pillar trả lời", default: "" },
        body: { type: "textarea", label: "Nội dung dài", default: "" },
        image: { 
          type: "image", 
          label: "Ảnh minh họa", 
          default: "", 
          aspectRatio: 16/9,
          folder: "theme/pillars",
          helpText: "Tỷ lệ 16:9. Ảnh minh hoạ cho pillar."
        }
      }
    },
    closingTitle: {
      type: "text",
      label: "Tiêu đề closing section",
      default: "1 cốt - 3 chiều"
    },
    closingBody: {
      type: "textarea",
      label: "Nội dung closing",
      default: "KẾT NỐI là cốt lõi, là lý do Cốc Nối tồn tại. CHÂN THÀNH, CHỈN CHU, CỞI MỞ là ba chiều bổ sung quanh cốt. Mỗi pillar trả lời một câu hỏi về phẩm chất của sự kết nối mà Cốc Nối hướng tới."
    }
  }
}
```

**Note quan trọng:** Default content copy nguyên văn từ `brand-core.md` Section 4. Tuân thủ Quy tắc 9 (NO em-dash). Em đã thay `—` thành dấu phẩy `,` trong text.

**Validator:** `src/lib/site-config-validate.ts`

```ts
our_values: z.object({
  heroTagline: textValidator,
  heroTitle: textValidator,
  heroSubtitle: textValidator,
  pillars: z.array(z.object({
    name: textValidator,
    role: textValidator,
    question: textValidator,
    body: textValidator,
    image: imageValidator,
  })),
  closingTitle: textValidator,
  closingBody: textValidator,
}),
```

### 2.2. Build /discover/our-values page

**File mới:** `src/app/(store)/discover/our-values/page.tsx`

```tsx
import { getSiteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Giá trị Cốc Nối - 4 Brand Pillar",
  description: "KẾT NỐI, CHÂN THÀNH, CHỈN CHU, CỞI MỞ. Bốn pillar định hình mọi quyết định của Cốc Nối.",
};

export default async function OurValuesPage() {
  const config = await getSiteConfig();
  const { heroTagline, heroTitle, heroSubtitle, pillars, closingTitle, closingBody } = config.our_values;

  return (
    <main className="w-full bg-canvas">
      {/* Hero section */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <span className="font-quicksand text-xs uppercase tracking-widest text-accent block mb-3">
            {heroTagline}
          </span>
          <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-primary mb-6">
            {heroTitle}
          </h1>
          <p className="font-bvp text-base md:text-lg text-secondary leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Pillars sections - 1 section per pillar */}
      {pillars.map((pillar, idx) => (
        <section 
          key={idx} 
          className={`py-20 md:py-24 ${idx % 2 === 0 ? 'bg-subtle/30' : 'bg-canvas'}`}
        >
          <div className="max-w-5xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-12 items-center">
            <div className={idx % 2 === 0 ? 'md:order-1' : 'md:order-2'}>
              <span className="font-quicksand text-xs uppercase tracking-widest text-accent block mb-2">
                {pillar.role}
              </span>
              <h2 className="font-playfair text-3xl md:text-5xl font-semibold text-primary mb-4">
                {idx === 0 && <span className="text-accent">01 · </span>}
                {idx === 1 && <span className="text-accent">02 · </span>}
                {idx === 2 && <span className="text-accent">03 · </span>}
                {idx === 3 && <span className="text-accent">04 · </span>}
                {pillar.name}
              </h2>
              <p className="font-bvp text-sm italic text-secondary mb-6">
                {pillar.question}
              </p>
              <div className="font-bvp text-base text-primary leading-relaxed whitespace-pre-line">
                {pillar.body}
              </div>
            </div>
            <div className={`${idx % 2 === 0 ? 'md:order-2' : 'md:order-1'} aspect-video bg-subtle rounded-4 overflow-hidden`}>
              {pillar.image ? (
                <img src={pillar.image} alt={pillar.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-secondary/40 text-sm">
                  [Ảnh {pillar.name}]
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* Closing section */}
      <section className="py-20 md:py-28 bg-primary text-canvas">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h2 className="font-playfair text-3xl md:text-5xl font-semibold mb-6">
            {closingTitle}
          </h2>
          <p className="font-bvp text-base md:text-lg leading-relaxed opacity-90">
            {closingBody}
          </p>
        </div>
      </section>
    </main>
  );
}
```

**Lưu ý:** Layout alternate ảnh trái/phải mỗi pillar. Ảnh chưa có thì hiện placeholder. Owner upload sau qua admin form.

### 2.3. Build /discover/our-story page

**File mới:** `src/app/(store)/discover/our-story/page.tsx`

Content hardcoded từ `brand-core.md` Section 2 (Ý nghĩa tên) + roadmap project context. Phase 6a chỉ build skeleton, schema add ở Phase sau nếu cần edit.

```tsx
export const metadata = {
  title: "Câu chuyện Cốc Nối - Khởi nguồn từ Bát Tràng",
  description: "Hai bàn tay, một làng nghề. Khởi đầu của những kết nối từ xưởng gốm gia đình tại Bát Tràng.",
};

export default function OurStoryPage() {
  return (
    <main className="w-full bg-canvas">
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <header className="text-center mb-12">
            <span className="font-quicksand text-xs uppercase tracking-widest text-accent block mb-3">Our Story</span>
            <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-primary">
              Câu chuyện Cốc Nối
            </h1>
          </header>

          <div className="font-bvp text-base text-primary leading-relaxed space-y-6">
            <p>Chúng ta thấy chiếc cốc ở khắp mọi nơi: ở nhà, ở trường, hay ngay trên bàn làm việc. Nó gần gũi đến mức đôi khi ta quên mất rằng: mỗi chiếc cốc đều có thể là một khởi đầu cho những tâm sự và sẻ chia.</p>
            
            <p>Cái tên Cốc Nối ra đời từ một chữ "Nối" mang nhiều lớp nghĩa. Đó là sự kết nối giữa những người thân thương đang cần một khoảnh khắc thật để hiểu nhau. Đó là sự giao thoa của những miền đất, nơi mỗi loại men gốm đều kể một câu chuyện riêng. Đó còn là kỳ vọng nối truyền thống trăm năm của gốm thủ công Bát Tràng vào nhịp thở đầy năng lượng của năm 2026, cân bằng giữa mỹ thuật và công năng sử dụng.</p>
            
            <p>Trong một thế giới mà chỉ một cái chạm là có thể gửi tin, gọi video, thì những kết nối "thật" lại trở nên xa xỉ. Mỗi chiếc Cốc Nối gửi đến bạn một lời nhắn: những gì đi từ trái tim, sẽ chạm được đến trái tim.</p>
          </div>

          <blockquote className="border-l-2 border-accent pl-6 my-12">
            <p className="font-playfair text-2xl md:text-3xl italic text-primary leading-relaxed">
              Kết tình thân, Nối tinh thần.
            </p>
            <cite className="font-quicksand text-xs uppercase tracking-widest text-accent block mt-3 not-italic">
              Crafted bonds. Connected souls.
            </cite>
          </blockquote>

          <div className="text-center mt-16">
            <Link href="/discover/our-values" className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors">
              <span className="font-bvp font-medium">Khám phá 4 Brand Pillar</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
```

### 2.4. Build /discover/our-human and /discover/our-craft pages

Skeleton tương tự. Content stub từ `site-architecture.md` Section 5.2 + 5.3.

**`/discover/our-human/page.tsx`:**
- Hero: "Những đôi tay làm nên Cốc Nối"
- Intro: "Mỗi đôi cốc đi qua nhiều đôi tay..."
- Grid 3-4 chân dung placeholder (Antigravity tự design grid layout, content stub)
- CTA: "Trở thành một phần của Cốc Nối" → /partners/become-a-stockist

**`/discover/our-craft/page.tsx`:**
- Hero: "Quy trình thủ công, từ đất đến cốc"
- Timeline 7 steps (move từ `/discover/page.tsx` cũ hiện tại)
- Section closing "Vì sao thủ công?" với 1 đoạn long-form

### 2.5. Convert /discover/page.tsx thành landing

**File modify:** `src/app/(store)/discover/page.tsx`

Replace toàn bộ content bằng landing với 4 card lớn link đi 4 sub-pages.

```tsx
import Link from "next/link";

export const metadata = {
  title: "Khám phá Cốc Nối",
  description: "Câu chuyện, con người, quy trình thủ công, và giá trị của Cốc Nối.",
};

const sections = [
  {
    href: "/discover/our-story",
    title: "Câu chuyện",
    en: "Our Story",
    desc: "Khởi nguồn từ Bát Tràng, ý nghĩa cái tên, lý do là đôi cốc."
  },
  {
    href: "/discover/our-human",
    title: "Con người",
    en: "Our Human",
    desc: "Những đôi tay làm nên Cốc Nối. Nghệ nhân, đối tác, founders."
  },
  {
    href: "/discover/our-craft",
    title: "Quy trình thủ công",
    en: "Our Craft",
    desc: "7 bước từ đất đến cốc. Vì sao chúng tôi chọn làm thủ công."
  },
  {
    href: "/discover/our-values",
    title: "Giá trị",
    en: "Our Values",
    desc: "4 pillar: KẾT NỐI, CHÂN THÀNH, CHỈN CHU, CỞI MỞ."
  }
];

export default function DiscoverLandingPage() {
  return (
    <main className="w-full bg-canvas py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <header className="text-center mb-16">
          <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-primary mb-4">
            Khám phá Cốc Nối
          </h1>
          <p className="font-bvp text-base text-secondary max-w-xl mx-auto">
            Câu chuyện, con người, quy trình, và giá trị làm nên thương hiệu.
          </p>
        </header>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {sections.map(s => (
            <Link 
              key={s.href} 
              href={s.href}
              className="group block bg-subtle/30 border border-border rounded-4 p-8 md:p-10 hover:border-accent transition-colors"
            >
              <span className="font-quicksand text-xs uppercase tracking-widest text-accent block mb-2">{s.en}</span>
              <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-primary mb-3 group-hover:text-accent transition-colors">
                {s.title}
              </h2>
              <p className="font-bvp text-sm text-secondary leading-relaxed">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
```

### 2.6. Move /nguoi-noi thành /community/nguoi-noi

**Move content:**
1. `git mv src/app/(store)/nguoi-noi/page.tsx src/app/(store)/community/nguoi-noi/page.tsx`
2. Đảm bảo `src/app/(store)/community/nguoi-noi/page.tsx` đầy đủ content cũ.

**Backward compat redirect:**

Tạo lại `src/app/(store)/nguoi-noi/page.tsx` (vì git mv xóa). Content:

```tsx
import { redirect } from "next/navigation";

export default function NguoiNoiRedirect() {
  redirect("/community/nguoi-noi");
}
```

Hoặc dùng Next.js redirect trong `next.config.ts`:
```ts
async redirects() {
  return [
    { source: '/nguoi-noi', destination: '/community/nguoi-noi', permanent: true }
  ];
}
```

**Em đề xuất `next.config.ts` redirects.** Permanent (308) redirect giúp SEO + đỡ tạo file dummy.

### 2.7. Build /community/your-stories page (UGC gallery placeholder)

**File mới:** `src/app/(store)/community/your-stories/page.tsx`

```tsx
export const metadata = {
  title: "Câu chuyện của bạn - #cocnoiwithyou",
  description: "Mỗi đôi cốc kể một câu chuyện. Đây là những khoảnh khắc các bạn đã chia sẻ với chúng tôi.",
};

export default function YourStoriesPage() {
  return (
    <main className="w-full bg-canvas py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
        <header className="mb-16">
          <span className="font-quicksand text-xs uppercase tracking-widest text-accent block mb-3">#cocnoiwithyou</span>
          <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-primary mb-4">
            Câu chuyện của bạn
          </h1>
          <p className="font-bvp text-base text-secondary max-w-xl mx-auto">
            Mỗi đôi cốc kể một câu chuyện. Đây là những khoảnh khắc các bạn đã chia sẻ với chúng tôi.
          </p>
        </header>
        
        {/* UGC gallery placeholder - tích hợp Instagram embed sau */}
        <div className="bg-subtle/30 border border-dashed border-border rounded-4 p-12 text-center">
          <p className="font-bvp text-sm text-secondary">
            UGC gallery sẽ được build sau khi tích hợp Instagram embed.
          </p>
        </div>

        {/* CTA chia sẻ */}
        <div className="mt-16 max-w-2xl mx-auto bg-subtle/30 rounded-4 p-8">
          <h2 className="font-playfair text-2xl font-semibold text-primary mb-3">
            Chia sẻ câu chuyện của bạn
          </h2>
          <p className="font-bvp text-sm text-secondary mb-4">
            Tag <code className="text-accent font-medium">#cocnoiwithyou</code> + <code className="text-accent font-medium">@cocnoi</code> trên Instagram / Facebook để được feature trên gallery.
          </p>
        </div>
      </div>
    </main>
  );
}
```

Phase 6a chỉ build skeleton + CTA. UGC Instagram embed integration để Phase sau.

### 2.8. Update Header nav 4 -> 5 mục

**File:** `src/components/shared/Header.tsx`

Tìm array nav links (hiện 4 mục: SHOP/KHÁM PHÁ/ĐỐI TÁC/HÀNH TRÌNH). Insert CỘNG ĐỒNG vào sau KHÁM PHÁ:

```ts
const navLinks = [
  { title: "SHOP", link: "/shop", submenu: [...] },
  { title: "KHÁM PHÁ", link: "/discover", submenu: [
    { name: "Câu chuyện", href: "/discover/our-story" },
    { name: "Con người", href: "/discover/our-human" },
    { name: "Quy trình thủ công", href: "/discover/our-craft" },
    { name: "Giá trị", href: "/discover/our-values" },
  ] },
  { title: "CỘNG ĐỒNG", link: "/community/nguoi-noi", submenu: [
    { name: "Người Nối", href: "/community/nguoi-noi" },
    { name: "#cocnoiwithyou", href: "/community/your-stories" },
  ] },
  { title: "ĐỐI TÁC", link: "/partners", submenu: [...] },
  { title: "HÀNH TRÌNH", link: "/journal" },
];
```

**HeaderClient.tsx** update để render đúng 5 mục + dropdown submenu khi hover.

**Mobile menu** cũng cần update 5 mục.

### 2.9. Cấm em-dash trong copy

Mọi text mới (page titles, descriptions, content paragraphs) **KHÔNG được dùng `—` (em-dash)**. Thay bằng:
- Dấu phẩy `,`
- Dấu chấm `.`
- Dấu hai chấm `:`
- Gạch nối ngắn `-`

Per Quy tắc 9 trong `D:\CỐC NỐI\README.md`.

---

## 3. Verify checklist

1. `pnpm build` pass, `pnpm lint` clean, `npx tsc --noEmit` clean.
2. Routes mới (manually navigate):
   - `/discover` -> landing với 4 card link.
   - `/discover/our-story` -> story page với 3 đoạn + tagline quote + CTA "Khám phá 4 Pillar".
   - `/discover/our-human` -> skeleton page.
   - `/discover/our-craft` -> 7-step timeline.
   - `/discover/our-values` -> hero + 4 pillar sections (KẾT NỐI/CHÂN THÀNH/CHỈN CHU/CỞI MỞ) + closing section.
   - `/community/nguoi-noi` -> Người Nối campaign page (content giống `/nguoi-noi` cũ).
   - `/community/your-stories` -> UGC placeholder.
3. Redirect test:
   - Truy cập `/nguoi-noi` -> redirect 308 -> `/community/nguoi-noi`. URL trên browser thay đổi.
4. Header nav:
   - Desktop: hiển thị 5 mục SHOP / KHÁM PHÁ / **CỘNG ĐỒNG** / ĐỐI TÁC / HÀNH TRÌNH.
   - Hover KHÁM PHÁ -> dropdown 4 sub-page link.
   - Hover CỘNG ĐỒNG -> dropdown 2 sub-page link.
   - Mobile hamburger drawer cũng 5 mục.
5. Admin form `/admin/customize`:
   - Section mới "Trang Giá trị (/discover/our-values)" xuất hiện trong accordion.
   - 4 pillar items render đúng với content default.
   - Sửa pillar body, lưu, reload `/discover/our-values` -> giá trị mới hiện.
6. `<html lang="vi">` vẫn đúng.
7. Storefront homepage `/` không thay đổi (không thuộc scope Phase 6a).
8. SEO: view source mỗi page mới có `<title>` và `<meta description>` đúng.

---

## 4. Non-goals Phase 6a

- ❌ Không Partners sub-pages (Phase 6b).
- ❌ Không Shop sub-categories (Phase 6c).
- ❌ Không Instagram UGC embed thật (chỉ placeholder).
- ❌ Không schema cho /our-story, /our-human, /our-craft (chỉ schema cho /our-values). Content khác hardcode trước, schema sau nếu cần edit.
- ❌ Không EN/VN bilingual (Phase 7).
- ❌ Không Draft/Publish (Phase 8).

---

## 5. Checklist PR

- [ ] 7 routes mới created (4 discover sub + 2 community sub + 1 community landing optional).
- [ ] /nguoi-noi redirect to /community/nguoi-noi via `next.config.ts`.
- [ ] Schema thêm section `our_values` với 4 pillar default content match brand-core.md.
- [ ] Validator zod cho `our_values`.
- [ ] Header nav 4 -> 5 mục, dropdown menu CỘNG ĐỒNG mới.
- [ ] HeaderClient cập nhật mobile drawer + dropdown logic.
- [ ] Mọi copy mới KHÔNG có em-dash `—`.
- [ ] PR description 3 screenshot: (a) Header desktop 5 nav mục + CỘNG ĐỒNG dropdown, (b) /discover/our-values render 4 pillar đầy đủ, (c) admin form có section "Trang Giá trị" với 4 pillar editable.

---

## 6. Phase 6b preview

- Partners sub-pages: /partners/stockists (locator), /partners/become-a-stockist (B2B wholesale form), /partners/corporate-gifting (corporate form).
- Schema thêm content sections cho Partners pages.

## 7. Phase 6c preview

- Shop sub-categories: /shop/mugs, /shop/beakers, /shop/collections (BST landing), /shop/limited, /shop/best-sellers.
- BST detail template: /shop/collections/[slug].
- ProductGroup model có thể cần thêm vài field (collection slug, status).
- /shop/page.tsx convert sang landing với 5 tile categories.

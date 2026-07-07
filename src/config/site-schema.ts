export type FieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'image'
  | 'logo-image'
  | 'boolean'
  | 'select'
  | 'color'
  | 'group'
  | 'repeatable'
  | 'icon-picker'
  | 'product-picker'
  | 'json'; // json cho faq_items

export interface BaseField {
  type: FieldType;
  label: string;
  default?: any;
  helpText?: string;
  aliases?: string[];
}

export interface TextField extends BaseField { type: 'text'; default: string; }
export interface TextareaField extends BaseField { type: 'textarea'; default: string; }
export interface UrlField extends BaseField { type: 'url'; default: string; }
export interface ImageField extends BaseField { type: 'image'; default: string; aspectRatio?: number; folder?: string; }
export interface LogoImageField extends BaseField { type: 'logo-image'; default: string; folder?: string; previewHeight?: number; }
export interface BooleanField extends BaseField { type: 'boolean'; default: boolean; }
export interface SelectField extends BaseField { type: 'select'; default: string; options: {value: string, label: string}[]; }
export interface ColorField extends BaseField { type: 'color'; default: string; }
export interface JsonField extends BaseField { type: 'json'; default: any; }
export interface ProductPickerField extends BaseField { type: 'product-picker'; default: string[]; }
export interface IconPickerField extends BaseField { type: 'icon-picker'; default: string; }

export interface GroupField extends BaseField {
  type: 'group';
  fields: Record<string, SchemaField>;
  default?: Record<string, any>;
}

export interface RepeatableField extends BaseField {
  type: 'repeatable';
  itemSchema: Record<string, SchemaField>;
  min?: number;
  max?: number;
  default?: any[];
  aliasGroups?: Record<string, string>[]; // Mảng map alias cho từng phần tử cũ. VD: [{ title: 'value_1_title', desc: 'value_1_desc' }]
}

export type SchemaField =
  | TextField
  | TextareaField
  | UrlField
  | ImageField
  | LogoImageField
  | BooleanField
  | SelectField
  | ColorField
  | JsonField
  | GroupField
  | RepeatableField
  | ProductPickerField
  | IconPickerField;

export interface SectionSchema {
  label: string;
  fields: Record<string, SchemaField>;
}

export const SITE_SCHEMA: Record<string, SectionSchema> = {
  header: {
    label: "Header (Thanh điều hướng)",
    fields: {
      logoUrl: { type: "logo-image", label: "Logo Website", default: "", aliases: ["logo_image_url"], previewHeight: 40, folder: "theme/logo", helpText: "PNG transparent giữ nguyên trong suốt. Tự fit chiều cao header. Khuyến nghị 160x50px, tối đa 2MB." },
      logoText: { type: "text", label: "Tên thương hiệu", default: "CỐC NỐI", aliases: ["logo_text"] },
      showTopBar: { type: "boolean", label: "Hiển thị Top Bar", default: true, aliases: ["show_top_bar"] },
      topBarText: { type: "text", label: "Nội dung Top Bar", default: "Miễn phí vận chuyển toàn quốc cho đơn hàng trên 1.000.000 đ", aliases: ["top_bar_text"] },
      topBarLink: { type: "url", label: "Top Bar link đích", default: "", aliases: ["top_bar_link"], helpText: "Để trống = top bar không click được" },
      stickyHeader: { type: "boolean", label: "Header dính khi cuộn", default: true, aliases: ["sticky_header"] }
    }
  },
  hero: {
    label: "Hero Banner",
    fields: {
      badge: { type: "text", label: "Badge Text", default: "Crafted in Bát Tràng since 1994", aliases: ["hero_badge_text"] },
      title: { type: "text", label: "Tiêu đề", default: "Kết tình thân, Nối tinh thần.", aliases: ["hero_title"] },
      subtitle: { type: "textarea", label: "Mô tả", default: "Mỗi chiếc cốc gốm thủ công Cốc Nối chứa đựng tâm huyết của những nghệ nhân Bát Tràng và khát vọng gắn kết những tâm hồn đồng điệu.", aliases: ["hero_subtitle"] },
      ctaPrimary: {
        type: "group",
        label: "CTA Chính",
        default: { text: "Khám phá Cửa Hàng", url: "/cua-hang" },
        fields: {
          text: { type: "text", label: "Nhãn nút", default: "Khám phá Cửa Hàng", aliases: ["hero_cta_text"] },
          url: { type: "url", label: "Link đích", default: "/cua-hang" }
        }
      },
      ctaSecondary: {
        type: "group",
        label: "CTA Phụ (để text trống = ẩn nút)",
        default: { text: "", url: "" },
        fields: {
          text: { type: "text", label: "Nhãn nút (trống = ẩn)", default: "", aliases: ["hero_cta_secondary"] },
          url: { type: "url", label: "Link đích", default: "" }
        }
      },
      showShowcaseCard: { type: "boolean", label: "Hiển thị card showcase bên phải", default: false, helpText: "Tắt mặc định để focus vào video Hero." },
      floatingLabel: { type: "text", label: "Nhãn nổi trang trí (chỉ hiện khi card showcase bật)", default: "Gốm mộc từ đất mẹ", aliases: ["hero_floating_label"] },
      imageUrl: { type: "image", label: "Ảnh Hero", default: "", aliases: ["hero_image_url"], aspectRatio: 16/9, folder: "theme/hero", helpText: "Tỷ lệ 16:9 (vd 1920x1080). Dùng khi mediaType = 'Ảnh tĩnh'." },
      imageAlt: { type: "text", label: "Alt text ảnh Hero", default: "Cốc Nối - Gốm thủ công" },
      mediaType: {
        type: "select",
        label: "Loại media chính",
        options: [
          { value: "image", label: "Ảnh tĩnh" },
          { value: "video", label: "Video (MP4 Cloudinary)" },
        ],
        default: "image",
      },
      videoUrl: {
        type: "text",
        label: "URL video MP4 (Cloudinary)",
        default: "",
        helpText: "VD: https://res.cloudinary.com/dxjplgard/video/upload/q_auto,f_mp4/hero.mp4",
      },
      videoPosterUrl: {
        type: "image",
        label: "Ảnh poster (fallback reduced-motion)",
        default: "",
        aspectRatio: 1.7777,
        folder: "theme/hero",
        helpText: "Hiển thị thay video khi user tắt animation hoặc băng thông thấp.",
      },
      videoAutoplay: { type: "boolean", label: "Tự động phát video (muted)", default: true },
    }
  },
  campaign: {
    label: "Chiến dịch",
    fields: {
      badge: { type: "text", label: "Campaign Badge", default: "Signature Campaign", aliases: ["campaign_badge"] },
      title: { type: "text", label: "Tiêu đề", default: "Chiến dịch 'Người Nối' - Vinh danh sự gắn kết thầm lặng.", aliases: ["campaign_title"] },
      desc: { type: "textarea", label: "Mô tả", default: "Lấy cảm hứng từ những cống hiến âm thầm của cộng đồng, Người Nối là chiến dịch trọng tâm của Cốc Nối nhằm tôn vinh những người lao động nghệ thuật, những người kết nối sợi dây tình cảm trong gia đình và xã hội.", aliases: ["campaign_desc"] },
      heroImageUrl: { type: "image", label: "Ảnh Nhân vật", default: "", aliases: ["campaign_hero_image_url"], aspectRatio: 4/5, folder: "theme/campaign", helpText: "Tỷ lệ 4:5 (vd 800x1000). Ảnh portrait nhân vật trong chiến dịch." },
      heroName: { type: "text", label: "Tên nhân vật", default: "Bác Cường Lò Bầu", aliases: ["campaign_hero_name"] },
      heroQuote: { type: "text", label: "Câu trích dẫn", default: "Đất có linh hồn, gốm có sinh mệnh. Người thợ chỉ là người đánh thức vẻ đẹp ẩn sâu trong đó.", aliases: ["campaign_hero_quote"] },
      cta: {
        type: "group",
        label: "Nút CTA chiến dịch",
        default: { text: "Tìm hiểu thêm", url: "/campaign" },
        fields: {
          text: { type: "text", label: "Nhãn nút", default: "Tìm hiểu thêm" },
          url: { type: "url", label: "Link đích", default: "/campaign", helpText: "Để trống = không hiện nút" }
        }
      }
    }
  },
  products: {
    label: "Sản phẩm nổi bật",
    fields: {
      tagline: { type: "text", label: "Tagline", default: "Cốc Gốm Mộc Chọn Lọc", aliases: ["featured_products_tagline"] },
      title: { type: "text", label: "Tiêu đề", default: "Sản phẩm nổi bật", aliases: ["featured_products_title"] },
      desc: { type: "textarea", label: "Mô tả ngắn", default: "", aliases: ["featured_products_desc"] },
      type: { 
        type: "select", 
        label: "Cách chọn SP", 
        default: "latest", 
        aliases: ["featured_products_type"],
        options: [
          { value: "latest", label: "Mới nhất" },
          { value: "bestseller", label: "Bán chạy" },
          { value: "manual", label: "Chọn tay" }
        ]
      },
      manualProductIds: {
        type: "product-picker",
        label: "Danh sách sản phẩm chọn tay",
        default: [],
        aliases: ["featured_products_manual_ids"],
        helpText: "Chỉ áp dụng khi 'Cách chọn SP' = 'Chọn tay'. Dùng các nút mũi tên để thay đổi thứ tự."
      }
    }
  },
  story: {
    label: "Câu chuyện thương hiệu",
    fields: {
      tagline: { type: "text", label: "Tagline", default: "Heritage & Craft", aliases: ["intro_tagline"] },
      title: { type: "text", label: "Tiêu đề", default: "Khởi nguồn từ lòng đất, Giữ lửa qua ba thập kỷ.", aliases: ["intro_title", "story_title"] },
      desc1: { type: "textarea", label: "Đoạn văn 1", default: "Năm 1994, giữa lòng ngôi làng cổ Bát Tràng có bề dày lịch sử hơn 700 năm, một lò nung gốm nhỏ gia đình đã đỏ lửa. Đó chính là khởi đầu của Cốc Nối ngày nay.", aliases: ["intro_desc_1", "story_content"] },
      desc2: { type: "textarea", label: "Đoạn văn 2", default: "Chúng tôi tin rằng, một sản phẩm gốm tốt không chỉ nằm ở chất đất đanh, lớp men mịn mà còn nằm ở sự truyền tải cảm xúc. Mỗi mẻ gốm của Cốc Nối được làm từ đất sét lọc kỹ, xoay tay thủ công cẩn trọng, tráng men tự nhiên và nung ở nhiệt độ tiêu chuẩn để đảm bảo sự gắn kết tuyệt đối của xương gốm.", aliases: ["intro_desc_2"] },
      stat1Val: { type: "text", label: "Thống kê 1 (Số)", default: "30+", aliases: ["intro_stat_1_val"] },
      stat1Lbl: { type: "text", label: "Thống kê 1 (Nhãn)", default: "Năm giữ lửa", aliases: ["intro_stat_1_lbl"] },
      stat2Val: { type: "text", label: "Thống kê 2 (Số)", default: "100k+", aliases: ["intro_stat_2_val"] },
      stat2Lbl: { type: "text", label: "Thống kê 2 (Nhãn)", default: "Cốc gốm trao tay", aliases: ["intro_stat_2_lbl"] },
      features: {
        type: "repeatable",
        label: "Ảnh đặc trưng",
        default: [
          { imgUrl: "", alt: "" },
          { imgUrl: "", alt: "" },
          { imgUrl: "", alt: "" },
          { imgUrl: "", alt: "" }
        ],
        itemSchema: {
          imgUrl: { type: "image", label: "Upload ảnh (JPG/PNG/WEBP)", default: "", aspectRatio: 1, folder: "theme/story-features", helpText: "Tỷ lệ vuông 1:1 (vd 800x800). Dùng nếu KHÔNG fill URL bên dưới." },
          videoUrl: { type: "url", label: "HOẶC URL ảnh/video Cloudinary", default: "", helpText: "Paste URL trực tiếp (vd https://res.cloudinary.com/.../v.mp4 hoặc .jpg/.png). Khi có giá trị, sẽ override upload trên. Hệ thống tự detect: extension .mp4/.webm/.mov → render video, còn lại render ảnh." },
          alt: { type: "text", label: "Mô tả (alt text - SEO)", default: "", helpText: "Bắt buộc cho SEO + accessibility" }
        },
        aliasGroups: [
          { imgUrl: "intro_feat_1_img_url" },
          { imgUrl: "intro_feat_2_img_url" },
          { imgUrl: "intro_feat_3_img_url" },
          { imgUrl: "intro_feat_4_img_url" }
        ]
      }
    }
  },
  trust_badges: {
    label: "Trust Badges (Homepage)",
    fields: {
      tagline: { type: "text", label: "Tagline ngắn", default: "Why Cốc Nối", aliases: ["values_tagline"] },
      title: { type: "text", label: "Tiêu đề", default: "Vì sao chọn Cốc Nối", aliases: ["values_title"] },
      desc: { type: "textarea", label: "Mô tả chung", default: "", aliases: ["values_desc"] },
      items: {
        type: "repeatable",
        label: "Các badge",
        default: [
          { 
            title: "Handmade in Bát Tràng", 
            desc: "Thủ công tại làng gốm Bát Tràng 700 năm.",
            iconImage: ""
          },
          { 
            title: "Earth-friendly", 
            desc: "Đất nung tự nhiên, men an toàn, packaging giấy kraft.",
            iconImage: ""
          },
          { 
            title: "Contemporary design", 
            desc: "Thiết kế đương đại, phù hợp bàn làm việc + bàn cà phê hiện đại.",
            iconImage: ""
          },
          { 
            title: "Ethical & sustainable", 
            desc: "Kinh doanh có đạo đức, đối xử công bằng với nghệ nhân.",
            iconImage: ""
          }
        ],
        itemSchema: {
          title: { type: "text", label: "Tên badge", default: "" },
          desc: { type: "textarea", label: "Mô tả ngắn", default: "" },
          iconImage: {
            type: "image",
            label: "Icon / Ảnh",
            default: "",
            aspectRatio: 1,
            folder: "theme/trust-badges",
            helpText: "Có thể là icon line-art minimal hoặc ảnh nhỏ. Vuông 1:1."
          }
        }
      }
    }
  },
  faq: {
    label: "Hỏi đáp (FAQ)",
    fields: {
      tagline: { type: "text", label: "Tagline", default: "Bạn muốn hỏi?", aliases: ["faq_tagline"] },
      title: { type: "text", label: "Tiêu đề", default: "Giải đáp thắc mắc", aliases: ["faq_title"] },
      retailTitle: { type: "text", label: "Tiêu đề Khách lẻ", default: "Khách hàng lẻ", aliases: ["faq_retail_title"] },
      b2bTitle: { type: "text", label: "Tiêu đề Doanh nghiệp", default: "Đối tác doanh nghiệp (B2B)", aliases: ["faq_b2b_title"] },
      itemsRetail: {
        type: "repeatable",
        label: "Câu hỏi - Khách lẻ (B2C)",
        default: [
          {
            question: "Gốm Cốc Nối có an toàn khi sử dụng với lò vi sóng và máy rửa bát không?",
            answer: "Có. Gốm Cốc Nối được nung ở nhiệt độ cao (>1250°C), kết cấu xương gốm đanh chắc và men tự nhiên không chứa chì. Sản phẩm hoàn toàn an toàn khi sử dụng trong lò vi sóng, lò nướng và máy rửa bát."
          },
          {
            question: "Tôi muốn mua làm quà tặng, Cốc Nối có hỗ trợ đóng gói và viết thiệp không?",
            answer: "Tất cả sản phẩm Cốc Nối khi gửi đi đều được đóng gói chỉn chu trong hộp bồi kraft lót rơm mộc mạc. Chúng tôi luôn tặng kèm một tấm thiệp nhỏ, bạn có thể tự viết hoặc để lại lời nhắn, chúng tôi sẽ viết tay giúp bạn."
          },
          {
            question: "Tôi ở xa, nếu quá trình vận chuyển bị vỡ hỏng thì sao?",
            answer: "Cốc Nối đóng gói chống sốc vô cùng cẩn thận với nhiều lớp bảo vệ an toàn. Nếu không may sản phẩm bị nứt vỡ do vận chuyển, bạn chỉ cần gửi video quay lúc mở hàng, chúng tôi sẽ đền bù sản phẩm mới 100% hoàn toàn miễn phí."
          },
          {
            question: "Mỗi chiếc cốc có giống hệt nhau như trong ảnh không?",
            answer: "Vì là sản phẩm vuốt tay và tráng men thủ công 100%, mỗi chiếc cốc sẽ có sự biến thiên nhỏ về màu men và vân hỏa biến (tùy vào vị trí đặt trong lò nung). Đó chính là nét độc bản (unique) làm nên giá trị của gốm thủ công Cốc Nối."
          },
          {
            question: "Thời gian giao hàng là bao lâu?",
            answer: "Các đơn hàng nội thành Hà Nội thường nhận được trong 1-2 ngày. Các tỉnh thành khác từ 3-5 ngày làm việc."
          }
        ],
        itemSchema: {
          question: { type: "text", label: "Câu hỏi", default: "" },
          answer: { type: "textarea", label: "Trả lời", default: "" }
        },
        aliases: ["faq_items"]
      },
      itemsB2b: {
        type: "repeatable",
        label: "Câu hỏi - Doanh nghiệp (B2B)",
        default: [
          {
            question: "Cốc Nối có nhận sản xuất số lượng lớn và in logo doanh nghiệp không?",
            answer: "Có. Chúng tôi cung cấp giải pháp quà tặng doanh nghiệp toàn diện. Cốc Nối hỗ trợ thiết kế logo khắc chìm, in decal nung hoặc vẽ tay lên sản phẩm với số lượng linh hoạt, giúp tôn vinh dấu ấn thương hiệu của bạn."
          },
          {
            question: "Số lượng đặt hàng tối thiểu (MOQ) cho đơn B2B là bao nhiêu?",
            answer: "Để có mức chiết khấu tốt nhất, số lượng tối thiểu cho một đơn hàng tùy chỉnh logo thường từ 50 - 100 sản phẩm. Tuy nhiên, chúng tôi luôn linh hoạt hỗ trợ các doanh nghiệp vừa và nhỏ với số lượng phù hợp."
          },
          {
            question: "Thời gian hoàn thành một đơn hàng doanh nghiệp là bao lâu?",
            answer: "Thời gian sản xuất phụ thuộc vào số lượng và độ phức tạp của thiết kế. Thông thường quá trình làm đất, vuốt tay, phơi khô và nung lò sẽ mất khoảng 15-25 ngày làm việc."
          },
          {
            question: "Chúng tôi có được xem mẫu thực tế trước khi sản xuất hàng loạt không?",
            answer: "Chắc chắn rồi. Trước khi tiến hành sản xuất hàng loạt, Cốc Nối luôn làm mẫu thực tế (gồm cả việc khắc/in logo) gửi tới doanh nghiệp để kiểm duyệt chất lượng, màu sắc và kiểu dáng."
          },
          {
            question: "Chính sách chiết khấu và thanh toán cho đối tác B2B như thế nào?",
            answer: "Cốc Nối có thang chiết khấu rất hấp dẫn tùy theo số lượng đặt hàng. Quy trình thanh toán thường chia làm 2 đợt: đặt cọc 50% khi chốt mẫu và thanh toán 50% trước khi giao hàng. Vui lòng liên hệ Hotline để nhận báo giá chi tiết."
          }
        ],
        itemSchema: {
          question: { type: "text", label: "Câu hỏi", default: "" },
          answer: { type: "textarea", label: "Trả lời", default: "" }
        },
        aliases: ["faq_items_b2b"]
      }
    }
  },
  contact: {
    label: "Thông tin liên hệ",
    fields: {
      address: { type: "text", label: "Địa chỉ", default: "Xưởng gốm Cốc Nối, Bát Tràng, Gia Lâm, Hà Nội", aliases: ["contact_address"], helpText: "Hiển thị ở Footer + trang Liên hệ" },
      phone: { type: "text", label: "Điện thoại", default: "+84 (0) 98 765 4321", aliases: ["contact_phone"] },
      email: { type: "text", label: "Email", default: "hello@cocnoi.com", aliases: ["contact_email"] },
    }
  },
  footer: {
    label: "Footer",
    fields: {
      newsletterTitle: { type: "text", label: "Tiêu đề Newsletter", default: "Hộp tin Cốc Nối", aliases: ["footer_newsletter_title"] },
      newsletterDesc: { type: "text", label: "Mô tả Newsletter", default: "Đăng ký để nhận câu chuyện mới về 'Người Nối' và ưu đãi sớm nhất của các bộ sưu tập.", aliases: ["footer_newsletter_desc"] },
      copyright: { type: "text", label: "Bản quyền", default: "CỐC NỐI. Bảo lưu mọi quyền.", aliases: ["footer_copyright"] },
      legal: {
        type: "group",
        label: "Thông tin pháp lý (NĐ52)",
        default: {
          businessName: "",
          taxId: "",
          businessLicense: "",
          licensedBy: "",
          licensedDate: "",
          hours: "8:00 - 18:00 (T2-T7)"
        },
        fields: {
          businessName: { type: "text", label: "Tên doanh nghiệp đầy đủ", default: "", helpText: "Theo Giấy chứng nhận ĐKKD" },
          taxId: { type: "text", label: "Mã số thuế (MST)", default: "", helpText: "10 hoặc 13 chữ số" },
          businessLicense: { type: "text", label: "Số Giấy chứng nhận ĐKKD", default: "" },
          licensedBy: { type: "text", label: "Cơ quan cấp phép", default: "", helpText: "VD: Sở KH&ĐT TP. Hà Nội" },
          licensedDate: { type: "text", label: "Ngày cấp", default: "", helpText: "DD/MM/YYYY" },
          hours: { type: "text", label: "Giờ hoạt động", default: "8:00 - 18:00 (T2-T7)" }
        }
      }
    }
  },
  social: {
    label: "Mạng xã hội",
    fields: {
      links: {
        type: "repeatable",
        label: "Liên kết mạng xã hội",
        default: [
          { platform: "facebook", url: "", visible: true },
          { platform: "instagram", url: "", visible: true },
          { platform: "zalo", url: "", visible: true }
        ],
        itemSchema: {
          platform: {
            type: "select",
            label: "Nền tảng",
            default: "facebook",
            options: [
              { value: "facebook", label: "Facebook" },
              { value: "instagram", label: "Instagram" },
              { value: "tiktok", label: "TikTok" },
              { value: "youtube", label: "YouTube" },
              { value: "zalo", label: "Zalo" },
              { value: "shopee", label: "Shopee" },
              { value: "lazada", label: "Lazada" },
              { value: "threads", label: "Threads" }
            ]
          },
          url: { type: "url", label: "URL", default: "" },
          visible: { type: "boolean", label: "Hiển thị", default: true }
        }
      }
    }
  },
  seo: {
    label: "Cấu hình SEO",
    fields: {
      siteTitle: { type: "text", label: "Meta Title", default: "Cốc Nối · Gốm thủ công Bát Tràng", aliases: ["site_title"] },
      siteDescription: { type: "textarea", label: "Meta Description", default: "Kết tình thân, Nối tinh thần. Cốc gốm thủ công từ xưởng gia đình tại Bát Tràng từ 1994.", aliases: ["site_description"] },
      ogImage: { type: "image", label: "Ảnh chia sẻ (OG Image)", default: "", aspectRatio: 1200/630, folder: "theme/og", helpText: "1200x630px. Hiện khi share lên Facebook/Zalo." },
      ogImageAlt: { type: "text", label: "Mô tả OG image", default: "", helpText: "Alt text cho ảnh share, hỗ trợ screen reader" },
      favicon: { type: "image", label: "Favicon", default: "", aspectRatio: 1, folder: "theme/favicon", helpText: "PNG vuông, tối thiểu 32x32" },
      robotsIndexable: { type: "boolean", label: "Cho phép Google index", default: true, helpText: "Tắt khi đang test, bật khi public" }
    }
  },
  analytics: {
    label: "Tracking & Analytics",
    fields: {
      googleAnalyticsId: { type: "text", label: "Google Analytics 4 ID", default: "", helpText: "G-XXXXXXXXXX" },
      facebookPixelId: { type: "text", label: "Facebook Pixel ID", default: "", helpText: "Chuỗi 15-16 chữ số" },
      tiktokPixelId: { type: "text", label: "TikTok Pixel ID", default: "", helpText: "Chuỗi alphanumeric" }
    }
  },
  homepage: {
    label: "Bố cục trang chủ",
    fields: {
      sections: {
        type: "repeatable",
        label: "Section hiển thị (kéo để đổi thứ tự)",
        default: [
          { key: "hero", visible: true },
          { key: "campaign", visible: true },
          { key: "products", visible: true },
          { key: "story", visible: true },
          { key: "trust_badges", visible: true },
          { key: "faq", visible: true }
        ],
        itemSchema: {
          key: {
            type: "select",
            label: "Section",
            default: "hero",
            options: [
              { value: "hero", label: "Hero" },
              { value: "campaign", label: "Chiến dịch" },
              { value: "products", label: "Sản phẩm nổi bật" },
              { value: "story", label: "Câu chuyện" },
              { value: "trust_badges", label: "Trust Badges (Homepage)" },
              { value: "faq", label: "FAQ" }
            ]
          },
          visible: { type: "boolean", label: "Hiển thị", default: true }
        },
        helpText: "Bỏ tick 'Hiển thị' = ẩn section. Dùng ↑/↓ để đổi thứ tự. Section không có trong danh sách = ẩn hoàn toàn."
      }
    }
  },
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
            aspectRatio: 1.7777, // 16/9 = 1.7777...
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
  },
  discover_story: {
    label: "Trang Câu chuyện (/discover/our-story)",
    fields: {
      eyebrow:       { type: "text",     label: "Chữ nhỏ trên tiêu đề",       default: "Our Story" },
      title:         { type: "text",     label: "Tiêu đề chính",               default: "Câu chuyện Cốc Nối" },
      subtitle:      { type: "textarea", label: "Câu mô tả dưới tiêu đề",      default: "Khởi nguồn từ xưởng gốm nhỏ tại Bát Tràng, nối sợi dây gắn kết giữa người với người." },
      paragraphs: {
        type: "repeatable",
        label: "Các đoạn thân bài",
        default: [
          { text: "Chúng ta thấy chiếc cốc ở khắp mọi nơi: ở nhà, ở trường, hay ngay trên bàn làm việc. Nó gần gũi đến mức đôi khi ta quên mất rằng: mỗi chiếc cốc đều có thể là một khởi đầu cho những tâm sự và sẻ chia." },
          { text: "Cái tên Cốc Nối ra đời từ một chữ \"Nối\" mang nhiều lớp nghĩa. Đó là sự kết nối giữa những người thân thương đang cần một khoảnh khắc thật để hiểu nhau. Đó là sự giao thoa của những miền đất, nơi mỗi loại men gốm đều kể một câu chuyện riêng. Đó còn là kỳ vọng nối truyền thống trăm năm của gốm thủ công Bát Tràng vào nhịp thở đầy năng lượng của năm 2026, cân bằng giữa mỹ thuật và công năng sử dụng." },
          { text: "Trong một thế giới mà chỉ một cái chạm là có thể gửi tin, gọi video, thì những kết nối \"thật\" lại trở nên xa xỉ. Mỗi chiếc Cốc Nối gửi đến bạn một lời nhắn: những gì đi từ trái tim, sẽ chạm được đến trái tim." },
        ],
        itemSchema: { text: { type: "textarea", label: "Nội dung đoạn", default: "" } },
      },
      quote:         { type: "text",     label: "Câu trích dẫn",               default: "Kết tình thân, Nối tinh thần." },
      quoteCite:     { type: "text",     label: "Câu trích dẫn (EN)",           default: "Crafted bonds. Connected souls." },
      ctaEyebrow:    { type: "text",     label: "CTA - chữ nhỏ",               default: "Tiếp tục tìm hiểu" },
      ctaHeading:    { type: "text",     label: "CTA - tiêu đề",               default: "Bốn trụ cột định hình thương hiệu" },
      ctaButtonText:   { type: "text",  label: "CTA - nhãn nút",                              default: "Khám phá 4 Brand Pillar" },
      ctaButtonHref:   { type: "url",   label: "CTA - đường dẫn",                             default: "/discover/our-values" },
      featureImage:    { type: "image", label: "Ảnh feature (giữa tiêu đề và nội dung)",       default: "", aspectRatio: 16/9, folder: "discover", helpText: "Tỷ lệ 16:9. Chỉ hiển thị khi có ảnh." },
      featureImageAlt: { type: "text",  label: "Mô tả ảnh feature (alt)",                      default: "" },
    }
  },
  discover_index: {
    label: "Trang Khám phá (/discover)",
    fields: {
      eyebrow:  { type: "text",     label: "Chữ nhỏ trên tiêu đề", default: "Khám Phá" },
      title:    { type: "text",     label: "Tiêu đề",               default: "Khám phá Cốc Nối" },
      subtitle: { type: "textarea", label: "Câu mô tả",             default: "Câu chuyện, con người, quy trình, và giá trị làm nên thương hiệu." },
      cards: {
        type: "repeatable",
        label: "Các card khám phá",
        default: [
          { en: "Our Story",  title: "Câu chuyện",          desc: "Khởi nguồn từ Bát Tràng, ý nghĩa cái tên, lý do là đôi cốc.",      href: "/discover/our-story"  },
          { en: "Our Human",  title: "Con người",            desc: "Những đôi tay làm nên Cốc Nối. Nghệ nhân, đối tác, founders.",     href: "/discover/our-human"  },
          { en: "Our Craft",  title: "Quy trình thủ công",  desc: "7 bước từ đất đến cốc. Vì sao chúng tôi chọn làm thủ công.",       href: "/discover/our-craft"  },
          { en: "Our Values", title: "Giá trị",              desc: "4 pillar: KẾT NỐI, CHÂN THÀNH, CHỈN CHU, CỞI MỞ.",                href: "/discover/our-values" },
        ],
        itemSchema: {
          en:    { type: "text",     label: "Tên tiếng Anh (eyebrow)",  default: "" },
          title: { type: "text",     label: "Tiêu đề card",              default: "" },
          desc:  { type: "textarea", label: "Mô tả card",                default: "" },
          href:  { type: "url",      label: "Đường dẫn",                 default: "/" },
        },
      },
    }
  },
  discover_human: {
    label: "Trang Con người (/discover/our-human)",
    fields: {
      eyebrow:       { type: "text",     label: "Chữ nhỏ trên tiêu đề",    default: "Our Human" },
      title:         { type: "text",     label: "Tiêu đề chính",            default: "Những đôi tay làm nên Cốc Nối" },
      subtitle:      { type: "textarea", label: "Câu mô tả hero",           default: "Mỗi đôi cốc đi qua nhiều đôi tay. Đây là những con người dệt nên Cốc Nối, từ đất sét thô sơ đến bàn tay nâng niu của bạn." },
      members: {
        type: "repeatable",
        label: "Danh sách nghệ nhân",
        default: [
          {
            name: "Nghệ nhân Lê Minh",
            role: "Trực giác ngọn lửa lò (32 năm kinh nghiệm)",
            desc: "Người giữ ấm nhiệt độ nung Bát Tràng. Bác Minh điều tiết ngọn lửa bằng trực giác và kinh nghiệm tích lũy lâu năm, giúp lớp men tro chín ngọt đồng đều.",
            tag: "Trưởng thợ lò",
            initial: "M",
          },
          {
            name: "Chị Nguyễn Thị Hương",
            role: "Xoay tay vuốt mộc độc bản (18 năm kinh nghiệm)",
            desc: "Với đôi bàn tay bền bỉ và sự nhạy bén nghệ thuật, chị Hương đã định hình hàng vạn chiếc cốc. Mỗi sản phẩm đều có sự cân đối hoàn mỹ nhưng vẫn giữ lại vết hằn tay mộc mạc.",
            tag: "Nghệ nhân tạo hình",
            initial: "H",
          },
          {
            name: "Chị Lâm Mỹ Duyên",
            role: "Họa nét cọ hoa văn mộc (12 năm kinh nghiệm)",
            desc: "Chăm chút từng nét vẽ thanh tao trên chất liệu gốm mộc chưa nung. Đôi tay khéo léo của chị Duyên thổi hồn vào đất sét những nét hoa cỏ tự nhiên.",
            tag: "Nghệ nhân họa tiết",
            initial: "D",
          },
          {
            name: "Anh Trần Chí Tâm",
            role: "Phủ men tro tự nhiên (15 năm kinh nghiệm)",
            desc: "Chuyên gia chế tạo và phối men tro từ vỏ trấu và gỗ cây tự nhiên. Kỹ thuật tráng dội khéo léo của anh Tâm đảm bảo lớp men chín đều, lên màu mộc mạc đặc trưng.",
            tag: "Thợ tráng men",
            initial: "T",
          },
        ],
        itemSchema: {
          name:    { type: "text",     label: "Tên nghệ nhân",                                      default: "" },
          role:    { type: "text",     label: "Vai trò / kinh nghiệm",                              default: "" },
          desc:    { type: "textarea", label: "Mô tả",                                              default: "" },
          tag:     { type: "text",     label: "Badge vai trò",                                      default: "" },
          initial: { type: "text",     label: "Chữ cái avatar (hiện khi chưa có ảnh)",              default: "" },
          image:   { type: "image",    label: "Ảnh nghệ nhân (thay avatar khi có)",                 default: "", aspectRatio: 1, folder: "discover/human", helpText: "Vuông 1:1. Khi có ảnh sẽ phủ kín khung avatar." },
        },
      },
      memberBadge:   { type: "text",     label: "Dòng dưới thẻ nghệ nhân", default: "Nghệ nhân Bát Tràng truyền thống" },
      ctaHeading:    { type: "text",     label: "CTA - tiêu đề",            default: "Đồng hành cùng Cốc Nối" },
      ctaText:       { type: "textarea", label: "CTA - đoạn văn",           default: "Chúng tôi luôn tìm kiếm những cửa hàng kí gửi, đối tác phân phối và các doanh nghiệp muốn chia sẻ câu chuyện gốm thủ công ý nghĩa đến khách hàng." },
      ctaButtonText: { type: "text",     label: "CTA - nhãn nút",           default: "Tìm hiểu cơ hội hợp tác" },
      ctaButtonHref: { type: "url",      label: "CTA - đường dẫn",          default: "/partners" },
    }
  },
  discover_craft: {
    label: "Trang Quy trình (/discover/our-craft)",
    fields: {
      eyebrow:           { type: "text",     label: "Chữ nhỏ trên tiêu đề",  default: "Our Craft" },
      title:             { type: "text",     label: "Tiêu đề chính",          default: "Quy trình thủ công, từ đất đến cốc" },
      subtitle:          { type: "textarea", label: "Câu mô tả hero",         default: "Mỗi mẻ cốc cần trung bình 7-10 ngày thực hiện nghiêm ngặt qua bàn tay điêu luyện của các nghệ nhân gia đình Bát Tràng." },
      steps: {
        type: "repeatable",
        label: "Các bước quy trình",
        default: [
          { num: "01", title: "Chuẩn bị nguyên liệu & khuôn",  desc: "Đất sét cao lanh tinh khiết được chọn lọc kỹ lưỡng, trộn phối màu theo yêu cầu và tạo khuôn riêng biệt (khuôn in dáng tròn hoặc khuôn rót tạo hình đặc biệt)." },
          { num: "02", title: "Tạo hình sản phẩm",               desc: "Đất được đặt vào máy ép khuôn hoặc rót đất lỏng vào khuôn đổ. Quá trình này đòi hỏi sự đồng đều để đảm bảo độ dày mỏng của xương gốm đạt chuẩn." },
          { num: "03", title: "Vệ sinh sản phẩm thô",            desc: "Sau khi dỡ khuôn, người thợ gốm tỉ mỉ gọt giũa phần ba-via thừa và dùng mút ẩm làm nhẵn mịn từng góc cạnh để chuẩn bị cho các khâu nhiệt độ." },
          { num: "04", title: "Sấy khô & Sơ nung",              desc: "Sản phẩm được sấy khô tự nhiên rồi xếp vào lò nung sơ bộ ở nhiệt độ khoảng 700 độ C. Đây là khâu nền tảng giúp xương gốm cứng cáp, không bị nứt vỡ." },
          { num: "05", title: "Họa tiết & Phủ men",              desc: "Nghệ nhân dùng cọ mảnh vẽ tay từng nét họa tiết trơn phác, dán chìm nhãn thương hiệu, sau đó nhúng cốc vào lớp men tro Bát Tràng truyền thống đặc trưng." },
          { num: "06", title: "Nung chín lò bầu",                desc: "Cốc được đưa vào lò nung ở nhiệt độ từ 1150 đến 1200 độ C trong 15-18 tiếng liên tục. Nhiệt độ cao giúp xương đất hóa đá và men tro chảy chín ngọt." },
          { num: "07", title: "Kiểm tra & Đóng gói",             desc: "Từng chiếc cốc ra lò đều được gõ thử âm thanh, kiểm tra độ đanh thép của men và đóng gói chỉn chu trong hộp giấy tái chế thân thiện." },
        ],
        itemSchema: {
          num:   { type: "text",     label: "Số thứ tự (vd 01)",  default: "" },
          title: { type: "text",     label: "Tên bước",            default: "" },
          desc:  { type: "textarea", label: "Mô tả bước",          default: "" },
        },
      },
      closingHeading:      { type: "text",     label: "Tiêu đề closing",       default: "Vì sao chúng tôi chọn làm thủ công?" },
      closingText:         { type: "textarea", label: "Đoạn văn closing",      default: "Giữa thế giới công nghiệp hóa đồng đều, chúng tôi chọn giữ lại những nét hằn tay mộc mạc và sự biến thiên màu sắc tự nhiên của từng mẻ nung lò. Những khiếm khuyết nhỏ chính là nét độc bản làm nên hồn của gốm thủ công Cốc Nối. Chúng tôi muốn mỗi chiếc cốc khi cầm trên tay đều mang một câu chuyện chân thật, kết nối cảm xúc trọn vẹn của bạn với những người xung quanh." },
      primaryButtonText:   { type: "text",     label: "Nút chính - nhãn",      default: "Mua sắm ngay" },
      primaryButtonHref:   { type: "url",      label: "Nút chính - link",      default: "/cua-hang" },
      secondaryButtonText: { type: "text",     label: "Nút phụ - nhãn",        default: "Xem 4 Brand Pillar" },
      secondaryButtonHref: { type: "url",      label: "Nút phụ - link",        default: "/discover/our-values" },
    }
  },
  partners_meta: {
    label: "Thông tin Đối Tác (Partners pages)",
    fields: {
      stockistMinOrder: { 
        type: "text", 
        label: "Đơn hàng tối thiểu cho đại lý (mô tả)", 
        default: "10 đôi cốc cho đơn đầu tiên" 
      },
      stockistDiscount: { 
        type: "text", 
        label: "Mô tả chiết khấu đại lý", 
        default: "Chiết khấu 30-40% theo bậc số lượng" 
      },
      corporateMoq: { 
        type: "text", 
        label: "MOQ tối thiểu cho quà doanh nghiệp", 
        default: "20 đôi cho đơn cá nhân hoá logo" 
      },
      corporateLeadTime: { 
        type: "text", 
        label: "Thời gian sản xuất quà doanh nghiệp", 
        default: "2-4 tuần tuỳ số lượng và mức độ tuỳ chỉnh" 
      },
      salesEmail: { 
        type: "text", 
        label: "Email liên hệ B2B", 
        default: "",
        helpText: "Để trống = dùng contact.email mặc định"
      },
      salesPhone: { 
        type: "text", 
        label: "Hotline B2B", 
        default: "",
        helpText: "Để trống = dùng contact.phone mặc định"
      }
    }
  },
  payment_info: {
    label: "Hướng dẫn thanh toán (Inquiry Success)",
    fields: {
      showQr: { 
        type: "boolean", 
        label: "Hiển thị QR chuyển khoản", 
        default: true 
      },
      qrImage: { 
        type: "image", 
        label: "Ảnh QR chuyển khoản", 
        default: "", 
        aspectRatio: 1,
        folder: "theme/payment",
        helpText: "Ảnh QR ngân hàng (VietQR sinh từ ngân hàng Vietcombank/Techcombank/MB...)"
      },
      bankName: { 
        type: "text", 
        label: "Tên ngân hàng", 
        default: "Vietcombank (VCB)" 
      },
      accountNumber: { 
        type: "text", 
        label: "Số tài khoản", 
        default: "1234567890" 
      },
      accountHolder: { 
        type: "text", 
        label: "Tên chủ tài khoản", 
        default: "NGUYEN VAN A" 
      },
      transferNote: { 
        type: "text", 
        label: "Nội dung CK gợi ý", 
        default: "COC NOI [Tên khách] [SĐT]" 
      },
      codAvailable: { 
        type: "boolean", 
        label: "Có hỗ trợ COD", 
        default: true 
      },
      codNote: { 
        type: "textarea", 
        label: "Ghi chú COD", 
        default: "COD miễn phí Hà Nội nội thành. Tỉnh khác phụ phí ship theo cước vận chuyển. Đội ngũ Cốc Nối liên hệ xác nhận trong 2 giờ." 
      }
    }
  },
  navigation: {
    label: "Điều hướng (Navigation & Mega Menu)",
    fields: {
      topNavItems: {
        type: "repeatable",
        label: "Danh sách mục điều hướng",
        default: [
          { label: "CỬA HÀNG", href: "/cua-hang", submenuType: "mega", simpleSubmenu: [], openInNewTab: false },
          { label: "KHÁM PHÁ", href: "/discover", submenuType: "simple", simpleSubmenu: [
            { label: "Câu chuyện của chúng tôi", href: "/discover/our-story" },
            { label: "Người làm gốm", href: "/discover/our-human" },
            { label: "Quy trình thủ công", href: "/discover/our-craft" },
            { label: "Giá trị cốt lõi", href: "/discover/our-values" },
          ], openInNewTab: false },
          { label: "CỘNG ĐỒNG", href: "/community/nguoi-noi", submenuType: "simple", simpleSubmenu: [
            { label: "Người Nối", href: "/community/nguoi-noi" },
            { label: "Câu chuyện của bạn", href: "/community/your-stories" },
          ], openInNewTab: false },
          { label: "ĐỐI TÁC", href: "/partners", submenuType: "simple", simpleSubmenu: [
            { label: "Cửa hàng đối tác", href: "/partners/stockists" },
            { label: "Trở thành đối tác", href: "/partners/become-a-stockist" },
            { label: "Quà tặng doanh nghiệp", href: "/partners/corporate-gifting" },
          ], openInNewTab: false },
          { label: "HÀNH TRÌNH", href: "/journal", submenuType: "none", simpleSubmenu: [], openInNewTab: false },
        ],
        itemSchema: {
          label: { type: "text", label: "Nhãn hiển thị", default: "" },
          href: { type: "url", label: "Đường dẫn", default: "/" },
          submenuType: {
            type: "select",
            label: "Loại submenu",
            options: [
              { value: "none", label: "Không có submenu" },
              { value: "simple", label: "Dropdown list đơn giản" },
              { value: "mega", label: "Mega menu (chỉ CỬA HÀNG)" },
            ],
            default: "none",
          },
          simpleSubmenu: {
            type: "repeatable",
            label: "Items submenu (chỉ khi loại = Dropdown list)",
            max: 10,
            default: [],
            itemSchema: {
              label: { type: "text", label: "Tên hiển thị", default: "" },
              href: { type: "url", label: "Link", default: "/" },
            }
          },
          openInNewTab: { type: "boolean", label: "Mở tab mới", default: false },
        }
      },
      megaMenu: {
        type: "group",
        label: "Cấu hình Mega Menu",
        fields: {
          column1: {
            type: "group",
            label: "Cột 1 - Danh mục",
            fields: {
              title: { type: "text", label: "Tiêu đề cột", default: "DANH MỤC" },
              viewAllLabel: { type: "text", label: "Link xem tất cả", default: "→ Xem tất cả sản phẩm" },
            }
          },
          column2: {
            type: "group",
            label: "Cột 2 - Bộ sưu tập",
            fields: {
              title: { type: "text", label: "Tiêu đề cột", default: "BỘ SƯU TẬP" },
              viewAllLabel: { type: "text", label: "Link xem tất cả", default: "→ Xem tất cả BST" },
            }
          },
          column3: {
            type: "group",
            label: "Cột 3 - Hoàn thiện",
            fields: {
              title: { type: "text", label: "Tiêu đề cột", default: "HOÀN THIỆN" },
              viewAllLabel: { type: "text", label: "Link xem tất cả", default: "→ Xem tất cả kỹ thuật" },
            }
          },
          featuredCards: {
            type: "repeatable",
            label: "Featured Cards (tối đa 2)",
            max: 2,
            default: [],
            itemSchema: {
              title: { type: "text", label: "Tiêu đề card", default: "" },
              subtitle: { type: "text", label: "Phụ đề (tùy chọn)", default: "" },
              image: { type: "image", label: "Ảnh card", default: "", aspectRatio: 1.333, folder: "theme/megamenu" },
              href: { type: "url", label: "Đường dẫn", default: "/" },
              ctaLabel: { type: "text", label: "Nhãn CTA", default: "Khám phá" },
            }
          }
        }
      }
    }
  },
  community_stories: {
    label: "Trang 'Câu chuyện của bạn'",
    fields: {
      title: { type: "text", label: "Tiêu đề trang", default: "Câu chuyện của bạn" },
      intro: { type: "textarea", label: "Đoạn mở đầu", default: "Chiếc cốc Cốc Nối của bạn đã đi cùng những khoảnh khắc nào? Chúng tôi muốn lắng nghe câu chuyện của bạn." },
      ctaText: { type: "text", label: "Text nút CTA", default: "Gửi câu chuyện qua Telegram" },
      ctaUrl: { type: "url", label: "Link CTA", default: "https://t.me/cocnoi" },
      stories: {
        type: "repeatable",
        label: "Câu chuyện đã chia sẻ",
        default: [],
        itemSchema: {
          authorName: { type: "text", label: "Tên người chia sẻ", default: "" },
          location: { type: "text", label: "Địa điểm", default: "" },
          content: { type: "textarea", label: "Nội dung câu chuyện", default: "" },
          image: { type: "image", label: "Ảnh kèm", default: "", folder: "community/stories" },
          date: { type: "text", label: "Ngày (định dạng tự do)", default: "" },
        }
      }
    }
  },
};

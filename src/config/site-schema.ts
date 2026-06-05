export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'url' 
  | 'image' 
  | 'boolean' 
  | 'select' 
  | 'color' 
  | 'group' 
  | 'repeatable' 
  | 'icon-picker'
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
export interface BooleanField extends BaseField { type: 'boolean'; default: boolean; }
export interface SelectField extends BaseField { type: 'select'; default: string; options: {value: string, label: string}[]; }
export interface ColorField extends BaseField { type: 'color'; default: string; }
export interface JsonField extends BaseField { type: 'json'; default: any; }

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
  | BooleanField 
  | SelectField 
  | ColorField 
  | JsonField
  | GroupField 
  | RepeatableField;

export interface SectionSchema {
  label: string;
  fields: Record<string, SchemaField>;
}

export const SITE_SCHEMA: Record<string, SectionSchema> = {
  header: {
    label: "Header (Thanh điều hướng)",
    fields: {
      logoUrl: { type: "image", label: "Logo Website", default: "", aliases: ["logo_image_url"] },
      logoText: { type: "text", label: "Tên thương hiệu", default: "CỐC NỐI", aliases: ["logo_text"] },
      showTopBar: { type: "boolean", label: "Hiển thị Top Bar", default: true, aliases: ["show_top_bar"] },
      topBarText: { type: "text", label: "Nội dung Top Bar", default: "Miễn phí vận chuyển toàn quốc cho đơn hàng trên 1.000.000 đ", aliases: ["top_bar_text"] },
      stickyHeader: { type: "boolean", label: "Header dính khi cuộn", default: true, aliases: ["sticky_header"] }
    }
  },
  hero: {
    label: "Hero Banner",
    fields: {
      badge: { type: "text", label: "Badge Text", default: "Crafted in Bát Tràng since 1994", aliases: ["hero_badge_text"] },
      title: { type: "text", label: "Tiêu đề", default: "Kết tình thân, Nối tinh thần.", aliases: ["hero_title"] },
      subtitle: { type: "textarea", label: "Mô tả", default: "Mỗi chiếc cốc gốm thủ công Cốc Nối chứa đựng tâm huyết của những nghệ nhân Bát Tràng và khát vọng gắn kết những tâm hồn đồng điệu.", aliases: ["hero_subtitle"] },
      ctaPrimary: { type: "text", label: "CTA Chính", default: "Khám phá Cửa Hàng", aliases: ["hero_cta_text"] },
      ctaSecondary: { type: "text", label: "CTA Phụ", default: "Chiến dịch 'Người Nối'", aliases: ["hero_cta_secondary"] },
      floatingLabel: { type: "text", label: "Nhãn nổi trang trí", default: "Gốm mộc từ đất mẹ", aliases: ["hero_floating_label"] },
      imageUrl: { type: "image", label: "Ảnh Hero", default: "", aliases: ["hero_image_url"] }
    }
  },
  campaign: {
    label: "Chiến dịch",
    fields: {
      badge: { type: "text", label: "Campaign Badge", default: "Signature Campaign", aliases: ["campaign_badge"] },
      title: { type: "text", label: "Tiêu đề", default: "Chiến dịch 'Người Nối' - Vinh danh sự gắn kết thầm lặng.", aliases: ["campaign_title"] },
      desc: { type: "textarea", label: "Mô tả", default: "Lấy cảm hứng từ những cống hiến âm thầm của cộng đồng, Người Nối là chiến dịch trọng tâm của Cốc Nối nhằm tôn vinh những người lao động nghệ thuật, những người kết nối sợi dây tình cảm trong gia đình và xã hội.", aliases: ["campaign_desc"] },
      heroImageUrl: { type: "image", label: "Ảnh Nhân vật", default: "", aliases: ["campaign_hero_image_url"] },
      heroName: { type: "text", label: "Tên nhân vật", default: "Bác Cường Lò Bầu", aliases: ["campaign_hero_name"] },
      heroQuote: { type: "text", label: "Câu trích dẫn", default: "Đất có linh hồn, gốm có sinh mệnh. Người thợ chỉ là người đánh thức vẻ đẹp ẩn sâu trong đó.", aliases: ["campaign_hero_quote"] }
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
      storyImageUrl: { type: "image", label: "Ảnh minh họa chính", default: "", aliases: ["story_image_url"] },
      stat1Val: { type: "text", label: "Thống kê 1 (Số)", default: "30+", aliases: ["intro_stat_1_val"] },
      stat1Lbl: { type: "text", label: "Thống kê 1 (Nhãn)", default: "Năm giữ lửa", aliases: ["intro_stat_1_lbl"] },
      stat2Val: { type: "text", label: "Thống kê 2 (Số)", default: "100k+", aliases: ["intro_stat_2_val"] },
      stat2Lbl: { type: "text", label: "Thống kê 2 (Nhãn)", default: "Cốc gốm trao tay", aliases: ["intro_stat_2_lbl"] },
      features: {
        type: "repeatable",
        label: "Ảnh đặc trưng",
        default: [],
        itemSchema: {
          imgUrl: { type: "image", label: "Ảnh", default: "" }
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
  values: {
    label: "Giá trị cốt lõi",
    fields: {
      tagline: { type: "text", label: "Tagline", default: "Core Principles", aliases: ["values_tagline"] },
      title: { type: "text", label: "Tiêu đề", default: "Giá trị Cốc Nối", aliases: ["values_title"] },
      desc: { type: "textarea", label: "Mô tả chung", default: "Chúng tôi gìn giữ những giá trị nguyên bản nhất của gốm thủ công để mang đến trải nghiệm chạm tinh tế nhất cho khách hàng.", aliases: ["values_desc"] },
      items: {
        type: "repeatable",
        label: "Các đặc trưng",
        default: [
          { title: "Mộc Mạc", desc: "Không trang điểm bóng bẩy. Giữ trọn texture tự nhiên của đất nung Bát Tràng và lớp vân men độc bản." },
          { title: "Chân Thành", desc: "Mỗi sản phẩm đi kèm một câu chuyện thật, một thông điệp chân thành gửi gắm sự kết nối tình thân." },
          { title: "Bền Bỉ", desc: "Gốm nung ở nhiệt độ cao trên 1250°C, đảm bảo độ bền cơ học cao, an toàn tuyệt đối khi sử dụng." },
          { title: "Chỉn Chu", desc: "Từ khâu vuốt gốm, bọc gói bao bì kraft đến thiệp viết tay chân thành trao gửi khách hàng." }
        ],
        itemSchema: {
          title: { type: "text", label: "Tiêu đề", default: "" },
          desc: { type: "textarea", label: "Mô tả", default: "" }
        },
        aliasGroups: [
          { title: "value_1_title", desc: "value_1_desc" },
          { title: "value_2_title", desc: "value_2_desc" },
          { title: "value_3_title", desc: "value_3_desc" },
          { title: "value_4_title", desc: "value_4_desc" }
        ]
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
      address: { type: "text", label: "Địa chỉ", default: "", aliases: ["contact_address"], helpText: "Hiển thị ở Footer + trang Liên hệ" },
      phone: { type: "text", label: "Điện thoại", default: "", aliases: ["contact_phone"] },
      email: { type: "text", label: "Email", default: "", aliases: ["contact_email"] }
    }
  },
  footer: {
    label: "Footer",
    fields: {
      newsletterTitle: { type: "text", label: "Tiêu đề Newsletter", default: "Hộp tin Cốc Nối", aliases: ["footer_newsletter_title"] },
      newsletterDesc: { type: "text", label: "Mô tả Newsletter", default: "", aliases: ["footer_newsletter_desc"] },
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
      facebook: { type: "url", label: "Facebook", default: "", aliases: ["contact_facebook"] },
      instagram: { type: "url", label: "Instagram", default: "", aliases: ["contact_instagram"] },
      zalo: { type: "url", label: "Zalo", default: "", aliases: ["contact_zalo"] }
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
  }
};

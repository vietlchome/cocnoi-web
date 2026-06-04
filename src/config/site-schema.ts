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
      topBarText: { type: "text", label: "Nội dung Top Bar", default: "Miễn phí vận chuyển...", aliases: ["top_bar_text"] },
      stickyHeader: { type: "boolean", label: "Header dính khi cuộn", default: true, aliases: ["sticky_header"] }
    }
  },
  hero: {
    label: "Hero Banner",
    fields: {
      badge: { type: "text", label: "Badge Text", default: "Crafted in Bát Tràng since 1994", aliases: ["hero_badge_text"] },
      title: { type: "text", label: "Tiêu đề", default: "Kết tình thân, Nối tinh thần.", aliases: ["hero_title"] },
      subtitle: { type: "textarea", label: "Mô tả", default: "Mỗi chiếc cốc gốm...", aliases: ["hero_subtitle"] },
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
      title: { type: "text", label: "Tiêu đề", default: "", aliases: ["campaign_title"] },
      desc: { type: "textarea", label: "Mô tả", default: "", aliases: ["campaign_desc"] },
      heroImageUrl: { type: "image", label: "Ảnh Nhân vật", default: "", aliases: ["campaign_hero_image_url"] },
      heroName: { type: "text", label: "Tên nhân vật", default: "Bác Cường Lò Bầu", aliases: ["campaign_hero_name"] },
      heroQuote: { type: "text", label: "Câu trích dẫn", default: "Đất có linh hồn...", aliases: ["campaign_hero_quote"] }
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
      title: { type: "text", label: "Tiêu đề", default: "Khởi nguồn từ lòng đất...", aliases: ["intro_title", "story_title"] },
      desc1: { type: "textarea", label: "Đoạn văn 1", default: "", aliases: ["intro_desc_1", "story_content"] },
      desc2: { type: "textarea", label: "Đoạn văn 2", default: "", aliases: ["intro_desc_2"] },
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
      desc: { type: "textarea", label: "Mô tả chung", default: "", aliases: ["values_desc"] },
      items: {
        type: "repeatable",
        label: "Các đặc trưng",
        default: [],
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
      itemsRetail: { type: "json", label: "Danh sách B2C", default: [], aliases: ["faq_items"] },
      itemsB2b: { type: "json", label: "Danh sách B2B", default: [], aliases: ["faq_items_b2b"] }
    }
  },
  footer: {
    label: "Footer",
    fields: {
      address: { type: "text", label: "Địa chỉ", default: "", aliases: ["contact_address"] },
      phone: { type: "text", label: "Điện thoại", default: "", aliases: ["contact_phone"] },
      email: { type: "text", label: "Email", default: "", aliases: ["contact_email"] },
      newsletterTitle: { type: "text", label: "Tiêu đề Newsletter", default: "Hộp tin Cốc Nối", aliases: ["footer_newsletter_title"] },
      newsletterDesc: { type: "text", label: "Mô tả Newsletter", default: "", aliases: ["footer_newsletter_desc"] },
      copyright: { type: "text", label: "Bản quyền", default: "© 2024 CỐC NỐI. All rights reserved.", aliases: ["footer_copyright"] }
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
      siteKeywords: { type: "text", label: "Meta Keywords", default: "", aliases: ["site_keywords"] }
    }
  }
};

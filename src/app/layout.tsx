import type { Metadata } from "next";
import { Playfair_Display, Be_Vietnam_Pro, Quicksand } from "next/font/google";
import { getSiteConfig } from "@/lib/site-config";
import { SettingsService } from "@/lib/services/settings.service";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-bvp",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400"],
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: config.seo.siteTitle || "Cốc Nối · Gốm thủ công Bát Tràng",
    description: config.seo.siteDescription || "Kết tình thân, Nối tinh thần. Cốc gốm thủ công từ xưởng gia đình tại Bát Tràng từ 1994.",
    robots: {
      index: config.seo.robotsIndexable ?? true,
      follow: config.seo.robotsIndexable ?? true,
    },
    icons: config.seo.favicon ? {
      icon: config.seo.favicon,
    } : undefined,
    openGraph: config.seo.ogImage ? {
      title: config.seo.siteTitle || "Cốc Nối · Gốm thủ công Bát Tràng",
      description: config.seo.siteDescription || "Kết tình thân, Nối tinh thần. Cốc gốm thủ công từ xưởng gia đình tại Bát Tràng từ 1994.",
      images: [
        {
          url: config.seo.ogImage,
          alt: config.seo.ogImageAlt || undefined,
        }
      ]
    } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lấy dữ liệu cấu hình giao diện từ DB để ghi đè màu sắc CSS
  const settings = await SettingsService.getAllSettings();
  
  // Tạo đoạn CSS chèn động các màu sắc thương hiệu
  const themeStyles = `
    :root {
      ${settings.primary_color ? `--color-deep-indigo: ${settings.primary_color};` : ''}
      ${settings.secondary_color ? `--color-dark-brown: ${settings.secondary_color};` : ''}
      ${settings.accent_color ? `--color-terracotta: ${settings.accent_color};` : ''}
      ${settings.bg_color ? `--color-warm-white: ${settings.bg_color};` : ''}
      
      ${settings.theme_color_subtle ? `--color-cream: ${settings.theme_color_subtle};` : ''}
      ${settings.theme_color_border ? `--color-sand: ${settings.theme_color_border};` : ''}
      ${settings.theme_color_accent_hover ? `--color-light-terracotta: ${settings.theme_color_accent_hover};` : ''}
      ${settings.theme_color_error ? `--color-brick: ${settings.theme_color_error};` : ''}
      ${settings.theme_color_success ? `--color-olive: ${settings.theme_color_success};` : ''}
      ${settings.theme_color_warning ? `--color-mustard: ${settings.theme_color_warning};` : ''}
    }
  `;

  return (
    <html
      lang="vi"
      className={`${playfair.variable} ${beVietnamPro.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-bvp bg-canvas text-primary">
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
        {children}
      </body>
    </html>
  );
}

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { siteConfig } from "@/lib/site";
import IntroOverlay from "@/components/IntroOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "invoice management",
    "invoice generator",
    "client management",
    "freelance invoicing",
    "small business finance",
    "Bangladesh invoicing",
  ],
  authors: [{ name: "Hisab" }],
  creator: "Hisab",
  publisher: "Hisab",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: "/images/banner.jpg",
        width: 1525,
        height: 747,
        alt: "Hisab invoice management dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/images/banner.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/favicon_io/favicon-16x16.png", sizes: "16x16" },
      { url: "/images/favicon_io/favicon-32x32.png", sizes: "32x32" },
    ],
    apple: "/images/favicon_io/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-[#071f18] transition-colors duration-300">
        <Providers>
          <IntroOverlay />
          {children}
          <SpeedInsights />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}

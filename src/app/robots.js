import { siteConfig } from "@/lib/site";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/sign-up"],
      disallow: ["/dashboard/", "/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}


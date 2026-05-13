import { siteConfig } from "@/lib/site";

export default function sitemap() {
  return [
    {
      url: `${siteConfig.url}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}


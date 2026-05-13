export const siteConfig = {
  name: "Hisab",
  title: "Hisab | Invoice Management for Creators and Small Teams",
  description:
    "Create invoices, manage clients, and track revenue in a focused dashboard built for freelancers, agencies, and independent teams.",
  url: getSiteUrl(),
};

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (!configuredUrl) return "http://localhost:3000";

  return configuredUrl.startsWith("http")
    ? configuredUrl
    : `https://${configuredUrl}`;
}


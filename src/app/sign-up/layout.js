import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Sign In or Create an Account",
  description:
    "Access Hisab to create invoices, manage clients, and track business revenue from one focused dashboard.",
  alternates: {
    canonical: "/sign-up",
  },
  openGraph: {
    title: "Hisab | Invoice Management for Creators and Small Teams",
    description: siteConfig.description,
    url: "/sign-up",
  },
};

export default function SignUpLayout({ children }) {
  return children;
}


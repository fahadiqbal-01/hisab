import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Force dynamic ensures Vercel doesn't fail during the static prerender phase
export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If the middleware didn't catch it, do a final server-side check
  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/sign-up");
  }

  // Next.js build requires a default export that returns a component
  return null;
}

import { getProfile } from "@/app/actions/profiles";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SettingsClient from "./SettingsClient";
import { cookies } from "next/headers";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const { data: profile } = await getProfile();

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";

  return (
    <SettingsClient
      initialProfile={profile || {}}
      user={session?.user}
      lang={lang}
    />
  );
}

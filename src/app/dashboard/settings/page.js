import { getProfile } from "@/app/actions/profiles";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const { data: profile } = await getProfile();

  return <SettingsClient initialProfile={profile || {}} user={session?.user} />;
}

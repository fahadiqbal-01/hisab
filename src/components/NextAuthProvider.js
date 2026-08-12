"use client";

import { useEffect } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";

function SessionSyncGuard({ children }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error) {
      signOut({ callbackUrl: "/sign-up" });
    }
  }, [session]);

  return <>{children}</>;
}

export default function NextAuthProvider({ children }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <SessionSyncGuard>{children}</SessionSyncGuard>
    </SessionProvider>
  );
}


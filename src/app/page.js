"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check user session state and redirect immediately in the background
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((session) => {
        if (session && Object.keys(session).length > 0) {
          router.replace("/dashboard");
        } else {
          router.replace("/sign-up");
        }
      })
      .catch(() => {
        router.replace("/sign-up");
      });
  }, [router]);

  return null;
}

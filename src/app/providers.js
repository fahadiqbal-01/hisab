"use client";
import { ThemeProvider } from "next-themes";
import NextAuthProvider from "@/components/NextAuthProvider";

export function Providers({ children }) {
  return (
    <NextAuthProvider>
      <ThemeProvider
        attribute="class" 
        defaultTheme="system"
        enableSystem={true}
      >
        {children}
      </ThemeProvider>
    </NextAuthProvider>
  );
}


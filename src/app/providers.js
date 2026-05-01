// src/app/providers.js
"use client";
import { ThemeProvider } from "next-themes";

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class" /* This MUST be "class" */
      defaultTheme="system"
      enableSystem={true}
    >
      {children}
    </ThemeProvider>
  );
}

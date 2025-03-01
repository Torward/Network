"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force client-side rendering for theme provider
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    // Apply theme from localStorage on initial load
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  // Listen for theme changes and update localStorage
  const handleThemeChange = (theme: string) => {
    localStorage.setItem("theme", theme);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider {...props} onThemeChange={handleThemeChange}>
      {children}
    </NextThemesProvider>
  );
}

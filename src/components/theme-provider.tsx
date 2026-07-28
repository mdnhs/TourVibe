"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";

// Patch React.createElement on the client side before hydration to intercept unexecuted <script> elements from next-themes
if (typeof window !== "undefined") {
  const origCreateElement = React.createElement;
  try {
    Object.defineProperty(React, "createElement", {
      value: function (type: any, props: any, ...children: any[]) {
        if (
          type === "script" &&
          props?.dangerouslySetInnerHTML?.__html?.includes("document.documentElement")
        ) {
          return null;
        }
        return origCreateElement.call(React, type, props, ...children);
      },
      configurable: true,
      writable: true,
    });
  } catch {
    // Fallback if property is frozen
  }
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const forcedTheme = isDashboard ? undefined : "light";

  return (
    <NextThemesProvider forcedTheme={forcedTheme} {...props}>
      {children}
    </NextThemesProvider>
  );
}

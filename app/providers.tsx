// app/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark" // Set default theme here
      enableSystem={false} // Disable system theme detection
    >
      {children}
    </ThemeProvider>
  );
}

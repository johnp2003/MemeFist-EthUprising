'use client';

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import Navbar from '@/components/navbar';
import { WagmiProvider } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { sepolia, scrollSepolia } from 'wagmi/chains';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import { Head } from 'react-day-picker';

const inter = Inter({ subsets: ['latin'] });

// Configure Wagmi with your app details and supported chains
const config = getDefaultConfig({
  appName: 'Meme Battle Royale',
  projectId: '14ff0bb587a0b38929bfd4c86b557327', // Replace with your WalletConnect Project ID
  chains: [sepolia, scrollSepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>MemeFist</title>
        <link rel="icon" href="/swords.png"></link>
      </head>
      <body className={inter.className}>
        <Providers>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <Navbar />
                  <main className="min-h-screen">{children}</main>
                </ThemeProvider>
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0F172A",
  colorScheme: 'dark'
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.swifttoken.xyz'),
  title: "SwiftToken | Cheapest Solana Token Creator",
  description: "Launch your Solana token instantly at the lowest price. Easy, fast, and secure token creation platform for Solana blockchain. Create meme coins, tokens, and SPL tokens in minutes.",
  keywords: [
    "solana token creator",
    "cheap token launcher",
    "create solana token",
    "meme coin creator",
    "SPL token generator",
    "token launch platform",
    "cheapest token creator",
    "solana meme coin",
    "create cryptocurrency token",
    "token generator solana"
  ],
  openGraph: {
    title: "SwiftToken | Cheapest Solana Token Creator",
    description: "Launch your Solana token instantly at the lowest price. Easy, fast, and secure token creation platform.",
    type: "website",
    siteName: "SwiftToken",
  },
  twitter: {
    card: "summary_large_image",
    title: "SwiftToken | Cheapest Solana Token Creator",
    description: "Launch your Solana token instantly at the lowest price. Easy, fast, and secure token creation platform.",
  },
  verification: {
    google: "verification-string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

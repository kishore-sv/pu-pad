import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pupad.kishore-sv.me"),

  title: {
    default: "PU Pad - Encrypted Code-Based Notes",
    template: "%s | PU Pad",
  },

  description:
    "Zero-knowledge encrypted notes using only a single code. No accounts. No tracking. Fully encrypted in your browser.",

  keywords: [
    "encrypted notes",
    "zero knowledge notes",
    "secure notepad",
    "private markdown editor",
    "end to end encrypted notes",
    "code based notes",
  ],

  authors: [
    {
      name: "PU Pad",
      url: "https://pupad.kishore-sv.me",
    },
  ],

  creator: "PU Pad",
  publisher: "PU Pad",

  robots: {
    index: true,
    follow: true,
    nocache: false,
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },

  openGraph: {
    type: "website",
    url: "https://pupad.kishore-sv.me",
    title: "PU Pad - Encrypted Code-Based Notes",
    description:
      "Secure, zero-knowledge encrypted notes using only a single code. No login required.",
    siteName: "PU Pad",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PU Pad - Encrypted Code-Based Notes",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PU Pad - Encrypted Code-Based Notes",
    description:
      "Private, encrypted notes using only a code. Zero knowledge architecture.",
    images: ["/og-image.png"],
  },

  alternates: {
    canonical: "https://pupad.kishore-sv.me",
  },

  category: "technology",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={roboto.variable}>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "min-h-screen bg-background text-foreground antialiased"
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": siteConfig.name,
              "description": siteConfig.description,
              "url": siteConfig.url,
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "author": {
                "@type": "Person",
                "name": siteConfig.author,
                "url": "https://kishore-sv.me"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </body>
    </html>
  );
}


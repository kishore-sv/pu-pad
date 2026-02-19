import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/lib/site-config";

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
    default: "PU Pad (PUPAD) - Private Encrypted Notes by Kishore",
    template: "%s | PU Pad (PUPAD)",
  },

  description:
    "PU Pad (PUPAD) is a zero-knowledge encrypted notes app by Kishore. No accounts. No tracking. Fully encrypted in your browser. Private, code-based secure notes.",

  keywords: [
    "PU Pad",
    "PUPAD",
    "pu pad",
    "pupad",
    "pu pad kishore",
    "pupad kishore",
    "PU Pad by Kishore",
    "encrypted notes",
    "secure notes app",
    "zero knowledge notes",
    "private markdown editor",
    "anonymous notepad",
    "secure online notepad"
  ],

  authors: [
    {
      name: "Kishore",
      url: "https://kishore-sv.me",
    },
  ],

  creator: "Kishore",
  publisher: "PU Pad",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    url: "https://pupad.kishore-sv.me",
    title: "PU Pad (PUPAD) - Encrypted Code-Based Notes",
    description:
      "PU Pad (PUPAD) is a privacy-first encrypted notes app by Kishore. No login required. Zero knowledge architecture.",
    siteName: "PU Pad",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PU Pad (PUPAD) Encrypted Notes",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PU Pad (PUPAD) - Encrypted Notes by Kishore",
    description:
      "Private encrypted notes app built by Kishore. No accounts. Zero knowledge.",
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
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="google-site-verification" content="jCZEMBZli1xqreUKnEgoNvrmaQ2RnHp56pSpl_bbPo4" />
      </head>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "min-h-screen bg-background text-foreground antialiased selection:bg-primary/50 selection:text-foreground"
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
              "name": "PU Pad",
              "alternateName": ["PUPAD", "pu pad", "pupad"],
              "url": "https://pupad.kishore-sv.me",
              "description":
                "PU Pad (PUPAD) is a zero-knowledge encrypted notes application built by Kishore. Fully encrypted in the browser with no login required.",
              "applicationCategory": "ProductivityApplication",
              "operatingSystem": "All",
              "creator": {
                "@type": "Person",
                "name": "Kishore",
                "url": "https://kishore-sv.me"
              },
              "author": {
                "@type": "Person",
                "name": "Kishore"
              },
              "brand": {
                "@type": "Brand",
                "name": "PU Pad"
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


import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shapeshift — an input that becomes what you mean",
  description:
    "One text box that morphs into the right UI as you type: events, checklists, timers, colors, bill splits and more. Powered by TypeSafe AI's Jev.",
  // Absolute URLs for the Open Graph image: explicit site URL, else Vercel's production domain.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  ),
  openGraph: {
    title: "Shapeshift",
    description: "An input that becomes what you mean.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Shapeshift", description: "An input that becomes what you mean." },
};

// viewport-fit=cover lets fixed chrome (HUD, toasts) pad itself away from the home indicator.
export const viewport: Viewport = { themeColor: "#fafaf9", colorScheme: "light", viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}

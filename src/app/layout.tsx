import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/components/ui/toast';
// Temporarily removed analytics to fix build issues
// import ClientAnalyticsWrapper from '@/components/ClientAnalyticsWrapper';

// Temporarily disable fonts to fix build errors
// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff2",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff2",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata: Metadata = {
  title: "RUNNMATE - Join Europe's most sustainable running community",
  description: "Join Europe's most sustainable running community. Connect with fellow runners, share eco-friendly gear, and make a positive impact on the environment.",
  keywords: "sustainable running, European running community, eco-friendly gear, green running, environmental running",
  authors: [{ name: "RUNNMATE Team" }],
  creator: "RUNNMATE",
  publisher: "RUNNMATE",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://runnmate.com",
    siteName: "RUNNMATE",
    title: "RUNNMATE - Join Europe's most sustainable running community",
    description: "Join Europe's most sustainable running community. Connect with fellow runners, share eco-friendly gear, and make a positive impact on the environment.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RUNNMATE - Join Europe's most sustainable running community",
    description: "Join Europe's most sustainable running community. Connect with fellow runners, share eco-friendly gear, and make a positive impact on the environment.",
  },
  alternates: {
    canonical: "https://runnmate.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <LanguageProvider>
          <ToastProvider>
            {/* Temporarily removed analytics to fix build issues */}
            {/* <ClientAnalyticsWrapper /> */}
            {children}
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

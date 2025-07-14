import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/components/ui/toast';
import Header from '@/components/Header';
import GoogleAnalytics from '@/components/GoogleAnalytics';
// Temporarily removed analytics to fix build issues
// import ClientAnalyticsWrapper from '@/components/ClientAnalyticsWrapper';
import { AuthProvider } from '@/contexts/AuthContext';

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
  title: "Runnmate - Join Europe's most sustainable running community",
  description: "Join Europe's most sustainable running community. Connect with fellow runners, share eco-friendly gear, and make a positive impact on the environment.",
  keywords: "sustainable running, European running community, eco-friendly gear, green running, environmental running",
  authors: [{ name: "Runnmate Team" }],
  creator: "Runnmate",
  publisher: "Runnmate",
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
    siteName: "Runnmate",
    title: "Runnmate - Join Europe's most sustainable running community",
    description: "Join Europe's most sustainable running community. Connect with fellow runners, share eco-friendly gear, and make a positive impact on the environment.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Runnmate - Join Europe's most sustainable running community",
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
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              <GoogleAnalytics />
              {/* Temporarily removed analytics to fix build issues */}
              {/* <ClientAnalyticsWrapper /> */}
              <Header />
              <main>
                {children}
              </main>
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

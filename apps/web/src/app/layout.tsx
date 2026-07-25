import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserProvider } from "@/contexts/UserContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { getCurrentUser } from "@/lib/session";
import { getServerLocale } from "@/lib/i18n/getServerLocale";
import { branding } from "@/lib/branding";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: branding.name,
  description: branding.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, locale] = await Promise.all([getCurrentUser(), getServerLocale()]);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full bg-slate-950 text-slate-200">
        <LanguageProvider initialLocale={locale}>
          <UserProvider user={user}>
            <Sidebar />
            <main className="flex-1 overflow-x-hidden">{children}</main>
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

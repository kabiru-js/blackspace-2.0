import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Blackspace | Discover Scholarships",
  description:
    "Swipe through scholarships and apply faster with AI-powered assistance.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Blackspace",
    description:
      "Discover and apply to scholarships in minutes. Your AI-powered scholarship companion.",
    siteName: "Blackspace",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-black" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="pb-16 md:pb-0">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

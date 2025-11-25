import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import "@uploadthing/react/styles.css";
import { Header } from "@/components/site/header";
import { ToastProvider } from "@/components/ui/toast-provider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Mundough • Artisan cookie bakeshop",
  description:
    "Small-batch cookies and sweet bites crafted by Mundough. Browse favorites, send a craving, and we'll bake them fresh for you.",
  openGraph: {
    title: "Mundough",
    description:
      "Small-batch cookies and sweet bites crafted by Mundough. Browse favorites, send a craving, and we'll bake them fresh for you.",
    type: "website",
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
        className={`${manrope.variable} ${playfair.variable} antialiased text-cocoa`}
      >
        <ToastProvider />
        <Header />
        <main className="plaid-bg">
          <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col gap-16 px-6 py-12">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

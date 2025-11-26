import type { Metadata } from "next";
import { Alegreya } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import NotificationHandler from "@/components/common/notification-handler";

const alegreya = Alegreya({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-alegreya",
});

export const metadata: Metadata = {
  title: "Adventní kalendář",
  description: "Adventní kalendář",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${alegreya.variable}`}>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <NotificationHandler />
      </body>
    </html>
  );
}

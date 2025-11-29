import type { Metadata } from "next";
import { Alegreya } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import NotificationHandler from "@/components/common/notification-handler";
import { FirebaseClientProvider } from "@/firebase/client-provider";

const alegreya = Alegreya({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-alegreya",
});

export const metadata: Metadata = {
  title: "Adventní kalendář",
  description: "Adventní kalendář",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${alegreya.variable}`}>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {children}
          <Toaster />
          <NotificationHandler />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

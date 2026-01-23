import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../contexts/AppContext";
import { OpenedLoreProvider } from "../contexts/OpenedLoreContext";
import { SocketProvider } from "../contexts/SocketContext";
import { ToastContainer } from "react-toastify";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lore Graph",
  description: "A graph-based knowledge management tool for writers and worldbuilders.",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/icon.svg",
        href: "/icon.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/icon-dark.svg",
        href: "/icon-dark.svg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}>
        <ToastContainer
          stacked
          limit={3} // Shows top toast + 2 "peeking" layers
          position="top-right"
        />
        <SocketProvider>
          <AppProvider>
            <OpenedLoreProvider>{children}</OpenedLoreProvider>
          </AppProvider>
        </SocketProvider>
      </body>
    </html>
  );
}

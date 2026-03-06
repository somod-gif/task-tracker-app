import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@/app/globals.css";

import { Providers } from "@/app/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
}); 

export const metadata: Metadata = {
  title: {
    default: "Sprint Desk",
    template: "%s · Sprint Desk",
  },
  icons: {
    icon: [
      { url: "/sprint-desk.png", sizes: "16x16", type: "image/png" },
      { url: "/sprint-desk.png", sizes: "32x32", type: "image/png" },
      { url: "/sprint-desk.png", sizes: "64x64", type: "image/png" },
      { url: "/sprint-desk.png", sizes: "128x128", type: "image/png" },
      { url: "/sprint-desk.png", sizes: "256x256", type: "image/png" },
      { url: "/sprint-desk.png", sizes: "512x512", type: "image/png" },
      { url: "/sprint-desk.png", sizes: "1024x1024", type: "image/png" },
    ],
    apple: "/sprint-desk.png",
    shortcut: "/sprint-desk.png",
  },
  description:
    "Visual Kanban boards for modern teams. Create a workspace, build boards, and drag cards from To Do to Done — free forever.",
  keywords: [
    "kanban",
    "project management",
    "task tracker",
    "team collaboration",
    "workspace",
    "boards",
    "drag and drop",
  ],
  openGraph: {
    title: "Sprint Desk — Visual Kanban for every team",
    description:
      "Create a workspace, build boards, drag cards from To Do to Done. Free forever, no credit card required.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sprint Desk — Visual Kanban for every team",
    description:
      "Create a workspace, build boards, drag cards from To Do to Done. Free forever.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

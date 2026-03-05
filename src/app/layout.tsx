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

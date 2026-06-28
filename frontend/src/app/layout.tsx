import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EchoBrain AI — Your Second Brain for YouTube",
  description:
    "Transform any YouTube video into an intelligent knowledge workspace. AI-generated mind maps, searchable transcripts, and conversational Q&A — all in one place.",
  keywords: ["YouTube", "AI", "mind map", "transcript", "video analysis", "knowledge base"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#090B12]">
        {children}
      </body>
    </html>
  );
}

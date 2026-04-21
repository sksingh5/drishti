import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { WeightProvider } from "@/components/weight-provider";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "DiCRA — District Climate Risk Analytics",
  description: "Climate risk analysis platform for India with district-level risk scoring, interactive dashboards, and configurable indicators.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="flex h-full" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
        <WeightProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[var(--dicra-bg)]">
            {children}
          </main>
        </WeightProvider>
      </body>
    </html>
  );
}

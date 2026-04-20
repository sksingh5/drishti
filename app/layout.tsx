import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { DataFreshness } from "@/components/data-freshness";
import { WeightProvider } from "@/components/weight-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Climate Risk India — District-Level Risk Analysis",
  description: "Climate risk analysis platform for India with district-level risk scoring, interactive dashboards, and configurable indicators.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="flex min-h-full flex-col bg-neutral-50">
        <WeightProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t bg-white px-4 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <span className="text-xs text-neutral-400">Climate Risk India v0.1</span>
              <DataFreshness />
            </div>
          </footer>
        </WeightProvider>
      </body>
    </html>
  );
}

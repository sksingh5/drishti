"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { WeightProvider } from "@/components/weight-provider";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <WeightProvider>
      {isLanding ? (
        <main className="min-h-full">{children}</main>
      ) : (
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[var(--dicra-bg)]">{children}</main>
        </div>
      )}
    </WeightProvider>
  );
}

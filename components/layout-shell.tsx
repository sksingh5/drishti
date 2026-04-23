"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { WeightProvider } from "@/components/weight-provider";
import { DistrictSearch } from "@/components/district-search";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <WeightProvider>
      {isLanding ? (
        <main className="min-h-full">{children}</main>
      ) : (
        <div className="flex flex-col md:flex-row h-full">
          <Sidebar />
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0 bg-[var(--dicra-bg)]">{children}</main>
        </div>
      )}
      <DistrictSearch />
    </WeightProvider>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Bell, BookOpen, Search, Briefcase } from "lucide-react";
import { openDistrictSearch } from "@/components/district-search";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex h-screen w-[68px] flex-shrink-0 flex-col items-center py-4 gap-1 sticky top-0"
           style={{ background: "linear-gradient(180deg, var(--dicra-brand) 0%, #0A2E1A 100%)" }}>
        <Link href="/" className="mb-6 flex h-9 w-9 items-center justify-center rounded-[var(--dicra-radius-md)] font-black text-sm text-white"
              style={{ background: "linear-gradient(135deg, var(--dicra-accent), #059669)", boxShadow: "0 4px 12px rgba(5,150,105,0.3)" }}>
          D
        </Link>

        <button
          type="button"
          title="Search districts (Ctrl+K)"
          onClick={() => openDistrictSearch()}
          className="mb-2 flex h-10 w-10 items-center justify-center rounded-[var(--dicra-radius-md)] text-white/35 hover:text-white/70 transition-colors"
        >
          <Search size={18} />
        </button>

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/dashboard"
            ? pathname === "/dashboard" || pathname.startsWith("/state") || pathname.startsWith("/district")
            : pathname.startsWith(href);
          return (
            <Link key={href} href={href} title={label}
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-[var(--dicra-radius-md)] transition-colors",
                    isActive ? "text-[var(--dicra-accent)]" : "text-white/35 hover:text-white/70"
                  )}
                  style={isActive ? { background: "var(--dicra-accent-subtle)" } : undefined}>
              {isActive && (
                <span className="absolute left-0 top-[10px] bottom-[10px] w-[3px] rounded-r-sm"
                      style={{ background: "var(--dicra-accent)" }} />
              )}
              <Icon size={18} />
            </Link>
          );
        })}

        <Link href="/methodology" title="Methodology"
              className="flex h-10 w-10 items-center justify-center rounded-[var(--dicra-radius-md)] text-white/20 hover:text-white/50 transition-colors">
          <BookOpen size={18} />
        </Link>

        <Link href="/portfolio" title="CR Analysis"
              className="relative flex h-10 w-10 items-center justify-center rounded-[var(--dicra-radius-md)] text-white/35 hover:text-white/70 transition-colors">
          <Briefcase size={18} />
          <span className="absolute -top-0.5 -right-0.5 text-[7px] font-bold px-1 py-px rounded-full bg-amber-500 text-white">
            SOON
          </span>
        </Link>

        <div className="flex-1" />

        <ThemeToggle />

        <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
             style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}>
          S
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
           style={{ background: "var(--dicra-brand)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        {NAV_ITEMS.slice(0, 4).map(({ href, label, icon: Icon }) => {
          const isActive = href === "/dashboard"
            ? pathname === "/dashboard" || pathname.startsWith("/state") || pathname.startsWith("/district")
            : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors",
                    isActive ? "text-[var(--dicra-accent)]" : "text-white/40"
                  )}>
              <Icon size={18} />
              <span className="text-[9px] font-semibold">{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => openDistrictSearch()}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-white/40">
          <Search size={18} />
          <span className="text-[9px] font-semibold">Search</span>
        </button>
      </nav>
    </>
  );
}

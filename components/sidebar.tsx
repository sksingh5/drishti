"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, ArrowLeftRight, Bell, SlidersHorizontal, BookOpen } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/compare", label: "Compare", icon: ArrowLeftRight },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/weights", label: "Weights", icon: SlidersHorizontal },
  { href: "/methodology", label: "Methodology", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-screen w-[68px] flex-shrink-0 flex-col items-center py-4 gap-1 sticky top-0"
         style={{ background: "linear-gradient(180deg, var(--dicra-brand) 0%, #0A2E1A 100%)" }}>
      <Link href="/" className="mb-6 flex h-9 w-9 items-center justify-center rounded-[var(--dicra-radius-md)] font-black text-sm text-white"
            style={{ background: "linear-gradient(135deg, var(--dicra-accent), #059669)", boxShadow: "0 4px 12px rgba(5,150,105,0.3)" }}>
        D
      </Link>

      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
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

      <div className="flex-1" />

      <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
           style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}>
        S
      </div>
    </nav>
  );
}

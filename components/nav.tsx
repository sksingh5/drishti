"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/compare", label: "Compare" },
  { href: "/alerts", label: "Alerts" },
  { href: "/weights", label: "Weights" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
        <Link href="/" className="mr-8 text-lg font-semibold tracking-tight">Climate Risk India</Link>
        <div className="flex gap-1">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link key={href} href={href} className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            )}>{label}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-[12px] mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span style={{ color: "var(--dicra-text-faint)" }}>/</span>}
          {item.href ? (
            <Link href={item.href} className="font-semibold no-underline" style={{ color: "var(--dicra-brand)" }}>
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold" style={{ color: "var(--dicra-text-primary)" }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

import Link from "next/link";
import { BookOpen } from "lucide-react";

export function MethodologyBanner() {
  return (
    <Link href="/methodology"
          className="flex items-center gap-4 rounded-[var(--dicra-radius-lg)] px-5 py-4 mt-4 no-underline transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, var(--dicra-brand) 0%, var(--dicra-brand-mid) 100%)" }}>
      <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[var(--dicra-radius-md)]"
           style={{ background: "var(--dicra-accent-subtle)" }}>
        <BookOpen size={20} className="text-[var(--dicra-accent)]" />
      </div>
      <div className="flex-1">
        <div className="text-[12px] font-bold text-white">How are risk scores calculated?</div>
        <div className="text-[11px] text-white/60 leading-relaxed mt-0.5">
          Composite scores combine 6 climate indicators using peer-reviewed methods from IMD, ISRO, and Copernicus. Weights are adjustable.
        </div>
      </div>
      <span className="text-[11px] font-semibold flex-shrink-0" style={{ color: "var(--dicra-accent)" }}>
        Methodology →
      </span>
    </Link>
  );
}

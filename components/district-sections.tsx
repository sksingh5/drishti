"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Section {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface DistrictSectionsProps {
  sections: Section[];
  defaultSection?: string;
}

export function DistrictSections({ sections, defaultSection }: DistrictSectionsProps) {
  const [activeTab, setActiveTab] = useState(defaultSection ?? sections[0]?.id ?? "");
  const [expandedMobile, setExpandedMobile] = useState<Set<string>>(
    new Set([defaultSection ?? sections[0]?.id ?? ""])
  );

  const toggleMobile = (id: string) => {
    setExpandedMobile(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      {/* Desktop: Tabs */}
      <div className="hidden md:block">
        <div className="flex gap-1 mb-5 border-b border-[var(--dicra-border)]">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className="flex items-center gap-2 px-5 py-3 text-[12px] font-bold uppercase tracking-[0.5px] transition-colors relative"
              style={{
                color: activeTab === s.id ? "var(--dicra-accent)" : "var(--dicra-text-muted)",
              }}
            >
              {s.icon}
              {s.label}
              {activeTab === s.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px]"
                      style={{ background: "var(--dicra-accent)" }} />
              )}
            </button>
          ))}
        </div>
        {sections.map(s => (
          <div key={s.id} style={{ display: activeTab === s.id ? "block" : "none" }}>
            {s.content}
          </div>
        ))}
      </div>

      {/* Mobile: Accordion */}
      <div className="md:hidden flex flex-col gap-2">
        {sections.map(s => {
          const isExpanded = expandedMobile.has(s.id);
          return (
            <div key={s.id}
                 className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] overflow-hidden"
                 style={{ background: "var(--dicra-surface)" }}>
              <button
                onClick={() => toggleMobile(s.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-[12px] font-bold uppercase tracking-[0.5px]"
                style={{
                  color: isExpanded ? "var(--dicra-accent)" : "var(--dicra-text-muted)",
                  background: isExpanded ? "var(--dicra-surface-muted)" : "transparent",
                }}
              >
                <div className="flex items-center gap-2">
                  {s.icon}
                  {s.label}
                </div>
                <ChevronDown
                  size={16}
                  className="transition-transform"
                  style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}
                />
              </button>
              {isExpanded && (
                <div className="p-4">
                  {s.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

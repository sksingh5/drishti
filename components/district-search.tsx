"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface District {
  id: string;
  name: string;
  state_id: string;
  states: { name: string } | null;
}

// Custom event name for opening the search palette from anywhere
const OPEN_SEARCH_EVENT = "dicra:open-search";

/** Dispatch this event to open the district search palette */
export function openDistrictSearch() {
  window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
}

export function DistrictSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch districts on first open (lazy load)
  const fetchDistricts = useCallback(async () => {
    if (districts.length > 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/districts");
      if (res.ok) {
        const data = await res.json();
        setDistricts(data);
      }
    } catch {
      // silently fail -- user can retry by reopening
    } finally {
      setLoading(false);
    }
  }, [districts.length]);

  useEffect(() => {
    if (open) fetchDistricts();
  }, [open, fetchDistricts]);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Listen for custom event from sidebar button
  useEffect(() => {
    function onOpenSearch() {
      setOpen(true);
    }
    window.addEventListener(OPEN_SEARCH_EVENT, onOpenSearch);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, onOpenSearch);
  }, []);

  // Group districts by state
  const grouped = districts.reduce<Record<string, District[]>>((acc, d) => {
    const stateName = d.states?.name ?? "Unknown";
    if (!acc[stateName]) acc[stateName] = [];
    acc[stateName].push(d);
    return acc;
  }, {});

  const sortedStates = Object.keys(grouped).sort();

  function handleSelect(districtId: string) {
    setOpen(false);
    router.push(`/district/${districtId}`);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search Districts"
      description="Find a district by name to view its climate risk profile."
    >
      <Command
        className="rounded-xl"
        style={{
          background: "var(--dicra-surface)",
          borderColor: "var(--dicra-border)",
        }}
      >
        <CommandInput placeholder="Search districts..." />
        <CommandList
          className="max-h-80"
          style={{ color: "var(--dicra-text-primary)" }}
        >
          {loading ? (
            <div
              className="py-6 text-center text-sm"
              style={{ color: "var(--dicra-text-muted)" }}
            >
              Loading districts...
            </div>
          ) : (
            <>
              <CommandEmpty
                style={{ color: "var(--dicra-text-muted)" }}
              >
                No districts found.
              </CommandEmpty>
              {sortedStates.map((stateName) => (
                <CommandGroup
                  key={stateName}
                  heading={stateName}
                >
                  {grouped[stateName].map((d) => (
                    <CommandItem
                      key={d.id}
                      value={`${d.name} ${stateName}`}
                      onSelect={() => handleSelect(d.id)}
                      className="cursor-pointer"
                    >
                      <MapPin
                        size={14}
                        className="shrink-0"
                        style={{ color: "var(--dicra-accent)" }}
                      />
                      <span style={{ color: "var(--dicra-text-primary)" }}>
                        {d.name}
                      </span>
                      <span
                        className="ml-auto text-xs"
                        style={{ color: "var(--dicra-text-muted)" }}
                      >
                        {stateName}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </>
          )}
        </CommandList>
        <div
          className="flex items-center justify-end gap-2 border-t px-3 py-2 text-xs"
          style={{
            borderColor: "var(--dicra-border)",
            color: "var(--dicra-text-muted)",
          }}
        >
          <kbd className="rounded border px-1.5 py-0.5" style={{ borderColor: "var(--dicra-border)" }}>
            Esc
          </kbd>
          <span>to close</span>
        </div>
      </Command>
    </CommandDialog>
  );
}

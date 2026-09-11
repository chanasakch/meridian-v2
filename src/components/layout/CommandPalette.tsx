import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Patient, TabKey } from "../../types";
import { computeRiskBreakdown } from "../../utils/shap";
import { RiskBadge } from "../ui/Badge";
import { NAV_ITEMS } from "./nav-items";

type ResultItem =
  | { kind: "page"; key: TabKey; label: string; description: string; icon: (typeof NAV_ITEMS)[number]["icon"] }
  | { kind: "patient"; patient: Patient };

export function CommandPalette({
  open,
  onClose,
  patients,
  onNavigate,
  onSelectPatient,
}: {
  open: boolean;
  onClose: () => void;
  patients: Patient[];
  onNavigate: (key: TabKey) => void;
  onSelectPatient: (patient: Patient) => void;
}) {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset the query/highlight when the palette transitions from closed to
  // open — derived during render (React's documented pattern for "reset
  // state when a prop changes") rather than in an effect, since that would
  // cost an extra render pass. Focusing the input is a genuine imperative
  // side effect (can't focus a DOM node during render), so that alone stays
  // in an effect below.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setHighlighted(0);
    }
  }

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const results = useMemo<ResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    const pages: ResultItem[] = NAV_ITEMS.filter((n) => n.label.toLowerCase().includes(q)).map((n) => ({
      kind: "page",
      key: n.key,
      label: n.label,
      description: n.description,
      icon: n.icon,
    }));
    const patientResults: ResultItem[] = q
      ? patients.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8).map((p) => ({ kind: "patient", patient: p }))
      : [];
    return [...pages, ...patientResults];
  }, [query, patients]);

  // Same render-time pattern: keep the highlight in range as the result set changes.
  const [prevResultsLength, setPrevResultsLength] = useState(results.length);
  if (results.length !== prevResultsLength) {
    setPrevResultsLength(results.length);
    setHighlighted(0);
  }

  const select = (item: ResultItem) => {
    if (item.kind === "page") {
      onNavigate(item.key);
    } else {
      onNavigate("dashboard");
      onSelectPatient(item.patient);
    }
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[highlighted];
      if (item) select(item);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const pageResults = results.filter((r): r is Extract<ResultItem, { kind: "page" }> => r.kind === "page");
  const patientResults = results.filter((r): r is Extract<ResultItem, { kind: "patient" }> => r.kind === "patient");

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute left-1/2 top-[14vh] w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl bg-card shadow-lg ring-1 ring-border"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.1 }}
          >
            <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search patients or jump to a page…"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">esc</kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matches for "{query}".</p>
              )}

              {pageResults.length > 0 && (
                <div className="mb-1">
                  <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Pages</p>
                  {pageResults.map((item) => {
                    const idx = results.indexOf(item);
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        onMouseEnter={() => setHighlighted(idx)}
                        onClick={() => select(item)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          idx === highlighted ? "bg-accent text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-foreground">{item.label}</span>
                          <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
                        </span>
                        {idx === highlighted && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {patientResults.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Patients</p>
                  {patientResults.map((item) => {
                    const idx = results.indexOf(item);
                    const risk = computeRiskBreakdown(item.patient);
                    return (
                      <button
                        key={item.patient.id}
                        onMouseEnter={() => setHighlighted(idx)}
                        onClick={() => select(item)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          idx === highlighted ? "bg-accent text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        <User className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-foreground">{item.patient.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {item.patient.visitReason} · {item.patient.appointmentTime}
                          </span>
                        </span>
                        <RiskBadge level={risk.level} score={risk.score} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

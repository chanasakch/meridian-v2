import { ChevronDown } from "lucide-react";
import type { Clinic, TabKey } from "../../types";
import { Sheet } from "../ui/Sheet";
import { NAV_ITEMS } from "./nav-items";

export function MobileSidebar({
  open,
  onClose,
  activeTab,
  onChangeTab,
  clinics,
  activeClinicId,
  onClinicChange,
}: {
  open: boolean;
  onClose: () => void;
  activeTab: TabKey;
  onChangeTab: (key: TabKey) => void;
  clinics: Clinic[];
  activeClinicId: string;
  onClinicChange: (id: string) => void;
}) {
  const activeClinic = clinics.find((c) => c.id === activeClinicId) ?? clinics[0];

  return (
    <Sheet open={open} onClose={onClose} side="left" widthClassName="w-72" title="Meridian" subtitle="No-Show Intelligence">
      <div className="border-b border-border p-4">
        <div className="relative">
          <select
            value={activeClinicId}
            onChange={(e) => onClinicChange(e.target.value)}
            className="w-full appearance-none rounded-lg bg-muted py-2 pl-3 pr-8 text-sm font-medium text-foreground"
            aria-label="Select clinic"
          >
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
        <p className="mt-1.5 truncate px-1 text-[11px] text-muted-foreground">
          {activeClinic.specialty} · {activeClinic.location}
        </p>
      </div>

      <nav className="space-y-0.5 p-3">
        {NAV_ITEMS.map((item) => {
          const active = item.key === activeTab;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => {
                onChangeTab(item.key);
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-accent text-brand" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-left">
                {item.label}
                <span className="block text-[11px] font-normal text-muted-foreground">{item.description}</span>
              </span>
            </button>
          );
        })}
      </nav>
    </Sheet>
  );
}

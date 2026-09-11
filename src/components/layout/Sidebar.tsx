import { ChevronDown, ChevronsLeft, ChevronsRight, ShieldCheck } from "lucide-react";
import type { Clinic, TabKey } from "../../types";
import { Tooltip } from "../ui/Tooltip";
import { NAV_ITEMS } from "./nav-items";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function Sidebar({
  activeTab,
  onChangeTab,
  collapsed,
  onToggleCollapse,
  clinics,
  activeClinicId,
  onClinicChange,
}: {
  activeTab: TabKey;
  onChangeTab: (key: TabKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  clinics: Clinic[];
  activeClinicId: string;
  onClinicChange: (id: string) => void;
}) {
  const activeClinic = clinics.find((c) => c.id === activeClinicId) ?? clinics[0];

  return (
    <aside
      className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 md:flex ${
        collapsed ? "w-[68px]" : "w-60"
      }`}
    >
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand">
          <ShieldCheck className="h-4 w-4 text-brand-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-card-foreground">Meridian</p>
            <p className="truncate text-[11px] text-muted-foreground">No-Show Intelligence</p>
          </div>
        )}
      </div>

      <div className="border-b border-border p-3">
        {collapsed ? (
          <Tooltip label={activeClinic.name}>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-foreground">
              {initialsOf(activeClinic.name)}
            </button>
          </Tooltip>
        ) : (
          <div>
            <div className="relative">
              <select
                value={activeClinicId}
                onChange={(e) => onClinicChange(e.target.value)}
                className="w-full appearance-none rounded-lg bg-muted py-2 pl-3 pr-8 text-sm font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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
        )}
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {NAV_ITEMS.map((item) => {
          const active = item.key === activeTab;
          const Icon = item.icon;
          const button = (
            <button
              onClick={() => onChangeTab(item.key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                collapsed ? "justify-center px-0" : ""
              } ${active ? "bg-accent text-brand" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && item.label}
            </button>
          );
          return collapsed ? (
            <Tooltip key={item.key} label={item.label}>
              {button}
            </Tooltip>
          ) : (
            <div key={item.key}>{button}</div>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={onToggleCollapse}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${
            collapsed ? "justify-center px-0" : ""
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}

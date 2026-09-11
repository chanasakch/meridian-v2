import { useState } from "react";
import { Download, Menu, Moon, Search, Sun } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/Button";
import { SegmentedControl } from "../ui/SegmentedControl";

const DATE_RANGES = ["Today", "Week", "Month"] as const;

export function Header({
  onOpenMobileNav,
  onOpenCommandPalette,
  theme,
  onToggleTheme,
}: {
  onOpenMobileNav: () => void;
  onOpenCommandPalette: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}) {
  const [dateRange, setDateRange] = useState<(typeof DATE_RANGES)[number]>("Today");
  const { pushToast } = useToast();

  return (
    <header className="sticky top-0 z-30 flex flex-col gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenMobileNav}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={onOpenCommandPalette}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent sm:w-72 sm:flex-none"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">Search patients…</span>
          <kbd className="hidden shrink-0 items-center rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <SegmentedControl value={dateRange} options={DATE_RANGES} onChange={setDateRange} />

        <div className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border lg:inline-flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
          </span>
          <span className="text-foreground">Model v2.4</span>
          <span className="text-muted-foreground/50">·</span>
          <span>AUC 0.89</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Download className="h-3.5 w-3.5" />}
          onClick={() => pushToast({ title: "Report exported", description: "Schedule risk PDF downloaded.", variant: "success" })}
        >
          <span className="hidden sm:inline">Export</span>
        </Button>

        <button
          onClick={onToggleTheme}
          className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          <span
            className={`absolute left-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-sm transition-transform duration-200 ${
              theme === "dark" ? "translate-x-6" : "translate-x-0"
            }`}
          >
            {theme === "dark" ? <Moon className="h-3 w-3 text-brand" /> : <Sun className="h-3 w-3 text-amber-500" />}
          </span>
        </button>
      </div>
    </header>
  );
}

import type { ReactNode } from "react";

/** Inverted-color tooltip for collapsed-sidebar nav labels — pure CSS group-hover, no portal needed since it only ever anchors to the left edge. */
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group relative flex">
      {children}
      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  side: "left" | "right";
  widthClassName?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

/** One slide-over primitive for every edge-anchored panel in the app (mobile nav drawer, explainability panel) — side controls which edge it slides from. */
export function Sheet({ open, onClose, side, widthClassName = "w-full max-w-xs", title, subtitle, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const edgeClass = side === "left" ? "left-0 border-r" : "right-0 border-l";
  const hiddenX = side === "left" ? "-100%" : "100%";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className={`absolute inset-y-0 flex flex-col border-border bg-card shadow-lg ${edgeClass} ${widthClassName}`}
            initial={{ x: hiddenX }}
            animate={{ x: 0 }}
            exit={{ x: hiddenX }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                {title && <h2 className="text-base font-semibold text-card-foreground">{title}</h2>}
                {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

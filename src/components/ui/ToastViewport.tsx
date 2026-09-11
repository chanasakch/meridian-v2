import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useToast } from "../../hooks/useToast";

const VARIANT_ICON = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
};

const VARIANT_ACCENT: Record<string, string> = {
  success: "text-emerald-500",
  info: "text-brand",
  warning: "text-amber-500",
};

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-[100] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = VARIANT_ICON[toast.variant];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto flex items-start gap-3 rounded-lg bg-card p-3.5 shadow-lg ring-1 ring-border"
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${VARIANT_ACCENT[toast.variant]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-card-foreground">{toast.title}</p>
                {toast.description && <p className="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

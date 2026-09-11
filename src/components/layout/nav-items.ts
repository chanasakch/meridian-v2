import { LayoutDashboard, ShieldCheck, SlidersHorizontal, type LucideIcon } from "lucide-react";
import type { TabKey } from "../../types";

export interface NavItem {
  key: TabKey;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", description: "Schedule & risk overview", icon: LayoutDashboard },
  { key: "sandbox", label: "Prediction Sandbox", description: "Interactive what-if model", icon: SlidersHorizontal },
  { key: "governance", label: "Governance & ROI", description: "Model metrics & financial impact", icon: ShieldCheck },
];

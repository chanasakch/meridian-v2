import { useEffect, useMemo, useState } from "react";
import { CLINICS, generatePatients } from "./mock/generateData";
import type { Patient, TabKey } from "./types";
import { useTheme } from "./hooks/useTheme";
import { ToastProvider } from "./hooks/useToast";
import { ToastViewport } from "./components/ui/ToastViewport";
import { Sidebar } from "./components/layout/Sidebar";
import { MobileSidebar } from "./components/layout/MobileSidebar";
import { Header } from "./components/layout/Header";
import { CommandPalette } from "./components/layout/CommandPalette";
import { KpiScorecard } from "./components/dashboard/KpiScorecard";
import { ScheduleTable } from "./components/dashboard/ScheduleTable";
import { ExplainabilityDrawer } from "./components/dashboard/ExplainabilityDrawer";
import { PredictionSandbox } from "./components/sandbox/PredictionSandbox";
import { FeatureImportanceChart } from "./components/insights/FeatureImportanceChart";
import { ConfusionMatrix } from "./components/insights/ConfusionMatrix";
import { RoiCalculator } from "./components/insights/RoiCalculator";

function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const [patients, setPatients] = useState<Patient[]>(() => generatePatients());
  const [activeClinicId, setActiveClinicId] = useState(CLINICS[0].id);
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const clinicPatients = useMemo(() => patients.filter((p) => p.clinicId === activeClinicId), [patients, activeClinicId]);

  const selectedPatient = useMemo(() => patients.find((p) => p.id === selectedPatientId) ?? null, [patients, selectedPatientId]);

  const updatePatient = (patientId: string, updates: Partial<Patient>) => {
    setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, ...updates } : p)));
  };

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        clinics={CLINICS}
        activeClinicId={activeClinicId}
        onClinicChange={setActiveClinicId}
      />

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <Header
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 space-y-6 px-4 py-6 sm:px-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <KpiScorecard patients={clinicPatients} />
              <ScheduleTable patients={clinicPatients} onSelectPatient={(p) => setSelectedPatientId(p.id)} />
            </div>
          )}

          {activeTab === "sandbox" && <PredictionSandbox patients={clinicPatients} />}

          {activeTab === "governance" && (
            <div className="space-y-6">
              <RoiCalculator patients={clinicPatients} />
              <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
                <FeatureImportanceChart patients={patients} />
                <ConfusionMatrix />
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileSidebar
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        clinics={CLINICS}
        activeClinicId={activeClinicId}
        onClinicChange={setActiveClinicId}
      />

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        patients={clinicPatients}
        onNavigate={setActiveTab}
        onSelectPatient={(p) => setSelectedPatientId(p.id)}
      />

      <ExplainabilityDrawer patient={selectedPatient} onClose={() => setSelectedPatientId(null)} onUpdatePatient={updatePatient} />
      <ToastViewport />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}

export type RiskLevel = "Low" | "Medium" | "High";

export type PayerType = "Commercial" | "Medicare" | "Medicaid" | "Self-Pay";

export type ReminderStatus = "None Sent" | "SMS Sent" | "Confirmed";

export type WeatherRisk = "Low" | "Moderate" | "Severe";

export type AppointmentType = "New Patient" | "Established Patient";

export interface Clinic {
  id: string;
  name: string;
  specialty: string;
  location: string;
}

export interface PredictionFeatures {
  leadTimeDays: number;
  distanceMiles: number;
  priorNoShows: number;
  payerType: PayerType;
  reminderStatus: ReminderStatus;
  weatherRisk: WeatherRisk;
  appointmentType: AppointmentType;
}

export interface FeatureContribution {
  key: keyof PredictionFeatures;
  label: string;
  detail: string;
  points: number;
}

export interface RiskBreakdown {
  baseline: number;
  score: number;
  level: RiskLevel;
  contributions: FeatureContribution[];
}

export type InterventionType =
  | "sms"
  | "telehealth"
  | "overbook"
  | "call";

export interface InterventionLogEntry {
  type: InterventionType;
  label: string;
  timestamp: number;
}

export interface Patient extends PredictionFeatures {
  id: string;
  name: string;
  clinicId: string;
  appointmentTime: string;
  provider: string;
  visitReason: string;
  appointmentValue: number;
  historicalAttendance: boolean[];
  interventions: InterventionLogEntry[];
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: "success" | "info" | "warning";
}

export type TabKey = "dashboard" | "sandbox" | "governance";

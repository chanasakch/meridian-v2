import type {
  AppointmentType,
  Clinic,
  Patient,
  PayerType,
  ReminderStatus,
  WeatherRisk,
} from "../types";
import { computeRiskBreakdown } from "../utils/shap";

/** Mulberry32 seeded PRNG — deterministic so the "live" dataset is stable across renders/deploys. */
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260909);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 1): number {
  const value = rand() * (max - min) + min;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export const CLINICS: Clinic[] = [
  { id: "metro-primary", name: "Metro Primary Care", specialty: "Family & Internal Medicine", location: "Denver, CO" },
  { id: "willow-creek", name: "Willow Creek Family Medicine", specialty: "Family Medicine", location: "Asheville, NC" },
  { id: "sunrise-behavioral", name: "Sunrise Behavioral Health", specialty: "Behavioral & Mental Health", location: "Tempe, AZ" },
  { id: "harborview-peds", name: "Harborview Pediatrics", specialty: "Pediatrics", location: "Tacoma, WA" },
];

const FIRST_NAMES = [
  "Amara", "Priya", "Kenji", "Marcus", "Fatima", "Elena", "Diego", "Grace",
  "Omar", "Naomi", "Hiroshi", "Camila", "Ibrahim", "Sofia", "Andre", "Leila",
  "Wei", "Renata", "Tobias", "Anaya", "Malik", "Chiara", "Yusuf", "Delphine",
  "Kofi", "Ingrid", "Rafael", "Zainab", "Casper", "Mireille", "Tomas", "Aisha",
  "Nolan", "Yuki", "Esperanza", "Callum", "Nadia", "Sven", "Rosalind", "Emeka",
];

const LAST_NAMES = [
  "Okafor", "Whitfield", "Nakamura", "Delgado", "Al-Sayed", "Novak", "Reyes",
  "Bennett", "Haddad", "Kowalski", "Tanaka", "Moreau", "Osei", "Lindqvist",
  "Cabrera", "Beaumont", "Ferreira", "Solheim", "Iyer", "Marchetti",
  "Nkosi", "Vance", "Rutherford", "Aoyama", "Castellano", "Odom", "Vasquez",
];

const PROVIDERS = [
  "Dr. R. Whitfield", "Dr. S. Iyer", "NP J. Cabrera", "Dr. M. Osei",
  "Dr. A. Novak", "PA T. Beaumont", "Dr. L. Tanaka", "NP D. Marchetti",
];

const VISIT_REASONS: { label: string; value: [number, number]; newPatientLikely?: boolean }[] = [
  { label: "Annual Physical", value: [180, 260] },
  { label: "Follow-up: Hypertension", value: [110, 160] },
  { label: "New Patient Consult", value: [220, 320], newPatientLikely: true },
  { label: "Diabetes Management", value: [130, 190] },
  { label: "Well-Child Visit", value: [95, 150] },
  { label: "Behavioral Health Session", value: [140, 210] },
  { label: "Post-Op Follow-up", value: [100, 145] },
  { label: "Vaccination", value: [60, 95] },
  { label: "Lab Results Review", value: [70, 110] },
  { label: "Telehealth Check-in", value: [55, 90] },
];

const PAYER_TYPES: PayerType[] = ["Commercial", "Medicare", "Medicaid", "Self-Pay"];
const WEATHER_LEVELS: WeatherRisk[] = ["Low", "Low", "Low", "Moderate", "Moderate", "Severe"];

function buildAppointmentTimes(count: number): string[] {
  const slots: string[] = [];
  let hour = 8;
  let minute = 0;
  for (let i = 0; i < count; i++) {
    slots.push(
      `${hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`,
    );
    minute += 20;
    if (minute >= 60) {
      minute = 0;
      hour += 1;
    }
    if (hour === 12 && minute === 40) {
      hour = 13;
      minute = 0;
    }
  }
  return slots;
}

function buildHistoricalAttendance(priorNoShows: number, length = 6): boolean[] {
  const history = Array.from({ length }, () => true);
  const noShowSlots = new Set<number>();
  while (noShowSlots.size < Math.min(priorNoShows, length)) {
    noShowSlots.add(randInt(0, length - 1));
  }
  noShowSlots.forEach((idx) => {
    history[idx] = false;
  });
  return history;
}

function generatePatientsForClinic(clinic: Clinic, count: number): Patient[] {
  const times = buildAppointmentTimes(count);
  const usedNames = new Set<string>();

  return Array.from({ length: count }, (_, i) => {
    let fullName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    let guard = 0;
    while (usedNames.has(fullName) && guard < 10) {
      fullName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
      guard += 1;
    }
    usedNames.add(fullName);

    const visit = pick(VISIT_REASONS);
    const appointmentType: AppointmentType = visit.newPatientLikely
      ? (rand() < 0.75 ? "New Patient" : "Established Patient")
      : (rand() < 0.12 ? "New Patient" : "Established Patient");

    const priorNoShows = appointmentType === "New Patient" ? randInt(0, 1) : randInt(0, 4);
    const leadTimeDays = randInt(0, 52);
    const distanceMiles = randFloat(0.6, 27, 1);
    const payerType = pick(PAYER_TYPES);
    const weatherRisk = pick(WEATHER_LEVELS);

    const reminderRoll = rand();
    const reminderStatus: ReminderStatus =
      reminderRoll < 0.4 ? "Confirmed" : reminderRoll < 0.75 ? "SMS Sent" : "None Sent";

    const appointmentValue = randInt(visit.value[0], visit.value[1]);

    const features = {
      leadTimeDays,
      distanceMiles,
      priorNoShows,
      payerType,
      reminderStatus,
      weatherRisk,
      appointmentType,
    };

    return {
      id: `${clinic.id}-${i.toString().padStart(3, "0")}`,
      name: fullName,
      clinicId: clinic.id,
      appointmentTime: times[i],
      provider: pick(PROVIDERS),
      visitReason: visit.label,
      appointmentValue,
      historicalAttendance: buildHistoricalAttendance(priorNoShows),
      interventions: [],
      ...features,
    } satisfies Patient;
  });
}

export function generatePatients(): Patient[] {
  const counts = [16, 13, 11, 14];
  return CLINICS.flatMap((clinic, idx) => generatePatientsForClinic(clinic, counts[idx]));
}

export function riskScoreOf(patient: Patient): number {
  return computeRiskBreakdown(patient).score;
}

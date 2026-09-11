# Features

This document describes every screen in Meridian, what each value on it means, and how to interpret it. Example values below are taken from the seeded demo dataset (clinic: Metro Primary Care) and are stable across reloads, since the dataset generator uses a fixed random seed.

## Navigation

The sidebar holds the three primary destinations: **Dashboard**, **Prediction Sandbox**, and **Governance & ROI**. It is collapsible to an icon-only rail on desktop and becomes a slide-in drawer on mobile, opened from the hamburger icon in the header. A clinic switcher sits at the top of the sidebar; switching clinics re-scopes every number on the Dashboard and Sandbox to that clinic's patient list.

The header also holds the search trigger (`⌘K` / `Ctrl+K`, see [Command Palette](#command-palette)), a date-range control, the active model's version and AUC, an export action, and the theme toggle.

## Dashboard

### KPI row

Four summary cards, each scoped to the active clinic's schedule for the selected date range:

| Card | Meaning | Direction |
|---|---|---|
| Scheduled | Total appointments in the period | Informational only — not inherently good or bad |
| No-Show Rate | Mean predicted no-show probability across all scheduled appointments | Lower is better |
| Recoverable Revenue | Appointment revenue recoverable today through intervention, at an assumed 35% recovery rate | Higher is better |
| Precision / Recall | Current model's backtested precision and recall (see [Governance & ROI](#governance--roi)) | Closer to 1.0 is better |

The small trend figure under each number is a simulated week-over-week delta for demonstration purposes; it is not computed from historical time-series data, since the dataset has no real history.

### Patient schedule

A filterable table of every appointment in the period, sortable implicitly by risk (highest risk first). Filters are available by risk level (`All` / `High` / `Medium` / `Low`) and payer type. Each row shows a risk badge — a colored pill combining the risk tier and probability, for example `High · 69%` — plus lead time, distance, payer, and appointment value.

Risk tiers:

| Tier | Threshold | Suggested response |
|---|---|---|
| Low | < 30% | No action needed |
| Medium | 30–59% | Consider a reminder |
| High | ≥ 60% | Intervene before the appointment |

Clicking any row opens the patient detail panel.

## Patient detail panel

A slide-over panel with the full picture for one appointment. Example: patient **Malik Odom**, a Behavioral Health Session at 10:00 AM, scores **69% (High)**.

### Profile and history

Lead time, distance, payer, and appointment value are shown alongside attendance history — the last six appointments as attended/missed indicators, summarized as a percentage (Malik Odom: 50% attended, 3 of 6).

### SHAP attribution

A horizontal diverging bar chart explaining the score. Every prediction starts from a fixed baseline (6%) and each feature contributes a signed percentage that sums to the final score. Hovering a bar shows its exact contribution and a one-line explanation. Red bars increase risk; green bars decrease it.

For Malik Odom, the seven contributing factors are:

| Factor | Contribution | Explanation |
|---|---|---|
| Prior No-Shows | +24% | Three previous no-shows on file |
| Lead Time | +18.4% | Booked 32 days in advance |
| Distance to Clinic | +12.3% | 24.2 miles from the clinic |
| Reminder Status | +10% | No reminder has been sent yet |
| Weather Risk | +4% | Unsettled forecast on the appointment day |
| Appointment Type | −2% | Established patient relationship |
| Payer Type | −4% | Commercial insurance, low administrative friction |

Baseline (6%) plus the sum of contributions (24 + 18.4 + 12.3 + 10 + 4 − 2 − 4) equals 68.7%, which rounds to the displayed 69%.

### Interventions

Three actions are available directly from the panel, and each one recomputes the score immediately by changing the underlying feature values:

| Action | Effect |
|---|---|
| Send SMS Reminder | Sets reminder status to sent, removing the "no reminder" contribution. For Malik Odom this drops the score from 69% to 61% — still High, since a single intervention rarely crosses a full risk tier on its own. |
| Convert to Telehealth | Zeroes out distance and weather risk entirely, since a telehealth visit removes both factors from consideration. |
| Flag Overbook | Notifies scheduling without changing the score — a fallback for high-risk slots rather than a risk-reducing action. |

## Prediction Sandbox

An interactive what-if tool for the same scoring engine, decoupled from any real patient. Adjust lead time, distance, and prior no-shows with sliders, and payer type, reminder status, weather risk, and appointment type with segmented controls. The probability gauge and SHAP chart update on every change.

At default values (14-day lead time, 8 miles, 1 prior no-show, commercial payer, SMS sent, low weather risk, established patient), the model predicts **18% (Low)**, with the guidance "standard reminder cadence is sufficient." A **Load Sample** action seeds the sandbox from a random real appointment.

## Governance & ROI

### ROI calculator

Projects the monthly financial exposure from no-shows and the portion recoverable through intervention, at a configurable average appointment value (default $160). At that value, for Metro Primary Care: **$20,899/month at risk**, **$7,315/month recoverable** at an assumed 35% intervention recovery rate. This figure is independent of the Dashboard's "Recoverable Revenue" card, which reflects only the current day rather than a monthly projection.

### Feature importance

Ranks all seven risk factors by their mean absolute impact across every scheduled appointment, not just one patient — this identifies where an operational fix would have the broadest effect. In the demo dataset, prior no-shows (14.5%) and lead time (13.1%) dominate, followed by reminder status (9.5%), distance (6.4%), payer type (4.3%), weather (3.5%), and appointment type (2.7%).

### Model performance

A confusion matrix backtested against 1,240 historical appointments, with derived precision, recall, F1, and accuracy:

| Metric | Value | Meaning |
|---|---|---|
| Precision | 83.1% | Of appointments predicted to no-show, 83% actually did |
| Recall | 78.8% | Of appointments that actually no-showed, 79% were correctly flagged |
| F1 Score | 80.9% | Harmonic mean of precision and recall |
| Accuracy | 90.6% | Overall correct predictions across both classes |

## Command Palette

`⌘K` (macOS) or `Ctrl+K` (Windows/Linux) opens a global search. Typing a page name jumps to it; typing a patient name searches the active clinic's schedule and opens that patient's detail panel directly, without navigating through the dashboard table first.

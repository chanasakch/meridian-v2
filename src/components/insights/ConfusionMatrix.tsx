import { Card, CardHeader } from "../ui/Card";

const MATRIX = {
  truePositive: 246,
  falsePositive: 50,
  falseNegative: 66,
  trueNegative: 878,
};

const total = MATRIX.truePositive + MATRIX.falsePositive + MATRIX.falseNegative + MATRIX.trueNegative;
const precision = MATRIX.truePositive / (MATRIX.truePositive + MATRIX.falsePositive);
const recall = MATRIX.truePositive / (MATRIX.truePositive + MATRIX.falseNegative);
const f1 = (2 * precision * recall) / (precision + recall);
const accuracy = (MATRIX.truePositive + MATRIX.trueNegative) / total;

const METRICS = [
  { label: "Precision", value: precision },
  { label: "Recall", value: recall },
  { label: "F1 Score", value: f1 },
  { label: "Accuracy", value: accuracy },
];

export function ConfusionMatrix() {
  return (
    <Card>
      <CardHeader title="Model Performance" subtitle={`Backtested on ${total.toLocaleString()} appointments · trailing 90 days`} />
      <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2">
        <div>
          <div className="grid grid-cols-[auto_1fr_1fr] gap-1 text-center text-xs">
            <div />
            <div className="pb-1 font-medium text-muted-foreground">Predicted No-Show</div>
            <div className="pb-1 font-medium text-muted-foreground">Predicted Show</div>

            <div className="flex items-center justify-end pr-2 font-medium text-muted-foreground">Actual No-Show</div>
            <MatrixCell value={MATRIX.truePositive} tone="correct" label="True Positive" />
            <MatrixCell value={MATRIX.falseNegative} tone="incorrect" label="False Negative" />

            <div className="flex items-center justify-end pr-2 font-medium text-muted-foreground">Actual Show</div>
            <MatrixCell value={MATRIX.falsePositive} tone="incorrect" label="False Positive" />
            <MatrixCell value={MATRIX.trueNegative} tone="correct" label="True Negative" />
          </div>
        </div>

        <div className="space-y-3">
          {METRICS.map((metric) => (
            <div key={metric.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{metric.label}</span>
                <span className="font-semibold text-foreground">{(metric.value * 100).toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-brand" style={{ width: `${metric.value * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function MatrixCell({ value, tone, label }: { value: number; tone: "correct" | "incorrect"; label: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg py-4 ${
        tone === "correct" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
      }`}
      title={label}
    >
      <span className="text-xl font-bold">{value}</span>
      <span className="mt-0.5 text-[10px] uppercase tracking-wide opacity-70">{label}</span>
    </div>
  );
}

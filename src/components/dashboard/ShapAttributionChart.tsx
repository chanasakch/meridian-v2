import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FeatureContribution } from "../../types";
import { formatSignedPoints } from "../../utils/format";

interface TooltipPayloadItem {
  payload: FeatureContribution;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg bg-card px-3 py-2 text-xs shadow-lg ring-1 ring-border">
      <p className="font-semibold text-card-foreground">{item.label}</p>
      <p className="mt-0.5 text-muted-foreground">{item.detail}</p>
      <p className={`mt-1 font-bold ${item.points >= 0 ? "text-rose-500" : "text-emerald-500"}`}>
        {formatSignedPoints(item.points)} risk
      </p>
    </div>
  );
}

/**
 * Recharts renders diverging horizontal bars as an SVG <rect> with a
 * (possibly negative) `width` when the value is below the reference line.
 * A negative-width <rect> is invalid SVG and simply doesn't paint, so
 * negative contributions ("green" bars) render invisibly with the
 * built-in shape. This custom shape normalizes x/width instead.
 */
function DivergingBar(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: FeatureContribution;
}) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  const normalizedX = width < 0 ? x + width : x;
  const normalizedWidth = Math.abs(width);
  const fill = (payload?.points ?? 0) >= 0 ? "#f43f5e" : "#10b981";
  return <rect x={normalizedX} y={y} width={normalizedWidth} height={height} rx={4} fill={fill} />;
}

export function ShapAttributionChart({ contributions }: { contributions: FeatureContribution[] }) {
  const maxAbs = Math.max(...contributions.map((c) => Math.abs(c.points)), 5);
  const niceMax = Math.max(10, Math.ceil(maxAbs / 10) * 10);
  const data = [...contributions].sort((a, b) => a.points - b.points);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
          <XAxis
            type="number"
            domain={[-niceMax, niceMax]}
            ticks={[-niceMax, -niceMax / 2, 0, niceMax / 2, niceMax]}
            tickFormatter={(v: number) => `${Math.round(v)}%`}
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-muted-foreground"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={128}
            tick={{ fontSize: 12, fill: "currentColor" }}
            className="text-foreground"
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine x={0} stroke="currentColor" className="text-border" />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(128,128,128,0.08)" }} />
          <Bar dataKey="points" maxBarSize={18} shape={DivergingBar} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

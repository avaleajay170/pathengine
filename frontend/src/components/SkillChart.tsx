import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLearnerProfile } from "@/lib/learner-profile";
import { useSkillHistory } from "@/hooks/use-activity";

const fallbackSkillLevels: Array<[string, number]> = [
  ["Python", 35],
  ["Statistics", 28],
  ["Machine Learning", 18],
  ["SQL", 40],
];

function SkillTable({
  caption,
  rows,
}: {
  caption: string;
  rows: Array<Record<string, string | number>>;
}) {
  if (rows.length === 0) {
    return <p className="sr-only">No skill data is available yet.</p>;
  }

  const columns = Object.keys(rows[0]!);
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {columns.map((column) => (
              <td key={column}>{row[column]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function chartTooltipStyle() {
  return {
    background: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: 12,
    fontSize: 12,
  };
}

export function SkillRadar({ height = 260 }: { height?: number }) {
  const { profile } = useLearnerProfile();
  const entries = Object.entries(profile.skillLevels);
  const data = (entries.length > 0 ? entries : fallbackSkillLevels).map(([skill, value]) => ({
    skill,
    current: Number(value) || 0,
    target: 80,
  }));

  return (
    <div>
      <div role="img" aria-label="Radar chart comparing current and target skill levels">
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="var(--color-border)" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            />
            <Radar
              name="Target"
              dataKey="target"
              stroke="var(--color-ai)"
              fill="var(--color-ai)"
              fillOpacity={0.12}
            />
            <Radar
              name="Current"
              dataKey="current"
              stroke="var(--color-primary)"
              fill="var(--color-primary)"
              fillOpacity={0.35}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <SkillTable caption="Current and target skill levels" rows={data} />
    </div>
  );
}

export function SkillGapBars({ height = 240 }: { height?: number }) {
  const { profile } = useLearnerProfile();
  const entries = Object.entries(profile.skillLevels);
  const data = (entries.length > 0 ? entries : fallbackSkillLevels).map(([skill, value]) => ({
    skill,
    current: Number(value) || 0,
    target: 80,
  }));

  return (
    <div>
      <div role="img" aria-label="Bar chart comparing current and target skill levels">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="vertical" margin={{ left: 12 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="skill"
              width={92}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: "var(--color-muted)" }} contentStyle={chartTooltipStyle()} />
            <Bar dataKey="target" fill="var(--color-ai-soft)" radius={6} barSize={10} />
            <Bar dataKey="current" fill="var(--color-primary)" radius={6} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <SkillTable caption="Skill gap values" rows={data} />
    </div>
  );
}

const trendColors = [
  "var(--color-primary)",
  "var(--color-ai)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
] as const;

export function SkillTrend({ height = 280 }: { height?: number }) {
  const { data } = useSkillHistory();
  const rows = data?.data ?? [];
  const series = Object.keys(rows[0] ?? {}).filter((key) => key !== "month");

  if (rows.length === 0 || series.length === 0) {
    return <p className="text-sm text-muted-foreground">No skill trend data is available yet.</p>;
  }

  return (
    <div>
      <div role="img" aria-label="Line chart showing monthly skill growth">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={rows} margin={{ left: 8, right: 8, top: 8 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={chartTooltipStyle()} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {series.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={trendColors[index % trendColors.length]}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <SkillTable caption="Monthly skill trend values" rows={rows} />
    </div>
  );
}

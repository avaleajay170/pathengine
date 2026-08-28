import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { skillTrend } from "@/data/mock";
import type { LearnerProfile } from "@/data/mock";
import { useLearnerProfile } from "@/lib/learner-profile";

export function SkillRadar({ height = 260 }: { height?: number }) {
  const { profile } = useLearnerProfile();
  const data = Object.entries(profile.skillLevels).map(([skill, value]) => ({
    skill,
    current: Number(value) || 0,
    target: 80,
  }));
  return (
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
  );
}

export function SkillGapBars({ height = 240 }: { height?: number }) {
  const { profile } = useLearnerProfile();
  const data = Object.entries(profile.skillLevels).map(([skill, value]) => ({
    skill,
    current: Number(value) || 0,
    target: 80,
  }));
  return (
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
        <Tooltip
          cursor={{ fill: "var(--color-muted)" }}
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Bar dataKey="target" fill="var(--color-ai-soft)" radius={6} barSize={10} />
        <Bar dataKey="current" fill="var(--color-primary)" radius={6} barSize={10} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SkillTrend({ height = 260 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={skillTrend}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="Python" stroke="var(--color-chart-1)" strokeWidth={2} />
        <Line type="monotone" dataKey="Statistics" stroke="var(--color-chart-2)" strokeWidth={2} />
        <Line type="monotone" dataKey="ML" stroke="var(--color-chart-5)" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

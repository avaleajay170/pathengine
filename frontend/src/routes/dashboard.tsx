import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Footer } from "@/components/Footer";
import { MilestoneTracker } from "@/components/MilestoneTracker";
import { SkillRadar, SkillTrend } from "@/components/SkillChart";
import {
  Activity as ActivityIcon,
  ArrowRight,
  Award,
  CalendarClock,
  Clock,
  Flame,
  FlaskConical,
  PlayCircle,
  Sparkle,
  Target,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { activity, getCourse } from "@/data/mock";
import type { PathNodeItem } from "@/data/mock";
import { useAssistant } from "@/lib/assistant";
import { useLearnerProfile } from "@/lib/learner-profile";
import { generateLearningPath } from "@/lib/learning-path";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Lumina" },
      {
        name: "description",
        content:
          "Track progress, skill growth, milestones and your next recommended actions on your personalized learning path.",
      },
      { property: "og:title", content: "Dashboard — Lumina" },
      {
        property: "og:description",
        content: "Progress, skill growth and next actions at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

const kindIcon = {
  course: PlayCircle,
  project: Wrench,
  assessment: FlaskConical,
} as const;

function progressOf(node: PathNodeItem, completedCourses: string[]) {
  if (node.status === "completed") return 100;
  return node.courseId && completedCourses.includes(node.courseId) ? 100 : 0;
}

export function completedHours(nodes: PathNodeItem[]): number {
  return nodes
    .filter((node) => node.status === "completed")
    .reduce((total, node) => total + (Number.parseInt(node.duration, 10) || 0), 0);
}

function Dashboard() {
  const { send, setOpen } = useAssistant();
  const { profile } = useLearnerProfile();
  const path = generateLearningPath(profile);
  const allNodes = path.milestones.flatMap((m) => m.nodes);

  const summary = [
    {
      label: "Overall progress",
      value: `${path.progress}%`,
      icon: TrendingUp,
      detail: `${allNodes.filter((n) => n.status === "completed").length} of ${allNodes.length} steps`,
      bar: path.progress,
    },
    {
      label: "Current streak",
      value: `${profile.completedCourses.length}`,
      icon: Flame,
      detail: "courses completed",
    },
    {
      label: "Hours learned",
      value: `${completedHours(allNodes)}`,
      icon: Clock,
      detail: `${profile.hoursPerWeek} hrs/week planned`,
    },
    {
      label: "Skills mastered",
      value: `${new Set(allNodes.flatMap((node) => node.skills)).size}`,
      icon: Award,
      detail: `${Object.keys(profile.skillLevels).length} tracked toward your goal`,
    },
  ];

  // Next actions: what to do now, including assessments and projects.
  const actionable = allNodes.filter((n) => n.status === "in-progress" || n.status === "available");
  const nextActions = [...actionable];
  if (nextActions.length < 3) {
    const upcoming = allNodes.find((n) => n.status === "locked");
    if (upcoming) nextActions.push(upcoming);
  }

  // Continue learning: nodes that map to a real course and have been started.
  const continueNodes = allNodes.filter((n) => n.courseId && n.status !== "locked").slice(0, 3);

  const askLumi = (prompt: string) => {
    setOpen(true);
    send(prompt);
  };

  return (
    <main>
      {/* Header */}
      <section className="gradient-hero border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Welcome back</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {profile.name}'s dashboard
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
              <Target className="size-4 text-primary" />
              {profile.goal}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              <CalendarClock className="size-3.5" />
              Goal date {path.eta}
            </Badge>
            <Button asChild>
              <Link to="/path/$id" params={{ id: path.id }}>
                View full roadmap
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Summary cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {summary.map((s) => (
            <div key={s.label} className="surface-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <s.icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold">{s.value}</p>
              {s.bar !== undefined ? <Progress value={s.bar} className="mt-3 h-1.5" /> : null}
              <p className="mt-2 text-xs text-muted-foreground">{s.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {/* Main column */}
          <div className="space-y-8">
            {/* Next recommended actions */}
            <section className="surface-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold">
                    <Sparkle className="size-4 text-ai" />
                    Next recommended actions
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ranked by what unblocks the most of your remaining roadmap.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-ai"
                  onClick={() => askLumi("What should I do next?")}
                >
                  Ask Lumi
                </Button>
              </div>

              <ol className="mt-5 space-y-3">
                {nextActions.map((node, i) => {
                  const Icon = kindIcon[node.kind];
                  const locked = node.status === "locked";
                  return (
                    <li
                      key={node.id}
                      className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-4"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">{node.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {locked
                              ? "Unlocks next"
                              : node.status === "in-progress"
                                ? "In progress"
                                : "Ready"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {node.duration} · {node.skills.join(", ")}
                        </p>
                      </div>
                      {node.courseId && !locked ? (
                        <Button size="sm" asChild>
                          <Link to="/course/$id" params={{ id: node.courseId }}>
                            {node.status === "in-progress" ? "Continue" : "Start"}
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/path/$id" params={{ id: path.id }}>
                            {i === nextActions.length - 1 && locked ? "See roadmap" : "Open"}
                          </Link>
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* Skill development */}
            <section className="surface-card p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Skill development</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Measured scores over the last six months.
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="size-3" />
                  Statistics +30 since March
                </Badge>
              </div>
              <div className="mt-6">
                <SkillTrend height={270} />
              </div>
            </section>

            {/* Continue learning */}
            <section>
              <h2 className="text-lg font-bold">Continue learning</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {continueNodes.map((node) => {
                  const course = node.courseId ? getCourse(node.courseId) : undefined;
                  if (!course) return null;
                  const pct = progressOf(node, profile.completedCourses);
                  return (
                    <article
                      key={node.id}
                      className="surface-card hover-lift flex flex-col overflow-hidden"
                    >
                      <div
                        className="h-20 w-full"
                        style={{
                          backgroundImage: `linear-gradient(135deg, oklch(0.62 0.16 ${course.thumbHue}), oklch(0.48 0.18 ${course.thumbHue + 25}))`,
                        }}
                      />
                      <div className="flex flex-1 flex-col p-5">
                        <p className="text-xs text-muted-foreground">{course.provider}</p>
                        <h3 className="mt-1 line-clamp-2 text-sm leading-snug font-semibold">
                          {course.title}
                        </h3>
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{pct}% complete</span>
                            <span className="text-muted-foreground">{course.hours} hrs</span>
                          </div>
                          <Progress value={pct} className="mt-1.5 h-1.5" />
                        </div>
                        <Button size="sm" className="mt-4 w-full" asChild>
                          <Link to="/course/$id" params={{ id: course.id }}>
                            {pct === 100 ? "Review" : pct > 0 ? "Continue" : "Start"}
                          </Link>
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="surface-card p-5">
              <h3 className="font-semibold">Skills vs. target role</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Current profile against the {profile.targetRole} benchmark.
              </p>
              <div className="mt-3">
                <SkillRadar height={250} />
              </div>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Milestones</h3>
                <Link
                  to="/path/$id"
                  params={{ id: path.id }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="mt-4">
                <MilestoneTracker milestones={path.milestones} />
              </div>
            </div>

            <div className="surface-card p-5">
              <h3 className="flex items-center gap-2 font-semibold">
                <ActivityIcon className="size-4 text-primary" />
                Recent activity
              </h3>
              <ul className="mt-4 space-y-4">
                {activity.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm leading-snug">{a.text}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.when}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Footer } from "@/components/Footer";
import { PathNode } from "@/components/PathNode";
import { MilestoneTracker } from "@/components/MilestoneTracker";
import { SkillGapBars } from "@/components/SkillChart";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarClock,
  Frown,
  Gauge,
  MessageCircle,
  Rabbit,
  SlidersHorizontal,
  Sparkle,
  Target,
  XCircle,
} from "lucide-react";
import { getPath } from "@/data/mock";
import { generateLearningPath } from "@/lib/learning-path";
import { useAssistant } from "@/lib/assistant";
import { useLearnerProfile } from "@/lib/learner-profile";

export const Route = createFileRoute("/path/$id")({
  head: ({ params }) => {
    const path = getPath(params.id);
    const title = path ? `${path.title} — Lumina` : "Learning path — Lumina";
    const description =
      path?.goal ?? "An adaptive roadmap sequenced against your measured skill gaps.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: PathPage,
});

function PathPage() {
  const { id } = Route.useParams();
  const { send, setOpen } = useAssistant();
  const { profile, updateProfile, submitNodeFeedback } = useLearnerProfile();
  const path = getPath(id) ? generateLearningPath(profile) : undefined;

  if (!path) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold">We couldn't find that path</h1>
        <p className="mt-2 text-muted-foreground">
          The roadmap you're looking for doesn't exist or was renamed.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/paths">Browse learning paths</Link>
        </Button>
      </main>
    );
  }

  const allNodes = path.milestones.flatMap((m) => m.nodes);
  const done = allNodes.filter((n) => n.status === "completed").length;
  const activeNode = allNodes.find((n) => n.status === "in-progress");
  const remainingHours = allNodes
    .filter((n) => n.status !== "completed")
    .reduce((sum, n) => sum + (parseInt(n.duration, 10) || 0), 0);

  // The skill furthest below its benchmark — reduce keeps this non-optional.
  const widestGap = Object.entries(profile.skillLevels).reduce(
    (worst, [skill, value]) => {
      const current = Number(value) || 0;
      return 80 - current > worst.target - worst.current ? { skill, current, target: 80 } : worst;
    },
    { skill: "your next skill", current: 0, target: 80 } as {
      skill: string;
      current: number;
      target: number;
    },
  );

  const askLumi = (prompt: string) => {
    setOpen(true);
    send(prompt);
  };

  const adapt = (signal: string, outcome: string) => {
    const feedback =
      signal === "too easy" ? "too-easy" : signal === "too hard" ? "too-difficult" : "not-relevant";
    if (activeNode) submitNodeFeedback(activeNode.id, feedback);
    if (signal === "too easy") updateProfile({ pace: "fast" });
    if (signal === "too hard") updateProfile({ pace: "slow" });
    toast.success("Feedback saved", { description: outcome });
  };

  return (
    <main>
      {/* Path header */}
      <section className="gradient-hero border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <Link
            to="/paths"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All learning paths
          </Link>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Badge className="gap-1 bg-ai-soft text-ai">
                <Sparkle className="size-3" />
                Personalized for {profile.name}
              </Badge>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {path.title}
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">{path.goal}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="outline">{path.level}</Badge>
                <Badge variant="secondary">{path.courses} courses</Badge>
                <Badge variant="secondary">{path.weeks} weeks</Badge>
                <Badge variant="secondary" className="gap-1">
                  <Gauge className="size-3" />
                  {profile.hoursPerWeek} hrs/week
                </Badge>
              </div>
            </div>

            {/* Progress panel */}
            <div className="surface-card w-full p-6 lg:max-w-sm">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall progress</p>
                  <p className="text-4xl font-extrabold text-primary">{path.progress}%</p>
                </div>
                <p className="text-right text-sm text-muted-foreground">
                  {done} of {allNodes.length} steps
                  <span className="block">{remainingHours} hrs left</span>
                </p>
              </div>
              <Progress value={path.progress} className="mt-4" />
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarClock className="size-4 text-primary" />
                On track for <span className="font-semibold text-foreground">{path.eta}</span>
              </div>
              <div className="mt-5 flex gap-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => askLumi("Adjust my pace")}
                >
                  <SlidersHorizontal className="size-4" />
                  Adjust path
                </Button>
                <Button
                  className="flex-1 text-ai"
                  variant="outline"
                  onClick={() => askLumi("What should I do next?")}
                >
                  <MessageCircle className="size-4" />
                  Ask Lumi
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Timeline */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Your roadmap</h2>
            {activeNode && (
              <p className="text-sm text-muted-foreground">
                Active now:{" "}
                <span className="font-semibold text-foreground">{activeNode.title}</span>
              </p>
            )}
          </div>

          <div className="relative mt-8">
            {/* the path line threading every stage and node */}
            <span
              aria-hidden="true"
              className="absolute top-4 bottom-4 left-4 w-px -translate-x-1/2 bg-border"
            />

            {path.milestones.map((milestone, i) => {
              const stageDone = milestone.nodes.filter((n) => n.status === "completed").length;
              const stageComplete = stageDone === milestone.nodes.length;
              return (
                <section key={milestone.id} className={i === 0 ? "" : "mt-12"}>
                  {/* Stage gate */}
                  <header className="relative pl-10">
                    <span
                      className={`absolute left-0 flex size-8 items-center justify-center rounded-xl text-xs font-bold ring-4 ring-background ${
                        stageComplete
                          ? "bg-success text-success-foreground"
                          : "gradient-ai text-primary-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      Stage {i + 1} of {path.milestones.length}
                    </p>
                    <h3 className="mt-1 text-xl font-bold tracking-tight">{milestone.title}</h3>
                    <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                      {milestone.summary}
                    </p>
                    <p className="mt-2 text-xs font-medium text-muted-foreground">
                      {stageDone}/{milestone.nodes.length} steps complete
                    </p>
                  </header>

                  <div className="mt-6 space-y-6">
                    {milestone.nodes.map((node) => (
                      <PathNode key={node.id} node={node} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <div className="surface-card p-5">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              <h3 className="font-semibold">Skill gap</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Where you are now against the {profile.targetRole} benchmark.
            </p>
            <div className="mt-4">
              <SkillGapBars height={230} />
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary" />
                Current
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-ai-soft" />
                Target
              </span>
            </div>
            <p className="mt-4 rounded-xl border border-ai/25 bg-ai-soft p-3 text-xs text-ai-foreground/90">
              Widest gap: <span className="font-semibold">{widestGap.skill}</span> —{" "}
              {widestGap.current}% vs {widestGap.target}% target. Your next two stages spend most of
              their hours here.
            </p>
          </div>

          <div className="surface-card p-5">
            <h3 className="font-semibold">Milestones</h3>
            <div className="mt-4">
              <MilestoneTracker milestones={path.milestones} />
            </div>
          </div>

          <div className="surface-card p-5">
            <h3 className="font-semibold">Adapt my path</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Tell Lumi how the plan feels and every remaining node re-sequences.
            </p>
            <div className="mt-4 grid gap-2">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() =>
                  adapt("too easy", "Compressed 3 overlapping modules — 12 hours saved this month.")
                }
              >
                <Rabbit className="size-4" />
                Too easy
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() =>
                  adapt("too hard", "Added two shorter primers and moved your ETA back by 9 days.")
                }
              >
                <Frown className="size-4" />
                Too hard
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() =>
                  adapt(
                    "not interested",
                    "Swapped the flagged node for a project that targets the same two skills.",
                  )
                }
              >
                <XCircle className="size-4" />
                Not interested
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </main>
  );
}

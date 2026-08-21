import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatThread } from "@/components/Chat";
import { Bot, Check, Clock, Gauge, Target, TrendingDown } from "lucide-react";
import { getCourse, getPathOrDefault, learner } from "@/data/mock";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Ask Lumi — Lumina" },
      {
        name: "description",
        content:
          "Chat with Lumi about why a course was recommended, how to change your pace, or what to learn next.",
      },
      { property: "og:title", content: "Ask Lumi — Lumina" },
      {
        property: "og:description",
        content: "The conversational way to reshape your learning path.",
      },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  const path = getPathOrDefault("ml-engineer");
  const gaps = [...learner.skills]
    .sort((a, b) => b.target - b.current - (a.target - a.current))
    .slice(0, 3);

  return (
    <main className="mx-auto flex h-[calc(100vh-4rem)] max-w-7xl gap-6 px-4 py-6 sm:px-6">
      {/* Context sidebar — what Lumi is reasoning over */}
      <aside className="hidden w-72 shrink-0 space-y-5 overflow-y-auto pb-2 lg:block">
        <div className="surface-card p-5">
          <div className="flex items-center gap-3">
            <span className="gradient-ai flex size-10 items-center justify-center rounded-xl">
              <Bot className="size-5 text-primary-foreground" />
            </span>
            <div>
              <p className="font-semibold">Lumi</p>
              <p className="text-xs text-muted-foreground">Your learning strategist</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Lumi answers from your profile, not a generic catalogue. Everything below is in
            context for this conversation.
          </p>
        </div>

        <div className="surface-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Target className="size-4 text-primary" />
            Your goal
          </h2>
          <p className="mt-2 text-sm">{learner.goal}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="gap-1">
              <Clock className="size-3" />
              {learner.hoursPerWeek} hrs/week
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Gauge className="size-3" />
              {path.progress}% done
            </Badge>
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
            <Link to="/path/$id" params={{ id: path.id }}>
              Open roadmap
            </Link>
          </Button>
        </div>

        <div className="surface-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <TrendingDown className="size-4 text-ai" />
            Widest skill gaps
          </h2>
          <ul className="mt-3 space-y-2">
            {gaps.map((g) => (
              <li key={g.skill} className="flex items-center justify-between text-sm">
                <span>{g.skill}</span>
                <span className="text-xs text-muted-foreground">
                  {g.current}% → {g.target}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Check className="size-4 text-success" />
            Already credited
          </h2>
          <ul className="mt-3 space-y-2">
            {learner.completedCourses.map((id) => {
              const course = getCourse(id);
              if (!course) return null;
              return (
                <li key={id}>
                  <Link
                    to="/course/$id"
                    params={{ id }}
                    className="text-sm text-muted-foreground hover:text-primary hover:underline"
                  >
                    {course.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Chat */}
      <div className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-border p-4">
          <span className="gradient-ai flex size-9 items-center justify-center rounded-lg lg:hidden">
            <Bot className="size-4 text-primary-foreground" />
          </span>
          <div className="min-w-0">
            <h1 className="font-semibold">Ask Lumi</h1>
            <p className="truncate text-xs text-muted-foreground">
              Reasoning over your goal, {learner.skills.length} tracked skills and{" "}
              {learner.completedCourses.length} completed courses
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto hidden shrink-0 gap-1 sm:flex">
            Prototype · simulated replies
          </Badge>
        </header>

        <ChatThread />
      </div>
    </main>
  );
}

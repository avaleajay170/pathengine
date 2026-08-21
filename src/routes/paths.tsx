import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { BookOpen, Clock, Layers } from "lucide-react";
import { learningPaths } from "@/data/mock";

export const Route = createFileRoute("/paths")({
  head: () => ({
    meta: [
      { title: "Learning Paths — Lumina" },
      {
        name: "description",
        content:
          "Browse role-based learning paths: ML engineer, data analyst and full-stack developer, each with milestones and projects.",
      },
      { property: "og:title", content: "Learning Paths — Lumina" },
      {
        property: "og:description",
        content: "Role-based roadmaps with milestones, prerequisites and capstone projects.",
      },
    ],
  }),
  component: Paths,
});

function Paths() {
  return (
    <main>
      <div className="gradient-hero border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight">Learning paths</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Start from a role-based roadmap — Lumina re-sequences it against your skill assessment
            the moment you join.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
        {learningPaths.map((p) => (
          <article key={p.id} className="surface-card hover-lift flex flex-col p-6">
            <span className="gradient-ai flex size-10 items-center justify-center rounded-xl">
              <BookOpen className="size-5 text-primary-foreground" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">{p.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{p.goal}</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {p.milestones.map((m) => (
                <li key={m.id} className="flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  {m.title} · {m.nodes.length} steps
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Clock className="size-3" />
                {p.weeks} weeks
              </Badge>
              <Badge variant="outline">{p.level}</Badge>
              <Badge variant="secondary">{p.courses} courses</Badge>
            </div>
            <Button className="mt-6 w-full" asChild>
              <Link to="/path/$id" params={{ id: p.id }}>
                View roadmap
              </Link>
            </Button>
          </article>
        ))}
      </div>
      <Footer />
    </main>
  );
}

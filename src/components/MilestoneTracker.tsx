import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { Milestone } from "@/data/mock";

export function MilestoneTracker({ milestones }: { milestones: Milestone[] }) {
  return (
    <ol className="space-y-4">
      {milestones.map((m) => {
        const done = m.nodes.filter((n) => n.status === "completed").length;
        const active = m.nodes.some((n) => n.status === "in-progress" || n.status === "available");
        const complete = done === m.nodes.length;
        const Icon = complete ? CheckCircle2 : active ? Loader2 : Circle;
        return (
          <li key={m.id} className="flex gap-3">
            <Icon
              className={`mt-0.5 size-5 shrink-0 ${
                complete ? "text-success" : active ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <div>
              <p className="text-sm font-semibold">{m.title}</p>
              <p className="text-xs text-muted-foreground">
                {done}/{m.nodes.length} steps · {m.summary}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

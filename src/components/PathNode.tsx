import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronDown,
  CircleDot,
  FlaskConical,
  Lock,
  PlayCircle,
  Sparkle,
  ThumbsDown,
  ThumbsUp,
  Wrench,
} from "lucide-react";
import type { PathNodeItem } from "@/data/mock";
import { useAssistant } from "@/lib/assistant";

const statusMeta = {
  completed: { label: "Completed", icon: CheckCircle2, cls: "bg-success text-success-foreground" },
  "in-progress": { label: "In progress", icon: PlayCircle, cls: "bg-primary text-primary-foreground" },
  available: { label: "Available", icon: CircleDot, cls: "bg-accent text-accent-foreground" },
  locked: { label: "Locked", icon: Lock, cls: "bg-muted text-muted-foreground" },
} as const;

const kindIcon = {
  course: PlayCircle,
  project: Wrench,
  assessment: FlaskConical,
} as const;

export function PathNode({ node }: { node: PathNodeItem }) {
  const [open, setOpen] = useState(false);
  const { explain } = useAssistant();
  const meta = statusMeta[node.status];
  const KindIcon = kindIcon[node.kind];
  const StatusIcon = meta.icon;

  const adapt = (signal: string) => {
    toast("Adapting your path…", {
      description: `Lumi is re-sequencing "${node.title}" after your “${signal}” feedback.`,
    });
    window.setTimeout(
      () =>
        toast.success("Path updated", {
          description:
            signal === "too easy"
              ? "Replaced with an advanced checkpoint — 12 hours saved this month."
              : "Added a shorter primer before this node and pushed your ETA by 4 days.",
        }),
      1400,
    );
  };

  return (
    <div className="relative pl-10">
      <span
        className={`absolute left-0 flex size-8 items-center justify-center rounded-full ring-4 ring-background ${meta.cls}`}
      >
        <StatusIcon className="size-4" />
      </span>

      <div
        className={`surface-card hover-lift p-5 ${node.status === "locked" ? "opacity-70" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <KindIcon className="size-3" />
            {node.kind}
          </Badge>
          <Badge variant="outline">{meta.label}</Badge>
          <span className="text-xs text-muted-foreground">{node.duration}</span>
          {node.requires?.length ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="gap-1 border-warning/50 text-warning-foreground">
                    <Lock className="size-3" />
                    Prerequisites
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Requires: {node.requires.join(", ")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </div>

        <h3 className="mt-3 text-base font-semibold">{node.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{node.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {node.skills.map((s) => (
            <Badge key={s} variant="secondary">
              {s}
            </Badge>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {node.courseId && node.status !== "locked" && (
            <Button size="sm" asChild>
              <Link to="/course/$id" params={{ id: node.courseId }}>
                {node.status === "in-progress" ? "Continue" : "Start"}
              </Link>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-ai"
            onClick={() => explain({ title: node.title, reason: node.reason, courseId: node.courseId })}
          >
            <Sparkle className="size-4" />
            Why this?
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen((o) => !o)}>
            Details
            <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </Button>

          <div className="ml-auto flex items-center gap-1">
            <Button size="icon" variant="ghost" aria-label="Good fit" onClick={() => adapt("good fit")}>
              <ThumbsUp className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" aria-label="Too easy" onClick={() => adapt("too easy")}>
              <ThumbsDown className="size-4" />
            </Button>
          </div>
        </div>

        {open && (
          <div className="mt-4 rounded-xl border border-ai/25 bg-ai-soft p-4 text-sm">
            <p className="font-semibold text-ai-foreground">Why Lumi placed this here</p>
            <p className="mt-1 text-ai-foreground/85">{node.reason}</p>
          </div>
        )}
      </div>
    </div>
  );
}

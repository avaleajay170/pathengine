import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";

interface AuthShellProps {
  badge: string;
  title: string;
  description: string;
  asideTitle: string;
  asideBody: string;
  footerPrompt: string;
  footerLinkLabel: string;
  footerLinkTo: "/login" | "/signup";
  children: ReactNode;
}

export function AuthShell({
  badge,
  title,
  description,
  asideTitle,
  asideBody,
  footerPrompt,
  footerLinkLabel,
  footerLinkTo,
  children,
}: AuthShellProps) {
  return (
    <main className="gradient-hero min-h-[calc(100vh-4rem)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <section className="surface-card p-8 sm:p-10">
          <Badge className="gap-1 bg-ai-soft text-ai">{badge}</Badge>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">{description}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-sm text-muted-foreground">
            {footerPrompt}{" "}
            <Link to={footerLinkTo} className="font-semibold text-primary hover:underline">
              {footerLinkLabel}
            </Link>
          </p>
        </section>

        <aside className="surface-card flex flex-col justify-between overflow-hidden p-8 sm:p-10">
          <div>
            <span className="gradient-ai flex size-12 items-center justify-center rounded-2xl">
              <GraduationCap className="size-6 text-primary-foreground" />
            </span>
            <h2 className="mt-6 text-2xl font-bold tracking-tight">{asideTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{asideBody}</p>
          </div>

          <div className="mt-10 space-y-4 rounded-2xl border border-border bg-secondary/70 p-5">
            <div>
              <p className="text-sm font-semibold">Why create an account?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep your roadmap, progress, and course preferences tied to one identity without
                changing the existing learner profile schema.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Save your learning path separately from guest storage.</li>
              <li>Reuse your name and email across onboarding and dashboard screens.</li>
              <li>Stay compatible with the current mock flow and future backend auth.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

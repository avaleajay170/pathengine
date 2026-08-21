import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import {
  BarChart3,
  Check,
  ClipboardList,
  GitBranch,
  MessageSquareText,
  Route as RouteIcon,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { courses, learningPaths, stats } from "@/data/mock";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & pricing — Lumina" },
      {
        name: "description",
        content:
          "What Lumina does, the six pieces of the product, and how the prototype was built for the hackathon.",
      },
      { property: "og:title", content: "About & pricing — Lumina" },
      {
        property: "og:description",
        content: "An AI learning path recommender built around measured skill gaps.",
      },
    ],
  }),
  component: About,
});

const features = [
  {
    icon: ClipboardList,
    title: "Learner profiling",
    body: "A five-step intake captures your goal in plain language, a self-assessment across five skills, prior courses worth crediting, and the hours you actually have.",
    to: "/onboarding" as const,
    linkLabel: "Try the intake",
  },
  {
    icon: RouteIcon,
    title: "Path generator",
    body: "Courses, projects and assessments are sequenced into milestone stages with real prerequisite gates, so nothing unlocks before you can pass it.",
    to: "/paths" as const,
    linkLabel: "See the roadmaps",
  },
  {
    icon: MessageSquareText,
    title: "Conversational assistant",
    body: "Lumi answers from your profile rather than a generic catalogue. Every recommendation in the app carries a “Why this?” button that opens the reasoning.",
    to: "/assistant" as const,
    linkLabel: "Talk to Lumi",
  },
  {
    icon: GitBranch,
    title: "Adaptive re-planning",
    body: "Flag a step as too easy, too hard or irrelevant and the remaining stages re-sequence — compressing overlap or inserting a primer, and moving your goal date honestly.",
    to: "/paths" as const,
    linkLabel: "Try the controls",
  },
  {
    icon: BarChart3,
    title: "Skill-gap analytics",
    body: "Your current level is scored against a role benchmark on every tracked skill, so you can see which gap each course actually closes before enrolling.",
    to: "/dashboard" as const,
    linkLabel: "View the charts",
  },
  {
    icon: TrendingUp,
    title: "Progress tracking",
    body: "Streaks, hours, skills mastered and a milestone tracker, plus a next-actions list ranked by how much of the remaining roadmap each step unblocks.",
    to: "/dashboard" as const,
    linkLabel: "Open the dashboard",
  },
];

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "One active path and the full assistant.",
    features: ["1 learning path", "Skill-gap scoring", "Ask Lumi, unlimited", "Progress tracking"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Plus",
    price: "$18",
    cadence: "per month",
    blurb: "For people changing roles on a deadline.",
    features: [
      "Unlimited paths",
      "Adaptive re-planning",
      "Transcript import & credit",
      "Goal-date forecasting",
      "Certificates",
    ],
    cta: "Choose Plus",
    highlighted: true,
  },
  {
    name: "Teams",
    price: "$39",
    cadence: "per seat / month",
    blurb: "Skill matrices for a whole function.",
    features: [
      "Everything in Plus",
      "Team skill matrix",
      "Role benchmark editor",
      "Manager reporting",
      "SSO",
    ],
    cta: "Talk to us",
    highlighted: false,
  },
];

function About() {
  return (
    <main>
      {/* Hero */}
      <section className="gradient-hero border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <Badge className="gap-1 bg-ai-soft text-ai">
            <Sparkles className="size-3" />
            About Lumina
          </Badge>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Most learning platforms sell you a catalogue. We sell you a sequence.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Lumina takes a goal written in plain language, measures where you actually are against
            the role you're aiming at, and turns {courses.length} courses into one ordered roadmap
            that re-plans itself as you learn.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/onboarding">Build my path</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/explore">Browse courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The six pieces */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">What's in the product</h2>
          <p className="mt-2 text-muted-foreground">
            Six pieces, each one built around the same idea: never recommend anything you can't
            explain.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="surface-card hover-lift flex flex-col p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              <Link
                to={f.to}
                className="mt-4 text-sm font-medium text-primary hover:underline"
              >
                {f.linkLabel} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="border-y border-border bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">Pricing</h2>
            <p className="mt-2 text-muted-foreground">
              Indicative pricing for the prototype — nothing here charges a card.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {tiers.map((t) => (
              <article
                key={t.name}
                className={`surface-card flex flex-col p-6 ${
                  t.highlighted ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{t.name}</h3>
                  {t.highlighted && <Badge>Most popular</Badge>}
                </div>
                <p className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold">{t.price}</span>
                  <span className="text-sm text-muted-foreground">{t.cadence}</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{t.blurb}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={t.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link to="/onboarding">{t.cta}</Link>
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it was built */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">How this was built</h2>
            <p className="mt-4 text-muted-foreground">
              Lumina is a hackathon prototype. The interface is real — React 19, TanStack Router,
              Tailwind and a design system of {" "}
              <span className="font-medium text-foreground">oklch</span> tokens with a violet accent
              reserved strictly for AI moments, so you can always tell what was generated.
            </p>
            <p className="mt-4 text-muted-foreground">
              The recommendations are simulated. Every explanation is written against a mock learner
              profile with {learningPaths.length} sample paths and {courses.length} courses, and the
              data layer is a set of pure accessors so each one can become a real API call without
              touching a component.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Built by the Lumina Learn team for the HCL hackathon.
            </p>
          </div>

          <div className="surface-card p-6">
            <h3 className="font-semibold">What's real vs. simulated</h3>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                <span>
                  <span className="font-medium">Real:</span> navigation, filtering and search,
                  prerequisite gating, progress maths, charts, and every interaction state.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-ai" />
                <span>
                  <span className="font-medium">Simulated:</span> the assistant's replies, the
                  re-planning engine, and the skill scores — all written to be specific rather than
                  generic, but authored rather than inferred.
                </span>
              </li>
            </ul>
            <Button className="mt-6 w-full" variant="outline" asChild>
              <Link to="/assistant">See how the assistant explains itself</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

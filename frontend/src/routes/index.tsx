import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/CourseCard";
import { Footer } from "@/components/Footer";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Compass,
  Layers,
  MessageSquareText,
  Quote,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { categories, courses, learningPaths, stats, testimonials } from "@/data/mock";
import { useAuth } from "@/lib/auth";
import { useLearnerProfile } from "@/lib/learner-profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumina - AI-Personalized Learning Paths for Your Career Goal" },
      {
        name: "description",
        content:
          "Tell Lumina your goal and get an adaptive roadmap of courses, projects and checkpoints built around your skill gaps and weekly hours.",
      },
      { property: "og:title", content: "Lumina - AI-Personalized Learning Paths" },
      {
        property: "og:description",
        content: "An adaptive learning roadmap generated from your goal and measured skill gaps.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    icon: Target,
    title: "Tell us your goal",
    body: 'Describe it in plain language - "I want to be an ML engineer in 6 months."',
  },
  {
    icon: BarChart3,
    title: "AI analyzes your profile",
    body: "We score your current skills against the role benchmark and your past courses.",
  },
  {
    icon: Layers,
    title: "Get a personalized roadmap",
    body: "Milestones, prerequisites and projects sequenced to your weekly hours.",
  },
  {
    icon: Compass,
    title: "Track and adapt",
    body: "Flag anything too easy or too hard and the path re-plans in seconds.",
  },
] as const;

function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { updateProfile } = useLearnerProfile();
  const [goal, setGoal] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const visible = courses.filter(
    (course) =>
      (category === "All" || course.category === category) &&
      (course.title + course.provider + course.skills.join(" "))
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  return (
    <main>
      <section className="gradient-hero border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <Badge className="gap-1 bg-ai-soft text-ai">
              <Sparkles className="size-3" />
              AI learning path recommender
            </Badge>
            <h1 className="mt-5 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              The learning path that <span className="text-primary">fits your goal</span>, not
              everyone else&apos;s.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Lumina reads your goal, measures your skill gaps and sequences 500+ courses, projects
              and checkpoints into one roadmap, then re-plans it as you learn.
            </p>

            <form
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                if (goal.trim()) updateProfile({ goal: goal.trim() });
                navigate({ to: "/onboarding" });
              }}
            >
              <Input
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="What do you want to learn today?"
                aria-label="Your learning goal"
                className="h-13 bg-card text-base"
              />
              <Button type="submit" size="lg" className="h-13 shrink-0">
                Get my learning path
                <ArrowRight className="size-4" />
              </Button>
            </form>
            <p className="mt-3 text-sm text-muted-foreground">
              {isAuthenticated
                ? "Signed in and ready - no credit card - takes 2 minutes"
                : "Free to start - create an account or continue as guest - takes 2 minutes"}
            </p>
          </div>

          <img
            src={heroImg}
            width={1280}
            height={960}
            alt="Illustration of an AI-generated learning roadmap connecting course cards"
            className="w-full rounded-3xl shadow-lift"
          />
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="explore" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Explore courses</h2>
            <p className="mt-2 text-muted-foreground">
              Curated from 40+ providers and scored against real role benchmarks.
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search courses, skills, providers"
              aria-label="Search courses"
              className="pl-9"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["All", ...categories].map((currentCategory) => (
            <button
              key={currentCategory}
              type="button"
              aria-pressed={currentCategory === category}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                currentCategory === category
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => setCategory(currentCategory)}
            >
              {currentCategory}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.slice(0, 6).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        {visible.length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">No courses match that search yet.</p>
        ) : null}

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link to="/explore">
              Browse all {courses.length} courses
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">Featured learning paths</h2>
          <p className="mt-2 text-muted-foreground">
            Pre-built roadmaps that personalize themselves the moment you join.
          </p>
          <div className="mt-8 flex snap-x gap-6 overflow-x-auto pb-4">
            {learningPaths.map((path) => (
              <article
                key={path.id}
                className="surface-card hover-lift w-80 shrink-0 snap-start p-6"
              >
                <span className="gradient-ai flex size-10 items-center justify-center rounded-xl">
                  <BookOpen className="size-5 text-primary-foreground" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{path.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{path.goal}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">{path.courses} courses</Badge>
                  <Badge variant="secondary">{path.weeks} weeks</Badge>
                  <Badge variant="outline">{path.level}</Badge>
                </div>
                <Button className="mt-5 w-full" variant="outline" asChild>
                  <Link to="/path/$id" params={{ id: path.id }}>
                    View roadmap
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="surface-card hover-lift p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <step.icon className="size-5" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground">Step {index + 1}</span>
              </div>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">Learners who hit their goal</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.name} className="surface-card hover-lift p-6">
                <Quote className="size-6 text-ai" />
                <blockquote className="mt-4 text-sm leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{testimonial.name}</span>
                  <span className="block text-muted-foreground">{testimonial.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="gradient-ai flex flex-col items-center gap-4 rounded-3xl px-8 py-14 text-center">
          <MessageSquareText className="size-8 text-primary-foreground" />
          <h2 className="text-3xl font-bold text-primary-foreground">
            Describe your goal. Get a roadmap in 60 seconds.
          </h2>
          <Button size="lg" variant="secondary" asChild>
            <Link to={isAuthenticated ? "/onboarding" : "/signup"}>
              {isAuthenticated ? "Start my profile" : "Create account to start"}
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}

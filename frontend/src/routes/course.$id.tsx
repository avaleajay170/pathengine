import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Check,
  Clock,
  GraduationCap,
  ListChecks,
  Lock,
  PlayCircle,
  Sparkle,
  Star,
  Users,
} from "lucide-react";
import {
  courses,
  findPrerequisiteCourse,
  getCourse,
} from "@/data/mock";
import { useAssistant } from "@/lib/assistant";
import { useLearnerProfile } from "@/lib/learner-profile";
import {
  findCoursePathContext,
  useCourse,
  useCourseReviews,
  useCourses,
} from "@/lib/repositories/courses";

export const Route = createFileRoute("/course/$id")({
  head: ({ params }) => {
    const course = getCourse(params.id);
    const title = course ? `${course.title} — Lumina` : "Course — Lumina";
    const description = course?.blurb ?? "Course details, syllabus and reviews on Lumina.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CoursePage,
});

function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <span className={`flex items-center gap-0.5 ${className}`} aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-4 ${
            i <= Math.round(rating) ? "fill-warning text-warning" : "text-muted-foreground/40"
          }`}
        />
      ))}
    </span>
  );
}

function CoursePage() {
  const { id } = Route.useParams();
  const { data: course, isLoading, isError, refetch: refetchCourse } = useCourse(id);
  const { data: allCourses } = useCourses({ limit: 100 });
  const { data: reviewData, isLoading: reviewsLoading } = useCourseReviews(id);
  const { explain } = useAssistant();
  const { profile, enrollCourse, addToPath } = useLearnerProfile();

  if (isLoading) {
    return <main className="mx-auto max-w-3xl px-4 py-24 text-center">Loading course...</main>;
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">This course could not be loaded</h1>
        <Button className="mt-6" onClick={() => void refetchCourse()}>Try again</Button>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold">We couldn't find that course</h1>
        <p className="mt-2 text-muted-foreground">
          It may have been retired by the provider or renamed.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/explore">Browse all courses</Link>
        </Button>
      </main>
    );
  }

  const placement = findCoursePathContext(course.id);
  const reviews = reviewData?.reviews ?? [];
  const breakdown = reviewData?.breakdown ?? [];
  const related = (allCourses?.courses ?? courses)
    .filter((c) => c.category === course.category && c.id !== course.id)
    .slice(0, 3);
  const totalLessons = course.syllabus.reduce((n, s) => n + s.items.length, 0);
  const isCompleted = profile.completedCourses.includes(course.id);
  const isEnrolled = profile.enrolledCourses.includes(course.id);

  const reason =
    placement?.node.reason ??
    `${course.title} is the shortest route to the ${course.skills[0] ?? course.category} level your target role expects, and it has no prerequisites you haven't already cleared.`;

  return (
    <main>
      {/* Hero */}
      <section className="gradient-hero border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All courses
          </Link>

          <div className="mt-6 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
                {isCompleted && (
                  <Badge className="gap-1 bg-success text-success-foreground">
                    <BadgeCheck className="size-3" />
                    Completed
                  </Badge>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{course.blurb}</p>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <span className="flex items-center gap-2">
                  <GraduationCap className="size-4 text-primary" />
                  <span className="font-medium">{course.provider}</span>
                </span>
                <span className="text-muted-foreground">Taught by {course.instructor}</span>
                <span className="flex items-center gap-1.5">
                  <Stars rating={course.rating} />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-muted-foreground">({course.reviews.toLocaleString()})</span>
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="size-4" />
                  {course.hours} hrs
                </span>
              </div>
            </div>

            {/* Course visual — same hue signature as the course card */}
            <div
              className="hidden aspect-[4/3] w-full items-center justify-center rounded-3xl shadow-lift lg:flex"
              style={{
                backgroundImage: `linear-gradient(135deg, oklch(0.62 0.16 ${course.thumbHue}), oklch(0.48 0.18 ${course.thumbHue + 25}))`,
              }}
            >
              <GraduationCap className="size-16 text-primary-foreground/90" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Tabs */}
        <div>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="mt-6">
              <div className="surface-card p-6">
                <h2 className="text-lg font-bold">What you'll learn</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {course.syllabus
                    .flatMap((s) => s.items)
                    .map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                        {item}
                      </li>
                    ))}
                </ul>

                <h3 className="mt-8 text-sm font-semibold">Skills you'll gain</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {course.skills.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>

                <h3 className="mt-8 text-sm font-semibold">About this course</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {course.blurb} Across {course.syllabus.length} modules and {totalLessons} lessons,{" "}
                  {course.instructor} works through the material at a {course.level.toLowerCase()}{" "}
                  level, with graded exercises on real datasets rather than toy examples. At{" "}
                  {profile.hoursPerWeek} hrs/week this lands in about{" "}
                  {Math.ceil(course.hours / profile.hoursPerWeek)} weeks.
                </p>
              </div>
            </TabsContent>

            {/* Syllabus */}
            <TabsContent value="syllabus" className="mt-6">
              <div className="surface-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-bold">Syllabus</h2>
                  <p className="text-sm text-muted-foreground">
                    {course.syllabus.length} modules · {totalLessons} lessons · {course.hours} hrs
                  </p>
                </div>

                <Accordion type="single" collapsible defaultValue="mod-0" className="mt-4">
                  {course.syllabus.map((section, i) => (
                    <AccordionItem key={section.title} value={`mod-${i}`}>
                      <AccordionTrigger>
                        <span className="flex items-center gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-xs font-bold text-primary">
                            {i + 1}
                          </span>
                          <span>{section.title}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 pl-10">
                          {section.items.map((item) => (
                            <li
                              key={item}
                              className="flex items-center gap-2.5 text-sm text-muted-foreground"
                            >
                              <PlayCircle className="size-4 shrink-0 text-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>

            {/* Reviews */}
            <TabsContent value="reviews" className="mt-6">
              <div className="surface-card p-6">
                <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
                  <div className="text-center sm:w-40">
                    <p className="text-5xl font-extrabold">{course.rating}</p>
                    <Stars rating={course.rating} className="mt-2 justify-center" />
                    <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="size-3.5" />
                      {course.reviews.toLocaleString()} reviews
                    </p>
                  </div>

                  <div className="flex-1 space-y-2">
                    {breakdown.map((row) => (
                      <div key={row.stars} className="flex items-center gap-3">
                        <span className="w-12 shrink-0 text-xs text-muted-foreground">
                          {row.stars} star
                        </span>
                        <Progress value={row.pct} className="h-1.5" />
                        <span className="w-9 shrink-0 text-right text-xs text-muted-foreground">
                          {row.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <ul className="mt-8 divide-y divide-border border-t border-border">
                  {reviews.map((r) => (
                    <li key={r.id} className="py-5">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                          {r.name.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.role}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <Stars rating={r.rating} className="justify-end" />
                          <p className="mt-1 text-xs text-muted-foreground">{r.when}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {/* Enroll */}
          <div className="surface-card p-6">
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-extrabold">
                {course.price === "Free" ? "Free" : `$${course.price}`}
              </p>
              {course.price !== "Free" && (
                <span className="text-xs text-muted-foreground">one-time</span>
              )}
            </div>
            <Button
              className="mt-4 w-full"
              size="lg"
              onClick={() => {
                enrollCourse(course.id);
                toast.success(isEnrolled ? "Opening course" : "Enrolled", {
                  description: `${course.title} is in your learning plan.`,
                });
              }}
            >
              {isCompleted ? "Review course" : isEnrolled ? "Continue course" : "Enroll now"}
            </Button>
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() => {
                addToPath(course.id);
                toast.success("Added to your path", {
                  description: `${course.title} will appear in your roadmap.`,
                });
              }}
            >
              Add to my path
            </Button>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <BookOpen className="size-4" />
                {course.syllabus.length} modules · {totalLessons} lessons
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-4" />
                {course.hours} hrs · self-paced
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="size-4" />
                Certificate on completion
              </li>
            </ul>
          </div>

          {/* Why this is in your path */}
          <div className="rounded-2xl border border-ai/25 bg-ai-soft p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-ai-foreground">
              <Sparkle className="size-4" />
              Why this is in your path
            </h3>
            {placement && (
              <p className="mt-2 text-xs font-medium text-ai-foreground/70">
                {placement.path.title} → {placement.milestone.title}
              </p>
            )}
            <p className="mt-2 text-sm leading-relaxed text-ai-foreground/85">{reason}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full bg-background text-ai"
              onClick={() => explain({ title: course.title, reason, courseId: course.id })}
            >
              Ask Lumi about this
            </Button>
          </div>

          {/* Prerequisites */}
          <div className="surface-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <ListChecks className="size-4 text-primary" />
              Prerequisites
            </h3>
            {course.prerequisites.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                None — this course is a valid starting point.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {course.prerequisites.map((p) => {
                  const match = findPrerequisiteCourse(p);
                  const cleared =
                    match !== undefined && profile.completedCourses.includes(match.id);
                  return (
                    <li key={p} className="flex items-center gap-2 text-sm">
                      {cleared ? (
                        <Check className="size-4 shrink-0 text-success" />
                      ) : (
                        <Lock className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      {match ? (
                        <Link
                          to="/course/$id"
                          params={{ id: match.id }}
                          className="hover:text-primary hover:underline"
                        >
                          {p}
                        </Link>
                      ) : (
                        <span>{p}</span>
                      )}
                      {cleared && <span className="ml-auto text-xs text-success">Cleared</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="surface-card p-5">
              <h3 className="text-sm font-bold">More in {course.category}</h3>
              <ul className="mt-3 space-y-3">
                {related.map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/course/$id"
                      params={{ id: c.id }}
                      className="group flex items-center gap-3"
                    >
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `oklch(0.62 0.14 ${c.thumbHue})` }}
                      >
                        <GraduationCap className="size-5 text-primary-foreground" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium group-hover:text-primary">
                          {c.title}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {c.hours} hrs · {c.level}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <Footer />
    </main>
  );
}

import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Star, Sparkle } from "lucide-react";
import type { Course } from "@/data/mock";
import { useAssistant } from "@/lib/assistant";

export function CourseCard({ course, reason }: { course: Course; reason?: string }) {
  const { explain } = useAssistant();

  return (
    <article className="surface-card hover-lift group flex flex-col overflow-hidden">
      <div
        className="h-28 w-full"
        style={{
          backgroundImage: `linear-gradient(135deg, oklch(0.62 0.16 ${course.thumbHue}), oklch(0.48 0.18 ${course.thumbHue + 25}))`,
        }}
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{course.category}</Badge>
          <Badge variant="outline">{course.level}</Badge>
        </div>
        <Link to="/course/$id" params={{ id: course.id }} className="group-hover:text-primary">
          <h3 className="text-base leading-snug font-semibold">{course.title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">{course.provider}</p>
        <p className="line-clamp-2 text-sm text-muted-foreground">{course.blurb}</p>

        <div className="mt-auto flex items-center gap-4 pt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Star className="size-4 fill-warning text-warning" />
            {course.rating}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-4" />
            {course.hours} hrs
          </span>
          <span className="ml-auto font-semibold text-foreground">
            {course.price === "Free" ? (
              <Badge className="bg-success text-success-foreground">Free</Badge>
            ) : (
              `$${course.price}`
            )}
          </span>
        </div>

        <div className="flex gap-2 pt-1">
          <Button asChild size="sm" className="flex-1">
            <Link to="/course/$id" params={{ id: course.id }}>
              View course
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-ai"
            onClick={() =>
              explain({
                title: course.title,
                courseId: course.id,
                reason:
                  reason ??
                  `${course.title} closes your ${course.skills[0]} gap — you're currently below the benchmark for that skill in your target role, and this course has the highest completion rate (${Math.round(course.rating * 19)}%) among learners with your profile.`,
              })
            }
          >
            <Sparkle className="size-4" />
            Why this?
          </Button>
        </div>
      </div>
    </article>
  );
}

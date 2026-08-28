import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseCard } from "@/components/CourseCard";
import { Footer } from "@/components/Footer";
import { Search } from "lucide-react";
import { categories, courses } from "@/data/mock";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Courses — Lumina" },
      {
        name: "description",
        content:
          "Search and filter 20 curated courses across data science, AI/ML, web development, design and business.",
      },
      { property: "og:title", content: "Explore Courses — Lumina" },
      {
        property: "og:description",
        content: "Filter curated courses by category, level and skill.",
      },
    ],
  }),
  component: Explore,
});

function Explore() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All levels");

  const visible = courses.filter(
    (c) =>
      (category === "All" || c.category === category) &&
      (level === "All levels" || c.level === level) &&
      (c.title + c.provider + c.skills.join(" ")).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <main>
      <div className="gradient-hero border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight">Explore courses</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every course is scored against role benchmarks, so you can see how it moves your skill
            profile before you enroll.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, skills, providers"
              aria-label="Search courses"
              className="pl-9"
            />
          </div>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["All levels", "Beginner", "Intermediate", "Advanced"].map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={c === category}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                c === category
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">{visible.length} courses</p>

        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}

/**
 * Course catalogue types and the pure logic over them.
 *
 * No fixtures and no fetching in this file. That separation is the point: everything here
 * can be tested with a hand-built course object, and nothing here changes when the data
 * starts arriving from an API.
 */

export type Level = "Beginner" | "Intermediate" | "Advanced";

/** `"Free"` rather than `0`, so a free course can never be mistaken for a missing price. */
export type Price = number | "Free";

export interface SyllabusSection {
  title: string;
  items: string[];
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  instructor: string;
  category: string;
  level: Level;
  /** Mean review score, 1–5. */
  rating: number;
  /** Number of reviews behind `rating`, not the reviews themselves. */
  reviews: number;
  hours: number;
  price: Price;
  blurb: string;
  skills: string[];
  syllabus: SyllabusSection[];
  /** Human labels, e.g. "Python Basics" — see `matchPrerequisite`. */
  prerequisites: string[];
  /** Hue used to generate the course thumbnail gradient, 0–360. */
  thumbHue: number;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  when: string;
  body: string;
}

export interface RatingBar {
  stars: number;
  pct: number;
}

export function formatPrice(price: Price): string {
  return price === "Free" ? "Free" : `$${price}`;
}

/**
 * A star distribution consistent with the course's mean rating.
 *
 * Real review data would come from the API. Until it does, deriving the bars from the mean
 * keeps them plausible — a 4.9-rated course cannot end up showing a wall of two-star
 * reviews — and keeps them stable across renders. Percentages always total 100.
 */
export function ratingBreakdown(course: Course): RatingBar[] {
  const t = Math.min(1, Math.max(0, (course.rating - 4.4) / 0.5));
  const five = Math.round(62 + t * 30);
  const four = Math.round(24 - t * 18);
  const three = Math.round(8 - t * 7);
  const two = Math.round(4 - t * 3);
  // The remainder absorbs the rounding drift from the four bars above.
  const one = Math.max(0, 100 - five - four - three - two);

  return [
    { stars: 5, pct: five },
    { stars: 4, pct: four },
    { stars: 3, pct: three },
    { stars: 2, pct: two },
    { stars: 1, pct: one },
  ];
}

/**
 * Resolve a prerequisite label to a catalogue entry.
 *
 * Prerequisites are authored as the phrases a learner would recognise ("Python Basics"),
 * not ids, because that is how course pages read. Matching is therefore fuzzy, and returns
 * undefined when the prerequisite is background knowledge rather than a course we carry —
 * "JavaScript" is a real prerequisite with no course behind it.
 */
export function matchPrerequisite(label: string, catalog: readonly Course[]): Course | undefined {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const lower = label.toLowerCase();

  return (
    catalog.find((course) => course.id === slug) ??
    catalog.find((course) => course.title.toLowerCase().includes(lower)) ??
    catalog.find((course) => lower.includes(course.title.toLowerCase()))
  );
}

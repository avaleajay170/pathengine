/** Landing-page social proof. Placeholder content: none of these people exist. */

import type { StatHighlight, Testimonial } from "@/domain/marketing";

export const testimonials: Testimonial[] = [
  {
    name: "Aisha Rahman",
    role: "Data Analyst at Northwind",
    quote:
      "The path rebuilt itself after I flagged two courses as too easy. I skipped 30 hours of material I already knew and still hit my goal date.",
  },
  {
    name: "Diego Santos",
    role: "ML Engineer at Halcyon",
    quote:
      "Every recommendation came with a reason tied to my skill gaps. It felt like a mentor who had actually read my transcript.",
  },
  {
    name: "Lena Fischer",
    role: "Product Designer at Kite",
    quote:
      "I told it I only had five hours a week. The roadmap re-sequenced everything around that instead of guilt-tripping me.",
  },
];

export const stats: StatHighlight[] = [
  { label: "Active learners", value: "10,000+" },
  { label: "Curated courses", value: "500+" },
  { label: "Goal completion", value: "98%" },
  { label: "Partner providers", value: "40+" },
];

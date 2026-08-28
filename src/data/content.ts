/** Data access for marketing content on the landing and about pages. */

import type { StatHighlight, Testimonial } from "@/domain/marketing";

import { stats, testimonials } from "./fixtures/marketing";

export async function getStats(): Promise<StatHighlight[]> {
  return stats;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return testimonials;
}

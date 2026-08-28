/** Shapes for the marketing content on the landing and about pages. */

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

export interface StatHighlight {
  label: string;
  /** Pre-formatted for display, e.g. "10,000+" — never arithmetic input. */
  value: string;
}

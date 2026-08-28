import { describe, expect, it } from "vitest";

import { formatPrice, matchPrerequisite, ratingBreakdown } from "@/domain/course";
import { makeCourse } from "@/test/factories";

describe("formatPrice", () => {
  it("keeps free courses labelled, never priced at zero", () => {
    expect(formatPrice("Free")).toBe("Free");
    expect(formatPrice(0)).toBe("$0");
  });

  it("prefixes a paid price", () => {
    expect(formatPrice(49)).toBe("$49");
  });
});

describe("ratingBreakdown", () => {
  it("always totals 100, whatever the mean rating", () => {
    for (const rating of [4, 4.4, 4.6, 4.9, 5]) {
      const total = ratingBreakdown(makeCourse({ rating })).reduce((sum, bar) => sum + bar.pct, 0);

      expect(total).toBe(100);
    }
  });

  it("lists five stars down to one", () => {
    expect(ratingBreakdown(makeCourse()).map((bar) => bar.stars)).toEqual([5, 4, 3, 2, 1]);
  });

  it("cannot show a highly rated course as a wall of low scores", () => {
    const bars = ratingBreakdown(makeCourse({ rating: 4.9 }));

    expect(bars).toHaveLength(5);
    expect(bars[0]?.pct).toBe(92);
    expect(bars[4]?.pct).toBe(0);
  });

  it("clamps outside the 4.4–4.9 band instead of producing negative bars", () => {
    expect(ratingBreakdown(makeCourse({ rating: 3.1 }))).toEqual(
      ratingBreakdown(makeCourse({ rating: 4.4 })),
    );
    expect(ratingBreakdown(makeCourse({ rating: 5 }))).toEqual(
      ratingBreakdown(makeCourse({ rating: 4.9 })),
    );
  });
});

describe("matchPrerequisite", () => {
  const catalog = [
    makeCourse({ id: "python-basics", title: "Python for Everybody: Programming Foundations" }),
    makeCourse({ id: "stats-inference", title: "Statistics & Inference for Data Science" }),
    makeCourse({ id: "mlops", title: "MLOps" }),
  ];

  it("resolves a label that slugs to a course id", () => {
    expect(matchPrerequisite("Python Basics", catalog)?.id).toBe("python-basics");
  });

  it("resolves a shortened title", () => {
    expect(matchPrerequisite("Statistics & Inference", catalog)?.id).toBe("stats-inference");
  });

  it("resolves a label that contains a course title", () => {
    expect(matchPrerequisite("MLOps and Docker", catalog)?.id).toBe("mlops");
  });

  it("returns undefined for background knowledge we do not sell a course for", () => {
    expect(matchPrerequisite("JavaScript", catalog)).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";

import { bestPathForGoal, rankPathsForGoal } from "@/domain/matching";
import { makeMilestone, makeNode, makePath } from "@/test/factories";

const mlPath = makePath({
  id: "ml-engineer",
  title: "Become a Machine Learning Engineer",
  goal: "Go from Python scripting to shipping production ML systems.",
  milestones: [
    makeMilestone("core", [
      makeNode({ id: "a", skills: ["Statistics", "Machine Learning"] }),
      makeNode({ id: "b", skills: ["PyTorch"] }),
    ]),
  ],
});

const analystPath = makePath({
  id: "data-analyst",
  title: "Become a Data Analyst",
  goal: "Move from spreadsheets to SQL and stakeholder-ready dashboards.",
  level: "Beginner",
  milestones: [makeMilestone("core", [makeNode({ id: "c", skills: ["SQL", "Visualization"] })])],
});

const paths = [mlPath, analystPath];

describe("rankPathsForGoal", () => {
  it("puts the path that answers the goal first", () => {
    const ranked = rankPathsForGoal("become a machine learning engineer using pytorch", paths);

    expect(ranked).toHaveLength(2);
    expect(ranked[0]?.path.id).toBe("ml-engineer");
    expect(ranked[1]?.score).toBe(0);
  });

  it("weighs a word that names a taught skill above one that only appears in the prose", () => {
    const bySkill = rankPathsForGoal("pytorch", [mlPath]);
    const byProse = rankPathsForGoal("production", [mlPath]);

    expect(bySkill[0]?.score).toBe(2);
    expect(byProse[0]?.score).toBe(1);
  });

  it("reports which goal words drove the match, so the choice can be explained", () => {
    const [best] = rankPathsForGoal("I want to become a machine learning engineer", paths);

    expect(best?.matched).toEqual(["machine", "engineer"]);
  });

  it("keeps punctuated technology names whole", () => {
    const nodePath = makePath({
      id: "backend",
      title: "Backend with Node",
      goal: "Ship services.",
      milestones: [makeMilestone("core", [makeNode({ id: "d", skills: ["Node.js"] })])],
    });

    const [best] = rankPathsForGoal("I want to write node.js services", [nodePath]);

    expect(best?.matched).toContain("node.js");
  });

  it("scores nothing for a goal made entirely of filler", () => {
    const ranked = rankPathsForGoal("I want to learn and become the role", paths);

    expect(ranked.every((match) => match.score === 0)).toBe(true);
  });
});

describe("bestPathForGoal", () => {
  it("returns the winning path", () => {
    expect(bestPathForGoal("machine learning with pytorch", paths)?.id).toBe("ml-engineer");
  });

  it("returns undefined rather than silently handing back the first path", () => {
    // Onboarding relies on this: it falls back to a default and tells the learner it did,
    // instead of presenting an unmatched path as a recommendation.
    expect(bestPathForGoal("I want to become a pastry chef", paths)).toBeUndefined();
  });
});

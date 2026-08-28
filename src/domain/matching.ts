/**
 * Matching a free-text career goal to a learning path.
 *
 * The onboarding wizard lets people describe their goal in their own words, which means the
 * match cannot be a lookup. This is a deliberately transparent keyword score rather than an
 * embedding model: it runs in the browser with no service call, and when it picks a path it
 * can say which words made it pick that one — which the summary screen shows the learner.
 */

import { pathNodes, type LearningPath } from "./path";

export interface GoalMatch {
  path: LearningPath;
  score: number;
  /** The goal words that matched, for explaining the recommendation. */
  matched: string[];
}

/**
 * Words that appear in almost every goal statement ("I want to become a…") and so carry no
 * signal. Without this list, every path matches every goal equally and the ranking is noise.
 */
const STOP_WORDS = new Set([
  "and",
  "become",
  "career",
  "for",
  "get",
  "getting",
  "goal",
  "into",
  "job",
  "learn",
  "learning",
  "months",
  "move",
  "role",
  "the",
  "want",
  "with",
  "work",
  "working",
  "year",
  "years",
]);

/** Kept `+`, `#` and `.` so "c++", "c#" and "node.js" survive tokenisation intact. */
function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z0-9+#.]+/g) ?? [];
  return words.filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Paths ranked by how well they answer the goal, best first.
 *
 * A word that names a skill taught in the path counts double a word that merely appears in
 * its prose: someone who writes "pytorch" is describing what they want to be able to do,
 * while someone who writes "production" could mean almost anything.
 */
export function rankPathsForGoal(goal: string, paths: readonly LearningPath[]): GoalMatch[] {
  const tokens = tokenize(goal);

  return paths
    .map((path) => {
      const prose = `${path.title} ${path.goal} ${path.level}`.toLowerCase();
      const skills = pathNodes(path)
        .flatMap((node) => node.skills)
        .join(" ")
        .toLowerCase();

      let score = 0;
      const matched: string[] = [];

      for (const token of tokens) {
        const inSkills = skills.includes(token);
        const inProse = prose.includes(token);
        if (!inSkills && !inProse) continue;

        score += inSkills ? 2 : 1;
        matched.push(token);
      }

      return { path, score, matched };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * The best-matching path, or undefined when nothing in the goal matched anything we offer.
 *
 * Returning undefined rather than silently handing back the first path keeps the choice with
 * the caller — onboarding falls back to a default and says so, instead of pretending a
 * recommendation was made.
 */
export function bestPathForGoal(
  goal: string,
  paths: readonly LearningPath[],
): LearningPath | undefined {
  const [best] = rankPathsForGoal(goal, paths);
  return best && best.score > 0 ? best.path : undefined;
}

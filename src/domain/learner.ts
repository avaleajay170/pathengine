/**
 * The learner profile and skill-gap arithmetic.
 *
 * "Gap" is the whole product in one number: the distance between where a learner is on a
 * skill and where their target role needs them to be. Everything the roadmap does — what it
 * recommends, in what order, and how it justifies itself — reduces to sorting these.
 */

export interface SkillScore {
  skill: string;
  /** Measured level, 0–100. */
  current: number;
  /** Level the target role calls for, 0–100. */
  target: number;
}

export interface LearnerProfile {
  name: string;
  goal: string;
  targetRole: string;
  /** Deadline as the learner phrased it, e.g. "6 months". */
  timeframe: string;
  hoursPerWeek: number;
  /** Consecutive days with study activity. */
  streak: number;
  hoursLearned: number;
  /**
   * Badges awarded for passed assessments. Deliberately not derived from `skills` below:
   * a badge is a discrete achievement, a skill score is a level, and conflating them would
   * make one of the two numbers lie.
   */
  skillsMastered: number;
  completedCourses: string[];
  skills: SkillScore[];
}

/**
 * A monthly snapshot of the three headline skills.
 *
 * The keys are the chart's series names rather than a `Record<string, number>` on purpose:
 * Recharts binds each line to a literal `dataKey`, so a dynamic map renders an empty chart
 * the moment a key is renamed, with no type error to catch it.
 */
export interface SkillTrendPoint {
  month: string;
  Python: number;
  Statistics: number;
  ML: number;
}

export interface ActivityEntry {
  id: string;
  text: string;
  /** Relative time as displayed, e.g. "2 hours ago". */
  when: string;
}

export interface SkillGap extends SkillScore {
  /** Points left to close. Clamped at zero — exceeding a target is not a negative gap. */
  gap: number;
  /** Share of the target already reached, 0–100. */
  attainment: number;
}

function gapOf(score: SkillScore): SkillGap {
  const gap = Math.max(0, score.target - score.current);
  const attainment =
    score.target === 0 ? 100 : Math.min(100, Math.round((score.current / score.target) * 100));

  return { ...score, gap, attainment };
}

/** Every tracked skill, widest gap first — the order the roadmap addresses them in. */
export function skillGaps(profile: LearnerProfile): SkillGap[] {
  return profile.skills.map(gapOf).sort((a, b) => b.gap - a.gap);
}

/** The skill the learner is furthest from, or undefined when no skills are tracked. */
export function widestGap(profile: LearnerProfile): SkillGap | undefined {
  const [widest] = skillGaps(profile);
  return widest;
}

/**
 * Overall readiness for the target role, 0–100: the mean attainment across tracked skills.
 *
 * A plain mean, not a weighted one. Weighting would need per-role skill importance, which
 * the profile does not carry, and inventing weights here would make the headline number
 * unexplainable to the learner.
 */
export function readiness(profile: LearnerProfile): number {
  if (profile.skills.length === 0) return 0;
  const total = profile.skills.reduce((sum, score) => sum + gapOf(score).attainment, 0);
  return Math.round(total / profile.skills.length);
}

export function hasCompleted(profile: LearnerProfile, courseId: string): boolean {
  return profile.completedCourses.includes(courseId);
}

/** Weeks of study left for a number of hours, at the learner's stated pace. */
export function weeksAtCurrentPace(profile: LearnerProfile, hours: number): number {
  if (profile.hoursPerWeek <= 0) return 0;
  return Math.ceil(hours / profile.hoursPerWeek);
}

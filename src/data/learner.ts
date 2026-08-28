/**
 * Data access for the signed-in learner.
 *
 * Same contract as `./catalog`: route loaders call these, components receive the result as
 * props or loader data. A real implementation would read the session here.
 */

import type { ActivityEntry, LearnerProfile, SkillTrendPoint } from "@/domain/learner";

import { learnerProfile, recentActivity, skillTrend } from "./fixtures/learner";

export async function getLearner(): Promise<LearnerProfile> {
  return learnerProfile;
}

export async function getSkillTrend(): Promise<SkillTrendPoint[]> {
  return skillTrend;
}

export async function getRecentActivity(limit?: number): Promise<ActivityEntry[]> {
  return limit === undefined ? recentActivity : recentActivity.slice(0, limit);
}

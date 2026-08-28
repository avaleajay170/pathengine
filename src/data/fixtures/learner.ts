/**
 * The signed-in learner.
 *
 * A single profile stands in for the session. Skill scores are the numbers every
 * recommendation is justified against, so they are authored to be internally consistent with
 * `completedCourses` and with the node statuses in the ML-engineer path: Python and SQL are
 * high because those courses are done, statistics is mid-course, and everything downstream is
 * still low.
 */

import type { ActivityEntry, LearnerProfile, SkillTrendPoint } from "@/domain/learner";

export const learnerProfile: LearnerProfile = {
  name: "Rutik",
  goal: "Become a machine learning engineer in 6 months",
  targetRole: "Machine Learning Engineer",
  timeframe: "6 months",
  hoursPerWeek: 8,
  streak: 12,
  hoursLearned: 96,
  skillsMastered: 7,
  completedCourses: ["python-basics", "sql-analytics"],
  skills: [
    { skill: "Python", current: 78, target: 90 },
    { skill: "Statistics", current: 45, target: 85 },
    { skill: "Machine Learning", current: 30, target: 88 },
    { skill: "Deep Learning", current: 12, target: 80 },
    { skill: "MLOps", current: 8, target: 70 },
    { skill: "SQL", current: 72, target: 75 },
  ],
};

/** Six months of history. The last point matches `learnerProfile.skills` exactly. */
export const skillTrend: SkillTrendPoint[] = [
  { month: "Mar", Python: 40, Statistics: 15, ML: 5 },
  { month: "Apr", Python: 55, Statistics: 22, ML: 10 },
  { month: "May", Python: 64, Statistics: 30, ML: 16 },
  { month: "Jun", Python: 70, Statistics: 38, ML: 22 },
  { month: "Jul", Python: 75, Statistics: 42, ML: 27 },
  { month: "Aug", Python: 78, Statistics: 45, ML: 30 },
];

export const recentActivity: ActivityEntry[] = [
  { id: "a1", text: "Completed module “Sampling distributions”", when: "2 hours ago" },
  {
    id: "a2",
    text: "Path adapted: pandas course moved earlier after your feedback",
    when: "Yesterday",
  },
  { id: "a3", text: "Earned skill badge — SQL: Window Functions", when: "2 days ago" },
  { id: "a4", text: "Completed SQL for Data Analytics", when: "5 days ago" },
  { id: "a5", text: "Asked the assistant “Why is statistics before ML?”", when: "1 week ago" },
];

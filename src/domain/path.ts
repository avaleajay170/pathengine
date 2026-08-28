/**
 * Learning-path types and the arithmetic over them.
 *
 * Progress and course counts are derived here rather than stored on the path. A stored
 * `progress: 34` is a second source of truth that drifts the moment a node's status changes,
 * and the drift is invisible — the number still looks reasonable. Deriving it from node
 * status means the roadmap and the summary can never disagree.
 */

import type { Level } from "./course";

export type NodeKind = "course" | "project" | "assessment";

/**
 * `locked` means prerequisites are outstanding, `available` means it can be started now.
 * The distinction drives both the roadmap affordances and the recommended-actions list.
 */
export type NodeStatus = "locked" | "available" | "in-progress" | "completed";

export interface PathNodeItem {
  id: string;
  /** Set when the node maps to a catalogue course; projects and checkpoints have no id. */
  courseId?: string;
  kind: NodeKind;
  title: string;
  /** Human duration, e.g. "22 hrs" or "45 min". Sum it with `durationHours`, never `parseInt`. */
  duration: string;
  status: NodeStatus;
  /**
   * Percent of the node finished, when the provider reports it. Only meaningful while a node is
   * `in-progress`: a completed node is 100 and an unstarted one is 0, both of which
   * `nodeCompletion` derives rather than trusting a stored number.
   */
  completion?: number;
  skills: string[];
  description: string;
  /** Titles of the nodes that must be finished first, as shown to the learner. */
  requires?: string[];
  /** Why this node is in this learner's path. Surfaced verbatim by the assistant. */
  reason: string;
}

export interface Milestone {
  id: string;
  title: string;
  summary: string;
  nodes: PathNodeItem[];
}

export interface LearningPath {
  id: string;
  title: string;
  goal: string;
  level: Level;
  /** Planned calendar length at the learner's stated weekly hours. */
  weeks: number;
  /** Projected completion date, formatted for display. */
  eta: string;
  milestones: Milestone[];
}

export interface Progress {
  completed: number;
  total: number;
  /** Rounded to a whole percent, so it can go straight into a progress bar. */
  percent: number;
}

export interface PathSummary {
  courses: number;
  projects: number;
  assessments: number;
  progress: Progress;
}

export interface CoursePlacement {
  path: LearningPath;
  milestone: Milestone;
  node: PathNodeItem;
}

function progressOf(nodes: readonly PathNodeItem[]): Progress {
  const completed = nodes.filter((node) => node.status === "completed").length;
  return {
    completed,
    total: nodes.length,
    percent: nodes.length === 0 ? 0 : Math.round((completed / nodes.length) * 100),
  };
}

/** Every node in milestone order — the roadmap flattened into study order. */
export function pathNodes(path: LearningPath): PathNodeItem[] {
  return path.milestones.flatMap((milestone) => milestone.nodes);
}

export function milestoneProgress(milestone: Milestone): Progress {
  return progressOf(milestone.nodes);
}

/** How far through a single node the learner is, 0–100. */
export function nodeCompletion(node: PathNodeItem): number {
  if (node.status === "completed") return 100;
  if (node.status === "in-progress") return node.completion ?? 0;
  return 0;
}

export function pathProgress(path: LearningPath): Progress {
  return progressOf(pathNodes(path));
}

export function pathSummary(path: LearningPath): PathSummary {
  const nodes = pathNodes(path);
  const countOf = (kind: NodeKind) => nodes.filter((node) => node.kind === kind).length;

  return {
    courses: countOf("course"),
    projects: countOf("project"),
    assessments: countOf("assessment"),
    progress: progressOf(nodes),
  };
}

/**
 * What the learner can act on, in the order they should act on it: finish what is started,
 * then start what is unlocked. Locked nodes are excluded because recommending something the
 * learner cannot open is worse than recommending nothing.
 */
export function nextNodes(path: LearningPath, limit = 3): PathNodeItem[] {
  const nodes = pathNodes(path);
  return [
    ...nodes.filter((node) => node.status === "in-progress"),
    ...nodes.filter((node) => node.status === "available"),
  ].slice(0, limit);
}

/**
 * Durations are authored as the strings the roadmap displays ("22 hrs", "45 min"), so summing
 * them needs a real parser: `parseInt("45 min")` is 45, which would silently add 45 hours of
 * study to the plan. Anything unrecognised contributes nothing rather than a guess.
 */
const DURATION_PATTERN = /^\s*(\d+(?:\.\d+)?)\s*(hrs?|hours?|mins?|minutes?)\s*$/i;

export function durationHours(duration: string): number {
  const match = DURATION_PATTERN.exec(duration);
  if (!match) return 0;

  const [, amount, unit] = match;
  if (amount === undefined || unit === undefined) return 0;

  const value = Number(amount);
  return unit.toLowerCase().startsWith("min") ? value / 60 : value;
}

/** Whole hours of study left on a path, counting everything not yet completed. */
export function remainingHours(path: LearningPath): number {
  return sumHours(pathNodes(path).filter((node) => node.status !== "completed"));
}

/** Whole hours the entire path represents, regardless of what is already done. */
export function pathHours(path: LearningPath): number {
  return sumHours(pathNodes(path));
}

function sumHours(nodes: readonly PathNodeItem[]): number {
  return Math.round(nodes.reduce((sum, node) => sum + durationHours(node.duration), 0));
}

/**
 * Where a course sits across all paths — the basis of "why this is in your path".
 */
export function locateCourse(
  paths: readonly LearningPath[],
  courseId: string,
): CoursePlacement | undefined {
  for (const path of paths) {
    for (const milestone of path.milestones) {
      const node = milestone.nodes.find((candidate) => candidate.courseId === courseId);
      if (node) return { path, milestone, node };
    }
  }
  return undefined;
}

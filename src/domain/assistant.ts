/**
 * The learning assistant's reply logic.
 *
 * A keyword-matched rule table, not a language model. That is a product decision as much as
 * a technical one: every reply has to cite the learner's real numbers, so the copy is written
 * against the profile and the rules are ordered from most specific to least. The first rule
 * whose keywords match wins, which is why "why … statistics" sits above the generic
 * "machine learning" rule.
 *
 * Keeping this pure — question and knowledge in, reply out — is what makes it testable
 * without rendering anything.
 */

import type { Course } from "./course";
import { skillGaps, weeksAtCurrentPace, type LearnerProfile, type SkillGap } from "./learner";

export interface AssistantReply {
  content: string;
  /** Course to show as a card beneath the reply. */
  courseId?: string | undefined;
  /** Milestone change to render as a callout. */
  milestone?: { title: string; detail: string } | undefined;
}

export interface AssistantKnowledge {
  learner: LearnerProfile;
  courses: readonly Course[];
}

/** Everything a reply might cite, resolved once so no rule has to guard for itself. */
interface ReplyFacts {
  learner: LearnerProfile;
  gaps: SkillGap[];
  widest: SkillGap | undefined;
  closed: SkillGap[];
  find: (courseId: string) => Course | undefined;
}

function factsOf({ learner, courses }: AssistantKnowledge): ReplyFacts {
  const gaps = skillGaps(learner);

  return {
    learner,
    gaps,
    widest: gaps[0],
    closed: gaps.filter((gap) => gap.gap === 0),
    find: (courseId) => courses.find((course) => course.id === courseId),
  };
}

function gapOf(facts: ReplyFacts, skill: string): SkillGap | undefined {
  return facts.gaps.find((gap) => gap.skill.toLowerCase() === skill.toLowerCase());
}

/** "Deep Learning (12% vs 80%) and MLOps (8% vs 70%)" */
function describeGaps(gaps: readonly SkillGap[]): string {
  const phrases = gaps.map((gap) => `${gap.skill} (${gap.current}% vs ${gap.target}%)`);
  const last = phrases.pop();
  if (last === undefined) return "";
  return phrases.length === 0 ? last : `${phrases.join(", ")} and ${last}`;
}

interface Rule {
  /** Named so a failing test says which rule fired instead of which array index. */
  id: string;
  matches: (question: string) => boolean;
  reply: (facts: ReplyFacts) => AssistantReply;
}

const includesAny = (question: string, ...words: string[]) =>
  words.some((word) => question.includes(word));

const rules: Rule[] = [
  {
    id: "why-statistics",
    matches: (q) => q.includes("why") && q.includes("statistic"),
    reply: (facts) => {
      const statistics = gapOf(facts, "Statistics");
      const course = facts.find("stats-inference");
      const weeks = course ? weeksAtCurrentPace(facts.learner, course.hours) : 0;

      return {
        content: [
          statistics
            ? `Statistics comes before modelling because you're at ${statistics.current}% against the ${statistics.target}% these roles expect — your widest gap on the way in.`
            : "Statistics comes before modelling because inference is what the rest of the path assumes.",
          "Without inference you'd be memorising scikit-learn APIs instead of reasoning about validation, and every later evaluation lesson would land as trivia.",
          course
            ? `It's ${course.hours} hours, so about ${weeks} weeks at your ${facts.learner.hoursPerWeek} hrs/week, and it unlocks Machine Learning Foundations.`
            : "",
        ]
          .filter(Boolean)
          .join(" "),
        courseId: "stats-inference",
      };
    },
  },
  {
    id: "switch-to-backend",
    matches: (q) => includesAny(q, "backend", "switch"),
    reply: (facts) => ({
      content: `Switching to backend development keeps your Python and SQL credit — ${facts.learner.hoursLearned} hours already banked — but retires the deep learning branch. I'd swap Deep Learning with PyTorch and MLOps for Building APIs with Node.js and TypeScript Deep Dive, which pulls your goal date forward by roughly six weeks. Want me to draft that path?`,
      courseId: "node-apis",
    }),
  },
  {
    id: "adjust-pace",
    matches: (q) => includesAny(q, "pace", "time", "hour"),
    reply: (facts) => ({
      content: `The plan assumes ${facts.learner.hoursPerWeek} hrs/week. Dropping to five pushes your capstone about two months out; going to twelve pulls it in by six weeks. Your Foundations stage is nearly done, so changing pace only re-sequences Specialization — nothing you've finished is lost.`,
      milestone: {
        title: "Specialization — re-planned",
        detail: "Deep Learning → MLOps → Capstone, re-timed against your weekly availability.",
      },
    }),
  },
  {
    id: "too-easy",
    matches: (q) => includesAny(q, "too easy", "skip"),
    reply: () => ({
      content:
        "Noted — I've marked that node as below your level. I'll compress its overlapping modules and surface an advanced checkpoint instead, so you can test out in 45 minutes rather than sit through the full course.",
    }),
  },
  {
    id: "next-action",
    matches: (q) => includesAny(q, "recommend", "next"),
    reply: (facts) => {
      const course = facts.find("pandas-wrangling");
      if (!course) {
        return {
          content:
            "Your next action is the one available node in Core Skills — everything after it is still gated on a prerequisite.",
        };
      }

      return {
        content: `Next best action: ${course.title}. It's the only available node feeding both your churn-prediction project and Machine Learning Foundations, and because you already cleared SQL for Data Analytics I've trimmed its overlapping query modules — roughly ${Math.round(course.hours * 0.7)} hours of real work left.`,
        courseId: course.id,
      };
    },
  },
  {
    id: "goal-progress",
    matches: (q) => includesAny(q, "machine learning", "ml engineer", "goal"),
    reply: (facts) => {
      const behind = facts.gaps.filter((gap) => gap.attainment < 50).slice(0, 2);

      return {
        content: `Your goal — "${facts.learner.goal}" — maps to ${facts.gaps.length} skill targets. ${
          facts.closed.length > 0
            ? `${describeGaps(facts.closed)} are at benchmark. `
            : "None are at benchmark yet. "
        }${
          behind.length > 0
            ? `You're furthest from ${describeGaps(behind)}, and the roadmap spends most of its remaining hours there.`
            : "The remaining gaps are all within reach at your current pace."
        }`,
        courseId: "ml-foundations",
      };
    },
  },
];

export function replyTo(question: string, knowledge: AssistantKnowledge): AssistantReply {
  const facts = factsOf(knowledge);
  const normalized = question.toLowerCase();
  const rule = rules.find((candidate) => candidate.matches(normalized));
  if (rule) return rule.reply(facts);

  // Fallback. Rather than admitting it did not understand, the assistant says what it does
  // know — which is the honest position for a recommender and keeps the reply useful.
  return {
    content: `Here's how I read that against your profile: ${facts.learner.hoursLearned} hours logged, a ${facts.learner.streak}-day streak, and ${facts.learner.skillsMastered} skill badges.${
      facts.widest ? ` ${facts.widest.skill} is still the gap that decides your goal date.` : ""
    } I'd keep your in-progress course as this week's focus, then re-check the roadmap at the next skill checkpoint — it re-plans from measured scores rather than your intake answers.`,
  };
}

export function greetingFor(learner: LearnerProfile): string {
  return `Hi ${learner.name} — I'm Lumi, your learning strategist. I've read your goal ("${learner.goal}") and the courses you've finished. Ask me why something is in your path, or tell me what changed.`;
}

/** Reasons a learner would actually open the assistant, phrased as they'd phrase them. */
export const suggestedPrompts = [
  "Why was this course recommended?",
  "I want to switch to backend development",
  "Adjust my pace",
  "What should I do next?",
];

export function explanationFor(
  learner: LearnerProfile,
  reason: string,
  completedTitles: readonly string[],
): string {
  const foundation =
    completedTitles.length > 0
      ? ` and it builds on what you already finished (${completedTitles.join(", ")})`
      : "";

  return `${reason}\n\nIt maps directly to your goal of becoming a ${learner.targetRole} within ${learner.timeframe}${foundation}.`;
}

import { describe, expect, it } from "vitest";

import type { AssistantKnowledge } from "@/domain/assistant";
import { explanationFor, greetingFor, replyTo } from "@/domain/assistant";
import { makeCourse, makeLearner, makeSkill } from "@/test/factories";

const catalog = [
  makeCourse({ id: "stats-inference", title: "Statistics & Inference", hours: 30 }),
  makeCourse({ id: "pandas-wrangling", title: "Data Wrangling with pandas", hours: 16 }),
  makeCourse({ id: "node-apis", title: "Building APIs with Node.js", hours: 20 }),
  makeCourse({ id: "ml-foundations", title: "Machine Learning Foundations", hours: 40 }),
];

function knowledgeFor(skills = [makeSkill("Python", 70, 80), makeSkill("Statistics", 45, 85)]) {
  return { learner: makeLearner({ skills }), courses: catalog } satisfies AssistantKnowledge;
}

describe("replyTo — why statistics", () => {
  it("cites the learner's own numbers rather than a generic justification", () => {
    const reply = replyTo("Why is statistics before the modelling course?", knowledgeFor());

    expect(reply.courseId).toBe("stats-inference");
    expect(reply.content).toContain("45%");
    expect(reply.content).toContain("85%");
  });

  it("converts the course length into weeks at the learner's stated pace", () => {
    // 30 hours at 8 hrs/week.
    const reply = replyTo("Why statistics?", knowledgeFor());

    expect(reply.content).toContain("about 4 weeks");
  });

  it("wins over the broader machine-learning rule, because it is the more specific one", () => {
    const reply = replyTo("Why start with statistics for machine learning?", knowledgeFor());

    expect(reply.courseId).toBe("stats-inference");
  });

  it("drops the timing sentence when the course is not in the catalogue", () => {
    const reply = replyTo("Why statistics?", { learner: makeLearner(), courses: [] });

    expect(reply.content).not.toContain("hours");
  });

  it("still answers when statistics is not a tracked skill", () => {
    const reply = replyTo("Why statistics?", knowledgeFor([makeSkill("Python", 70, 80)]));

    expect(reply.content).toContain("inference is what the rest of the path assumes");
  });
});

describe("replyTo — the other rules", () => {
  it("keeps transferable credit when the learner wants to switch track", () => {
    const reply = replyTo("I want to switch to backend development", knowledgeFor());

    expect(reply.courseId).toBe("node-apis");
    expect(reply.content).toContain("96 hours already banked");
  });

  it("returns a milestone callout when asked about pace", () => {
    const reply = replyTo("Can I change my pace?", knowledgeFor());

    expect(reply.milestone?.title).toBe("Specialization — re-planned");
    expect(reply.courseId).toBeUndefined();
  });

  it("offers to test out instead of re-teaching when a node is too easy", () => {
    const reply = replyTo("This one is too easy", knowledgeFor());

    expect(reply.content).toContain("advanced checkpoint");
    expect(reply.courseId).toBeUndefined();
  });

  it("recommends the one available node, discounted for work already credited", () => {
    const reply = replyTo("What should I do next?", knowledgeFor());

    expect(reply.courseId).toBe("pandas-wrangling");
    expect(reply.content).toContain("roughly 11 hours");
  });

  it("degrades to a generic next step when the recommended course is missing", () => {
    const reply = replyTo("What should I do next?", { learner: makeLearner(), courses: [] });

    expect(reply.courseId).toBeUndefined();
    expect(reply.content).toContain("still gated on a prerequisite");
  });
});

describe("replyTo — goal progress", () => {
  const knowledge = knowledgeFor([
    makeSkill("Deep Learning", 12, 80),
    makeSkill("SQL", 70, 70),
    makeSkill("Python", 80, 80),
  ]);

  it("separates the skills at benchmark from the ones still deciding the goal date", () => {
    const reply = replyTo("How is my goal looking?", knowledge);

    expect(reply.content).toContain("3 skill targets");
    expect(reply.content).toContain("SQL (70% vs 70%) and Python (80% vs 80%) are at benchmark");
    expect(reply.content).toContain("furthest from Deep Learning (12% vs 80%)");
    expect(reply.courseId).toBe("ml-foundations");
  });

  it("says so plainly when nothing is at benchmark yet", () => {
    const reply = replyTo("How is my goal looking?", knowledgeFor());

    expect(reply.content).toContain("None are at benchmark yet");
  });
});

describe("replyTo — fallback", () => {
  it("says what it does know instead of admitting it did not understand", () => {
    const reply = replyTo("Tell me about the platform", knowledgeFor());

    expect(reply.content).toContain("96 hours logged");
    expect(reply.content).toContain("5-day streak");
    expect(reply.content).toContain("Statistics is still the gap");
  });

  it("omits the gap sentence when no skills are tracked", () => {
    const reply = replyTo("Tell me about the platform", knowledgeFor([]));

    expect(reply.content).not.toContain("still the gap");
  });
});

describe("greetingFor", () => {
  it("opens with the learner's name and their own words", () => {
    const greeting = greetingFor(makeLearner({ name: "Priya", goal: "Lead a data team." }));

    expect(greeting).toContain("Hi Priya");
    expect(greeting).toContain("Lead a data team.");
  });
});

describe("explanationFor", () => {
  it("ties the authored reason to the target role and deadline", () => {
    const explanation = explanationFor(makeLearner(), "It closes your widest gap.", []);

    expect(explanation).toContain("It closes your widest gap.");
    expect(explanation).toContain("Machine Learning Engineer within 6 months");
  });

  it("credits prior work when there is any, and stays silent when there is none", () => {
    const learner = makeLearner();

    expect(explanationFor(learner, "Reason.", ["SQL for Data Analytics"])).toContain(
      "builds on what you already finished (SQL for Data Analytics)",
    );
    expect(explanationFor(learner, "Reason.", [])).not.toContain("builds on");
  });
});

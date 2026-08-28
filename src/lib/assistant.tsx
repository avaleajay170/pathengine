import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { courses, learner, type Course } from "@/data/mock";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  courseId?: string;
  milestone?: { title: string; detail: string };
  pending?: boolean;
}

interface AssistantState {
  open: boolean;
  messages: ChatMessage[];
  thinking: boolean;
  setOpen: (v: boolean) => void;
  send: (text: string) => void;
  explain: (opts: { title: string; reason: string; courseId?: string | undefined }) => void;
}

const AssistantContext = createContext<AssistantState | null>(null);

const greeting: ChatMessage = {
  id: "greet",
  role: "assistant",
  content: `Hi ${learner.name} — I'm Lumi, your learning strategist. I've read your goal ("${learner.goal}") and your last two completed courses. Ask me why something is in your path, or tell me what changed.`,
};

let counter = 0;
const nextId = () => `m${++counter}-${Date.now()}`;

function mockReply(text: string): ChatMessage {
  const q = text.toLowerCase();
  const find = (id: string) => courses.find((c) => c.id === id) as Course;

  if (q.includes("why") && q.includes("statistic")) {
    return {
      id: nextId(),
      role: "assistant",
      content:
        "Statistics sits before modelling because your self-assessment and the intake quiz both put you near 45%, while ML-engineer postings you saved expect ~85%. Without inference you'd memorise scikit-learn APIs instead of reasoning about validation. It's a 30-hour course; at your 8 hrs/week that's under four weeks and it unlocks Machine Learning Foundations.",
      courseId: "stats-inference",
    };
  }
  if (q.includes("backend") || q.includes("switch")) {
    return {
      id: nextId(),
      role: "assistant",
      content:
        "Switching to backend development would keep your Python and SQL credit (about 40 hours already banked) but retire the deep learning branch. I'd swap Deep Learning with PyTorch and MLOps for Building APIs with Node.js and TypeScript Deep Dive, which shortens your goal date from 12 Feb to roughly 4 Jan. Want me to draft that path?",
      courseId: "node-apis",
    };
  }
  if (q.includes("pace") || q.includes("time") || q.includes("hour")) {
    return {
      id: nextId(),
      role: "assistant",
      content:
        "Right now the plan assumes 8 hrs/week. Dropping to 5 pushes your capstone to late March; going to 12 pulls it into December. Because your Foundations stage is nearly done, changing pace only re-sequences the Specialization stage — nothing you've completed is lost.",
      milestone: {
        title: "Specialization — re-planned",
        detail: "Deep Learning → MLOps → Capstone, re-timed against your weekly availability.",
      },
    };
  }
  if (q.includes("too easy") || q.includes("skip")) {
    return {
      id: nextId(),
      role: "assistant",
      content:
        "Noted — I've marked that node as below your level. I'll compress its overlapping modules and surface an advanced checkpoint instead, so you can test out in 45 minutes rather than sit through 16 hours.",
    };
  }
  if (q.includes("recommend") || q.includes("next")) {
    const c = find("pandas-wrangling");
    return {
      id: nextId(),
      role: "assistant",
      content: `Next best action: ${c.title}. It's the only available node that feeds both your churn-prediction project and Machine Learning Foundations, and because you already cleared SQL for Data Analytics I've trimmed its overlapping query modules — about 11 hours of real work left.`,
      courseId: c.id,
    };
  }
  if (q.includes("machine learning") || q.includes("ml engineer") || q.includes("goal")) {
    return {
      id: nextId(),
      role: "assistant",
      content: `Your goal — "${learner.goal}" — maps to five skill targets. You're on track for Python and SQL, mid-way on Statistics, and behind on Deep Learning (12% vs 80%) and MLOps (8% vs 70%). The current roadmap allocates 106 of your remaining 192 hours to those two gaps.`,
      courseId: "ml-foundations",
    };
  }
  return {
    id: nextId(),
    role: "assistant",
    content:
      "Here's how I read that against your profile: you have 96 hours logged, a 12-day streak, and two closed skill gaps. I'd keep Statistics & Inference as the active node this week, then re-check the roadmap at the skill checkpoint — it re-plans the Specialization stage from measured scores rather than your intake answers.",
  };
}

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const [thinking, setThinking] = useState(false);

  const respond = useCallback((reply: ChatMessage) => {
    setThinking(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, reply]);
      setThinking(false);
    }, 1100);
  }, []);

  const send = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      setMessages((m) => [...m, { id: nextId(), role: "user", content: text }]);
      respond(mockReply(text));
    },
    [respond],
  );

  const explain = useCallback(
    ({
      title,
      reason,
      courseId,
    }: {
      title: string;
      reason: string;
      courseId?: string | undefined;
    }) => {
      setOpen(true);
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "user", content: `Why is "${title}" recommended for me?` },
      ]);
      respond({
        id: nextId(),
        role: "assistant",
        content: `${reason}\n\nIt maps directly to your goal of becoming a ${learner.targetRole} within ${learner.timeframe}, and it builds on what you already finished (Python for Everybody, SQL for Data Analytics).`,
        ...(courseId !== undefined && { courseId }),
      });
    },
    [respond],
  );

  const value = useMemo(
    () => ({ open, messages, thinking, setOpen, send, explain }),
    [open, messages, thinking, send, explain],
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error("useAssistant must be used inside AssistantProvider");
  return ctx;
}

export const suggestedPrompts = [
  "Why was this course recommended?",
  "I want to switch to backend development",
  "Adjust my pace",
  "What should I do next?",
];

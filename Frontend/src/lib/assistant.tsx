import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { courses, type Course, type LearnerProfile } from "@/data/mock";
import { generateLearningPath } from "@/lib/learning-path";
import { useLearnerProfile } from "@/lib/learner-profile";
import { useAssistantMessage } from "@/hooks/use-assistant";

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

let counter = 0;
const nextId = () => `m${++counter}-${Date.now()}`;

function mockReply(text: string, profile: LearnerProfile): ChatMessage {
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
      content: `Your goal — "${profile.goal || "your next role"}" — maps to ${Object.keys(profile.skillLevels).length} tracked skills. You have completed ${profile.completedCourses.length} courses and are working toward ${profile.targetRole}.`,
      courseId: "ml-foundations",
    };
  }
  return {
    id: nextId(),
    role: "assistant",
    content: `Your goal — "${profile.goal || "your next role"}" — maps to ${Object.keys(profile.skillLevels).length} tracked skills. You have completed ${profile.completedCourses.length} courses and are working toward ${profile.targetRole}.`,
  };
}

export function AssistantProvider({ children }: { children: ReactNode }) {
  const { profile } = useLearnerProfile();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const requestId = useRef(0);
  const assistantMessageMutation = useAssistantMessage();

  const respond = useCallback((reply: ChatMessage) => {
    const currentRequest = ++requestId.current;
    setThinking(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, reply]);
      if (currentRequest === requestId.current) setThinking(false);
    }, 1100);
  }, []);

  const send = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const userMessage = { id: nextId(), role: "user" as const, content: text };
      setMessages((m) => [...m, userMessage]);

      // Try backend first, fall back to mock
      assistantMessageMutation.mutate(
        { message: text, context: {} },
        {
          onSuccess: (data) => {
            setMessages((m) => [
              ...m,
              {
                id: data.id,
                role: data.role,
                content: data.content,
                courseId: data.courseId,
                milestone: data.milestone,
              },
            ]);
          },
          onError: (error: any) => {
            // Fall back to mock response if API fails or is disabled
            if (error?.message === "API_DISABLED" || error?.status === 0) {
              respond(mockReply(text, profile));
            } else {
              // Show error to user
              setMessages((m) => [
                ...m,
                {
                  id: nextId(),
                  role: "assistant",
                  content: "I'm having trouble connecting right now. Please try again.",
                },
              ]);
            }
          },
        }
      );
    },
    [profile, respond, assistantMessageMutation]
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
        content: `${reason}\n\nIt maps directly to your goal of becoming a ${profile.targetRole} within ${profile.timeframe}, and it builds on ${profile.completedCourses.length} completed course${profile.completedCourses.length === 1 ? "" : "s"}.`,
        ...(courseId !== undefined && { courseId }),
      });
    },
    [profile, respond],
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

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LearnerProfile } from "@/data/mock";

const STORAGE_KEY = "lumina-learner";
const STORAGE_VERSION = 1;

export const emptyLearnerProfile: LearnerProfile = {
  name: "Learner",
  goal: "",
  targetRole: "Data Analyst",
  selectedRole: "data-analyst",
  timeframe: "6 months",
  hoursPerWeek: 8,
  pace: "moderate",
  skillLevels: {},
  priorExperience: "",
  preferredFormats: [],
  completedCourses: [],
  enrolledCourses: [],
  nodeStatuses: {},
  nodeFeedback: {},
  addedCourseIds: [],
  onboardingComplete: false,
};

function loadProfile(): LearnerProfile {
  if (typeof window === "undefined") return emptyLearnerProfile;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyLearnerProfile;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("data" in parsed)) return emptyLearnerProfile;
    const data = (parsed as { data?: unknown }).data;
    if (!data || typeof data !== "object") return emptyLearnerProfile;
    return { ...emptyLearnerProfile, ...(data as Partial<LearnerProfile>) };
  } catch (error) {
    console.error("Unable to read learner profile", error);
    return emptyLearnerProfile;
  }
}

type LearnerProfileContextValue = {
  profile: LearnerProfile;
  updateProfile: (updates: Partial<LearnerProfile>) => void;
  enrollCourse: (courseId: string) => void;
  completeCourse: (courseId: string) => void;
  completeNode: (nodeId: string, courseId?: string) => void;
  addToPath: (courseId: string) => void;
  submitNodeFeedback: (nodeId: string, feedback: LearnerProfile["nodeFeedback"][string]) => void;
  resetLearner: () => void;
};

const LearnerProfileContext = createContext<LearnerProfileContextValue | null>(null);

export function LearnerProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<LearnerProfile>(loadProfile);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: STORAGE_VERSION, data: profile }),
      );
    } catch (error) {
      console.error("Unable to persist learner profile", error);
    }
  }, [profile]);

  const updateProfile = (updates: Partial<LearnerProfile>) => {
    setProfile((current) => ({ ...current, ...updates }));
  };

  const enrollCourse = (courseId: string) => {
    setProfile((current) =>
      current.enrolledCourses.includes(courseId)
        ? current
        : { ...current, enrolledCourses: [...current.enrolledCourses, courseId] },
    );
  };

  const completeCourse = (courseId: string) => {
    setProfile((current) => ({
      ...current,
      completedCourses: current.completedCourses.includes(courseId)
        ? current.completedCourses
        : [...current.completedCourses, courseId],
      enrolledCourses: current.enrolledCourses.includes(courseId)
        ? current.enrolledCourses
        : [...current.enrolledCourses, courseId],
    }));
  };

  const completeNode = (nodeId: string, courseId?: string) => {
    setProfile((current) => ({
      ...current,
      nodeStatuses: { ...current.nodeStatuses, [nodeId]: "completed" },
      ...(courseId
        ? {
            completedCourses: current.completedCourses.includes(courseId)
              ? current.completedCourses
              : [...current.completedCourses, courseId],
          }
        : {}),
    }));
  };

  const addToPath = (courseId: string) => {
    setProfile((current) =>
      current.addedCourseIds.includes(courseId)
        ? current
        : { ...current, addedCourseIds: [...current.addedCourseIds, courseId] },
    );
  };

  const submitNodeFeedback = (nodeId: string, feedback: LearnerProfile["nodeFeedback"][string]) => {
    setProfile((current) => ({
      ...current,
      nodeFeedback: { ...current.nodeFeedback, [nodeId]: feedback },
    }));
  };

  const resetLearner = () => setProfile(emptyLearnerProfile);

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
      enrollCourse,
      completeCourse,
      completeNode,
      addToPath,
      submitNodeFeedback,
      resetLearner,
    }),
    [profile],
  );

  return <LearnerProfileContext.Provider value={value}>{children}</LearnerProfileContext.Provider>;
}

export function useLearnerProfile() {
  const context = useContext(LearnerProfileContext);
  if (!context) {
    throw new Error("useLearnerProfile must be used inside LearnerProfileProvider");
  }
  return context;
}

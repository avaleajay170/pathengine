import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LearnerProfile } from "@/data/mock";
import { useUpdateProfile } from "@/hooks/use-profile";
import { useEnroll } from "@/hooks/use-enroll";
import { useCompleteNode } from "@/hooks/use-complete-node";
import { useFeedback } from "@/hooks/use-feedback";
import { isApiEnabled } from "@/lib/api-client";

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
    if (!isProfileData(data)) return emptyLearnerProfile;
    return {
      ...emptyLearnerProfile,
      ...data,
      skillLevels: { ...emptyLearnerProfile.skillLevels, ...data.skillLevels },
      preferredFormats: [...(data.preferredFormats ?? [])],
      completedCourses: [...data.completedCourses],
      enrolledCourses: [...data.enrolledCourses],
      addedCourseIds: [...data.addedCourseIds],
      nodeStatuses: { ...data.nodeStatuses },
      nodeFeedback: { ...data.nodeFeedback },
    };
  } catch (error) {
    console.error("Unable to read learner profile", error);
    return emptyLearnerProfile;
  }
}

function isProfileData(
  value: unknown,
): value is Partial<LearnerProfile> &
  Pick<LearnerProfile, "completedCourses" | "enrolledCourses" | "addedCourseIds"> {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<LearnerProfile>;
  return (
    typeof data.goal === "string" &&
    typeof data.targetRole === "string" &&
    Array.isArray(data.completedCourses) &&
    Array.isArray(data.enrolledCourses) &&
    Array.isArray(data.addedCourseIds) &&
    data.completedCourses.every((courseId) => typeof courseId === "string") &&
    data.enrolledCourses.every((courseId) => typeof courseId === "string") &&
    data.addedCourseIds.every((courseId) => typeof courseId === "string")
  );
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
  const updateProfileMutation = useUpdateProfile();
  const enrollMutation = useEnroll();

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
    
    // Sync to backend if API is enabled
    if (isApiEnabled) {
      updateProfileMutation.mutate(updates);
    }
  };

  const enrollCourse = (courseId: string) => {
    setProfile((current) =>
      current.enrolledCourses.includes(courseId)
        ? current
        : { ...current, enrolledCourses: [...current.enrolledCourses, courseId] },
    );
    
    // Sync to backend if API is enabled
    if (isApiEnabled) {
      enrollMutation.mutate(courseId);
    }
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
    
    // Backend sync happens via completeNode
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
    
    // Backend sync would need pathId - handled at component level with useCompleteNode hook
  };

  const addToPath = (courseId: string) => {
    setProfile((current) =>
      current.addedCourseIds.includes(courseId)
        ? current
        : { ...current, addedCourseIds: [...current.addedCourseIds, courseId] },
    );
    
    // Sync to backend if API is enabled
    if (isApiEnabled) {
      updateProfileMutation.mutate({ addedCourseIds: [...profile.addedCourseIds, courseId] });
    }
  };

  const submitNodeFeedback = (nodeId: string, feedback: LearnerProfile["nodeFeedback"][string]) => {
    setProfile((current) => ({
      ...current,
      nodeFeedback: { ...current.nodeFeedback, [nodeId]: feedback },
    }));
    
    // Backend sync would need pathId - handled at component level with useFeedback hook
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

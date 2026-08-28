import { createContext, useContext, useState, type ReactNode } from "react";
import { learner, type LearnerProfile } from "@/data/mock";

type LearnerProfileContextValue = {
  profile: LearnerProfile;
  updateProfile: (updates: Partial<LearnerProfile>) => void;
};

const LearnerProfileContext = createContext<LearnerProfileContextValue | null>(null);

export function LearnerProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<LearnerProfile>(learner);

  const updateProfile = (updates: Partial<LearnerProfile>) => {
    setProfile((current) => ({ ...current, ...updates }));
  };

  return (
    <LearnerProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </LearnerProfileContext.Provider>
  );
}

export function useLearnerProfile() {
  const context = useContext(LearnerProfileContext);
  if (!context) {
    throw new Error("useLearnerProfile must be used inside LearnerProfileProvider");
  }
  return context;
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  FileUp,
  Loader2,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { courses, type LearnerProfile } from "@/data/mock";
import { useLearnerProfile } from "@/lib/learner-profile";
import { generateLearningPath, pathIdForRole } from "@/lib/learning-path";
import { useUploadTranscript, useTranscriptStatus } from "@/hooks/use-transcript";
import { useCreateProfile } from "@/hooks/use-profile";
import { useGeneratePath } from "@/hooks/use-generate-path";
import { isApiEnabled } from "@/lib/api-client";
import type { CreateProfileRequest } from "@/lib/types/api";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Build your profile — Lumina" },
      {
        name: "description",
        content:
          "Answer five short steps about your goal, current skills, history and weekly hours, and Lumina generates an adaptive roadmap.",
      },
      { property: "og:title", content: "Build your profile — Lumina" },
      {
        property: "og:description",
        content: "Five steps to a personalized learning roadmap.",
      },
    ],
  }),
  component: Onboarding,
});

const STEPS = [
  { n: 1, label: "Your goal" },
  { n: 2, label: "Skill level" },
  { n: 3, label: "Prior learning" },
  { n: 4, label: "Preferences" },
  { n: 5, label: "Summary" },
] as const;

const ROLES = [
  "Machine Learning Engineer",
  "Data Analyst",
  "Full-Stack Developer",
  "Data Scientist",
  "Product Manager",
  "UX Designer",
] as const;

const ASSESSED_SKILLS = ["Python", "Statistics", "Machine Learning", "SQL", "Web Development"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

const levelLabel = (position: number | undefined) => LEVELS[position ?? 0] ?? LEVELS[0];

const FORMATS = [
  "Video lessons",
  "Reading & articles",
  "Hands-on projects",
  "Quizzes & assessments",
] as const;

const PACES = [
  { id: "relaxed", label: "Relaxed", detail: "Fewer hours, longer runway" },
  { id: "steady", label: "Steady", detail: "Consistent weekly rhythm" },
  { id: "intensive", label: "Intensive", detail: "Compress the timeline hard" },
] as const;

const GENERATION_STEPS = [
  "Parsing your goal statement",
  "Scoring your skills against the role benchmark",
  "Sequencing courses, projects and checkpoints",
  "Fitting the plan to your weekly hours",
];

function matchRole(role: string, goalText: string): LearnerProfile["selectedRole"] {
  const t = `${role} ${goalText}`.toLowerCase();
  if (/machine learning|ml engineer|deep learning|ai engineer|data scientist|pytorch/.test(t)) {
    return "ml-engineer";
  }
  if (/analyst|analytics|dashboard|business intelligence|\bbi\b|\bsql\b|report/.test(t)) {
    return "data-analyst";
  }
  if (/full.?stack|front.?end|back.?end|web develop|react|node|javascript|typescript/.test(t)) {
    return "full-stack";
  }
  return "data-analyst";
}

export function transcriptCourseIds(text: string): string[] {
  const normalized = text.toLowerCase();
  return courses
    .filter(
      (c) =>
        normalized.includes(c.title.toLowerCase()) ||
        normalized.includes(c.id.toLowerCase()),
    )
    .map((c) => c.id);
}

function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

type UploadStatus = "idle" | "uploading" | "processing" | "completed" | "failed";

export function buildProfilePayloadFromState(
  profile: LearnerProfile,
  role: string,
  goalText: string,
  targetPathTitle: string,
  skillLevels: Record<string, number>,
  priorCourses: string[],
  hours: number,
  formats: string[],
  pace: string,
): CreateProfileRequest {
  return {
    name: profile.name,
    goal: goalText.trim() || `Become a ${role} and build a portfolio project.`,
    targetRole: role || targetPathTitle,
    skillLevels,
    completedCourses: priorCourses,
    hoursPerWeek: hours,
    preferredFormats: formats,
    pace: pace === "intensive" ? "fast" : pace === "relaxed" ? "slow" : "moderate",
  };
}

function Onboarding() {
  const navigate = useNavigate();
  const { profile, updateProfile, resetLearner } = useLearnerProfile();
  const [step, setStep] = useState(1);

  // Step 1
  const [role, setRole] = useState(profile.targetRole || "");
  const [goalText, setGoalText] = useState(profile.goal);
  // Step 2
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>(
    Object.fromEntries(ASSESSED_SKILLS.map((s) => [s, 0])),
  );
  // Step 3
  const [priorCourses, setPriorCourses] = useState<string[]>([]);
  const [courseQuery, setCourseQuery] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadId, setUploadId] = useState<string | undefined>(undefined);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmedParsedCourseIds, setConfirmedParsedCourseIds] = useState<string[]>([]);
  // Step 4
  const [hours, setHours] = useState(profile.hoursPerWeek);
  const [formats, setFormats] = useState<string[]>(
    profile.preferredFormats ?? ["Video lessons", "Hands-on projects"],
  );
  const [pace, setPace] = useState(
    profile.pace === "fast" ? "intensive" : profile.pace === "slow" ? "relaxed" : "steady",
  );
  // Step 5
  const [generating, setGenerating] = useState(false);
  const [genStage, setGenStage] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // API hooks
  const uploadMutation = useUploadTranscript();
  const transcriptStatus = useTranscriptStatus(uploadId);
  const createProfileMutation = useCreateProfile();
  const generatePathMutation = useGeneratePath();

  const selectedRole = useMemo(() => matchRole(role, goalText), [role, goalText]);
  const targetPathId = pathIdForRole(selectedRole);
  const targetPath = generateLearningPath({
    ...profile,
    selectedRole,
    targetRole: role || profile.targetRole,
    goal: goalText,
  });

  const canAdvance = step !== 1 || role !== "" || goalText.trim().length > 8;

  const filteredCourses = courses.filter((c) =>
    (c.title + c.provider).toLowerCase().includes(courseQuery.toLowerCase()),
  );

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  // Gap 1: watch transcript polling result and transition uploadStatus
  useEffect(() => {
    const status = transcriptStatus.data?.status;
    if (!status || status === "processing") return;
    if (status === "completed") {
      setUploadStatus("completed");
    } else if (status === "failed") {
      setUploadStatus("failed");
      setUploadError(transcriptStatus.data?.error ?? "Transcript processing failed.");
    }
  }, [transcriptStatus.data?.status, transcriptStatus.data?.error]);

  // Gap 1: file upload handler — API or existing simulation
  async function handleFileUpload(file: File) {
    setUploadName(file.name);
    setUploadError(null);

    if (!isApiEnabled) {
      // Existing simulation — unchanged
      if (
        file.type === "text/csv" ||
        file.type === "text/plain" ||
        /\.(csv|txt)$/i.test(file.name)
      ) {
        const matched = transcriptCourseIds(await file.text());
        setPriorCourses((current) => [...new Set([...current, ...matched])]);
        setUploadMessage(
          matched.length
            ? `Found ${matched.length} matching course${matched.length === 1 ? "" : "s"}. Review the selected list below.`
            : "No matching courses found. Select completed courses manually below.",
        );
      } else {
        setUploadMessage("This file type needs manual course selection below.");
      }
      return;
    }

    setUploadStatus("uploading");
    try {
      const response = await uploadMutation.mutateAsync(file);
      setUploadId(response.uploadId);
      setUploadStatus("processing");
    } catch (err) {
      setUploadStatus("failed");
      setUploadError(errorMessage(err));
    }
  }

  // Gap 1/Task 2: merge confirmed parsed courses into priorCourses
  function handleConfirmParsedCourses() {
    setPriorCourses((current) => [...new Set([...current, ...confirmedParsedCourseIds])]);
    setConfirmedParsedCourseIds([]);
  }

  // Gap 3: start over after duplicate generation
  function handleStartOver() {
    const ok = window.confirm(
      "This will reset your profile and allow you to regenerate your learning path. Continue?",
    );
    if (ok) resetLearner();
  }

  function buildProfilePayload(): CreateProfileRequest {
    return buildProfilePayloadFromState(
      profile,
      role,
      goalText,
      targetPath.title,
      skillLevels,
      priorCourses,
      hours,
      formats,
      pace,
    );
  }

  // Gaps 2 & 4: generation handler
  async function handleGenerate() {
    setGenerationError(null);

    if (!isApiEnabled) {
      updateProfile({
        goal: goalText.trim() || `Become a ${role} and build a portfolio project.`,
        targetRole: role || targetPath.title,
        selectedRole,
        hoursPerWeek: hours,
        completedCourses: priorCourses,
        skillLevels,
        priorExperience: uploadName,
        preferredFormats: formats,
        pace: pace === "intensive" ? "fast" : pace === "relaxed" ? "slow" : "moderate",
        onboardingComplete: true,
      });
      setGenStage(0);
      setGenerating(true);
      return;
    }

    // 1. Save profile
    let profileId: string;
    try {
      const res = await createProfileMutation.mutateAsync(buildProfilePayload());
      profileId = res.id;
    } catch (err) {
      setGenerationError(errorMessage(err));
      return;
    }

    // 2. Update local state
    updateProfile({
      goal: goalText.trim() || `Become a ${role} and build a portfolio project.`,
      targetRole: role || targetPath.title,
      selectedRole,
      hoursPerWeek: hours,
      completedCourses: priorCourses,
      skillLevels,
      priorExperience: uploadName,
      preferredFormats: formats,
      pace: pace === "intensive" ? "fast" : pace === "relaxed" ? "slow" : "moderate",
      onboardingComplete: true,
    });

    // 3. Show overlay then generate
    setGenStage(0);
    setGenerating(true);

    try {
      const path = await generatePathMutation.mutateAsync({ profileId, profile });
      navigate({ to: "/path/$id", params: { id: path.id } });
    } catch (err) {
      setGenerating(false);
      setGenStage(0);
      setGenerationError(errorMessage(err));
    }
  }

  // Offline mock generation sequence
  useEffect(() => {
    if (!generating) return;
    if (isApiEnabled) return;
    const timers: number[] = [];
    for (let i = 1; i < GENERATION_STEPS.length; i++) {
      timers.push(window.setTimeout(() => setGenStage(i), i * 700));
    }
    timers.push(
      window.setTimeout(
        () => navigate({ to: "/path/$id", params: { id: targetPathId } }),
        GENERATION_STEPS.length * 700 + 600,
      ),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [generating, navigate, targetPathId]);

  // ── Generation overlay ──────────────────────────────────────────────────
  if (generating) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
        <div className="surface-card w-full max-w-lg p-8 text-center">
          <span className="gradient-ai mx-auto flex size-14 animate-pulse items-center justify-center rounded-2xl">
            <Bot className="size-7 text-primary-foreground" />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Building your roadmap…</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Lumi is sequencing {targetPath.courses} courses around {hours} hrs/week.
          </p>
          <ol className="mt-8 space-y-3 text-left">
            {GENERATION_STEPS.map((label, i) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                    i < genStage
                      ? "bg-success text-success-foreground"
                      : i === genStage
                        ? "gradient-ai text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < genStage ? (
                    <Check className="size-3.5" />
                  ) : (
                    <span className="text-xs font-semibold">{i + 1}</span>
                  )}
                </span>
                <span className={i <= genStage ? "text-foreground" : "text-muted-foreground"}>
                  {label}
                </span>
              </li>
            ))}
          </ol>
          <Progress value={((genStage + 1) / GENERATION_STEPS.length) * 100} className="mt-8" />
        </div>
      </main>
    );
  }

  // ── Main wizard ─────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      {/* Progress header */}
      <div>
        <div className="flex items-end justify-between">
          <div>
            <Badge className="gap-1 bg-ai-soft text-ai">
              <Sparkles className="size-3" />
              Learner profiling
            </Badge>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
              Let's build your profile
            </h1>
            <p className="mt-2 text-muted-foreground">
              Five short steps. Everything here feeds the roadmap Lumi generates at the end.
            </p>
          </div>
          <p className="hidden text-sm font-medium text-muted-foreground sm:block">
            Step {step} of {STEPS.length}
          </p>
        </div>
        <Progress value={(step / STEPS.length) * 100} className="mt-6" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        {/* Left stepper */}
        <nav aria-label="Onboarding steps" className="hidden lg:block">
          <ol className="space-y-1">
            {STEPS.map((s) => {
              const state = s.n === step ? "current" : s.n < step ? "done" : "upcoming";
              return (
                <li key={s.n}>
                  <button
                    type="button"
                    onClick={() => s.n < step && setStep(s.n)}
                    disabled={s.n > step}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      state === "current"
                        ? "bg-accent font-semibold text-accent-foreground"
                        : state === "done"
                          ? "cursor-pointer text-foreground hover:bg-muted"
                          : "cursor-not-allowed text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        state === "done"
                          ? "bg-success text-success-foreground"
                          : state === "current"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {state === "done" ? <Check className="size-3.5" /> : s.n}
                    </span>
                    {s.label}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Active step card */}
        <div className="surface-card p-6 sm:p-8">
          {/* ── Step 1: Goal ── */}
          {step === 1 && (
            <section>
              <h2 className="text-xl font-bold tracking-tight">What are you working toward?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a target role, or describe the goal in your own words — Lumi reads both.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={role === r}
                    onClick={() => setRole(role === r ? "" : r)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      role === r
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <label htmlFor="goal" className="mt-8 block text-sm font-semibold text-foreground">
                Describe your goal
              </label>
              <Textarea
                id="goal"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                rows={4}
                className="mt-2 resize-none"
                placeholder="e.g. I want to become a machine learning engineer in 6 months — I can code a little Python but I've never trained a model."
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Timeframes, constraints and current job all help. Pick a role or describe a goal to
                continue.
              </p>
            </section>
          )}

          {/* ── Step 2: Skill level ── */}
          {step === 2 && (
            <section>
              <h2 className="text-xl font-bold tracking-tight">How would you rate yourself?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Rough is fine — a checkpoint quiz re-scores these properly once you start.
              </p>
              <div className="mt-8 space-y-7">
                {ASSESSED_SKILLS.map((s) => (
                  <div key={s}>
                    <div className="flex items-center justify-between">
                      <label htmlFor={`skill-${s}`} className="text-sm font-semibold">
                        {s}
                      </label>
                      <Badge variant="secondary">{levelLabel(skillLevels[s])}</Badge>
                    </div>
                    <Slider
                      id={`skill-${s}`}
                      className="mt-3"
                      min={0}
                      max={2}
                      step={1}
                      value={[skillLevels[s] ?? 0]}
                      onValueChange={([v]) => setSkillLevels((prev) => ({ ...prev, [s]: v ?? 0 }))}
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      {LEVELS.map((l) => (
                        <span key={l}>{l}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Step 3: Prior learning ── */}
          {step === 3 && (
            <section>
              <h2 className="text-xl font-bold tracking-tight">What have you already done?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Anything you've finished gets credited, so the roadmap won't teach it twice.
              </p>

              {/* Upload drop zone */}
              <label
                htmlFor="history"
                className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-input bg-secondary/40 px-6 py-8 text-center transition-colors ${
                  uploadStatus === "uploading" || uploadStatus === "processing"
                    ? "cursor-not-allowed opacity-60"
                    : "hover:bg-accent"
                }`}
              >
                {uploadStatus === "uploading" || uploadStatus === "processing" ? (
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                ) : (
                  <FileUp className="size-6 text-muted-foreground" />
                )}
                <span className="mt-3 text-sm font-semibold">
                  {uploadName || "Upload a learning history"}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {uploadStatus === "uploading"
                    ? "Uploading…"
                    : uploadStatus === "processing"
                      ? "Analyzing transcript…"
                      : uploadName
                        ? uploadMessage || "File selected."
                        : "CSV or plain-text transcript; PDF files require manual course selection."}
                </span>
                <input
                  id="history"
                  type="file"
                  className="sr-only"
                  accept=".csv,.txt,.pdf,text/csv,text/plain,application/pdf"
                  disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void handleFileUpload(file);
                  }}
                />
              </label>

              {/* Upload error */}
              {uploadStatus === "failed" && uploadError && (
                <div
                  role="alert"
                  className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{uploadError} Manual course selection is still available below.</span>
                </div>
              )}

              {/* Parsed courses confirmation (Gap 1 / Task 2) */}
              {uploadStatus === "completed" &&
                transcriptStatus.data?.parsedCourses &&
                transcriptStatus.data.parsedCourses.length > 0 && (
                  <div className="mt-4 rounded-xl border border-border p-4">
                    <p className="text-sm font-semibold">Parsed from your transcript</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Check the courses you want to credit.
                    </p>
                    <ul className="mt-3 space-y-1">
                      {transcriptStatus.data.parsedCourses.map((pc) => {
                        const id = pc.matchedCourseId ?? pc.title;
                        return (
                          <li key={id}>
                            <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted">
                              <Checkbox
                                className="mt-0.5"
                                checked={confirmedParsedCourseIds.includes(id)}
                                onCheckedChange={() =>
                                  setConfirmedParsedCourseIds((prev) =>
                                    prev.includes(id)
                                      ? prev.filter((x) => x !== id)
                                      : [...prev, id],
                                  )
                                }
                              />
                              <span className="min-w-0">
                                <span className="block text-sm font-medium">{pc.title}</span>
                                <span className="block text-xs text-muted-foreground">
                                  Confidence: {Math.round(pc.confidence * 100)}%
                                </span>
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={handleConfirmParsedCourses}
                      disabled={confirmedParsedCourseIds.length === 0}
                    >
                      <Check className="size-3.5" />
                      Confirm selected ({confirmedParsedCourseIds.length})
                    </Button>
                  </div>
                )}

              {/* Manual course selection (always available) */}
              <div className="mt-8">
                <p className="text-sm font-semibold">Or tag courses you've completed</p>
                <div className="relative mt-3">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={courseQuery}
                    onChange={(e) => setCourseQuery(e.target.value)}
                    placeholder="Search courses or providers"
                    aria-label="Search completed courses"
                    className="pl-9"
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{priorCourses.length} selected</p>
                <ul className="mt-2 max-h-72 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
                  {filteredCourses.map((c) => (
                    <li key={c.id}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted">
                        <Checkbox
                          className="mt-0.5"
                          checked={priorCourses.includes(c.id)}
                          onCheckedChange={() => setPriorCourses((prev) => toggle(prev, c.id))}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{c.title}</span>
                          <span className="block text-xs text-muted-foreground">
                            {c.provider} · {c.hours} hrs · {c.level}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                  {filteredCourses.length === 0 && (
                    <li className="p-4 text-center text-sm text-muted-foreground">
                      No courses match that search.
                    </li>
                  )}
                </ul>
              </div>
            </section>
          )}

          {/* ── Step 4: Preferences ── */}
          {step === 4 && (
            <section>
              <h2 className="text-xl font-bold tracking-tight">How do you like to learn?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This sets the shape of the plan — hours, formats and how hard we compress it.
              </p>
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <label htmlFor="hours" className="text-sm font-semibold">
                    Time available each week
                  </label>
                  <Badge variant="secondary">{hours} hrs</Badge>
                </div>
                <Slider
                  id="hours"
                  className="mt-3"
                  min={2}
                  max={25}
                  step={1}
                  value={[hours]}
                  onValueChange={([v]) => setHours(v ?? hours)}
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>2 hrs</span>
                  <span>25 hrs</span>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-sm font-semibold">Preferred content</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {FORMATS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={formats.includes(f)}
                      onClick={() => setFormats((prev) => toggle(prev, f))}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        formats.includes(f)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                <p className="text-sm font-semibold">Pace</p>
                <RadioGroup value={pace} onValueChange={setPace} className="mt-3 gap-3">
                  {PACES.map((p) => (
                    <label
                      key={p.id}
                      htmlFor={`pace-${p.id}`}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                        pace === p.id
                          ? "border-primary bg-primary-soft"
                          : "border-input hover:bg-muted"
                      }`}
                    >
                      <RadioGroupItem id={`pace-${p.id}`} value={p.id} className="mt-0.5" />
                      <span>
                        <span className="block text-sm font-semibold">{p.label}</span>
                        <span className="block text-xs text-muted-foreground">{p.detail}</span>
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </section>
          )}

          {/* ── Step 5: Summary ── */}
          {step === 5 && (
            <section>
              <h2 className="text-xl font-bold tracking-tight">Does this look right?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Lumi will generate a roadmap from these answers. You can change any of it later.
              </p>

              {/* Generation error (Gap 2) */}
              {generationError && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{generationError}</span>
                </div>
              )}

              {/* Duplicate generation notice (Gap 3) */}
              {profile.onboardingComplete && (
                <div
                  role="status"
                  className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 dark:border-amber-700/40 dark:bg-amber-950/30"
                >
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    You've already generated a learning path.{" "}
                    <a
                      href={`/path/${targetPathId}`}
                      className="font-semibold underline underline-offset-2 hover:no-underline"
                    >
                      View your path
                    </a>
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartOver}
                    className="border-amber-400 text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-900/40"
                  >
                    Start over
                  </Button>
                </div>
              )}

              <dl className="mt-6 divide-y divide-border">
                <div className="flex gap-4 py-3">
                  <dt className="w-40 shrink-0 text-sm text-muted-foreground">Target role</dt>
                  <dd className="text-sm font-medium">{role || "From your description"}</dd>
                </div>
                <div className="flex gap-4 py-3">
                  <dt className="w-40 shrink-0 text-sm text-muted-foreground">Your goal</dt>
                  <dd className="text-sm font-medium">
                    {goalText.trim() || `Become a ${role} and build a portfolio project.`}
                  </dd>
                </div>
                <div className="flex gap-4 py-3">
                  <dt className="w-40 shrink-0 text-sm text-muted-foreground">Self-assessment</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {ASSESSED_SKILLS.map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}: {levelLabel(skillLevels[s])}
                      </Badge>
                    ))}
                  </dd>
                </div>
                <div className="flex gap-4 py-3">
                  <dt className="w-40 shrink-0 text-sm text-muted-foreground">Prior learning</dt>
                  <dd className="text-sm font-medium">
                    {priorCourses.length > 0
                      ? `${priorCourses.length} course${priorCourses.length > 1 ? "s" : ""} credited`
                      : "Nothing tagged yet"}
                    {uploadName && ` · ${uploadName}`}
                  </dd>
                </div>
                <div className="flex gap-4 py-3">
                  <dt className="w-40 shrink-0 text-sm text-muted-foreground">Weekly hours</dt>
                  <dd className="text-sm font-medium">
                    {hours} hrs · {pace} pace
                  </dd>
                </div>
                <div className="flex gap-4 py-3">
                  <dt className="w-40 shrink-0 text-sm text-muted-foreground">Formats</dt>
                  <dd className="text-sm font-medium">
                    {formats.length > 0 ? formats.join(", ") : "No preference"}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 rounded-xl border border-ai/25 bg-ai-soft p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-ai-foreground">
                  <Sparkles className="size-4" />
                  Lumi's read on this
                </p>
                <p className="mt-1.5 text-sm text-ai-foreground/85">
                  Your answers map most closely to <strong>{targetPath.title}</strong> —{" "}
                  {targetPath.courses} courses across {targetPath.milestones.length} milestones,
                  roughly {targetPath.weeks} weeks at {hours} hrs/week. Anything you tagged as
                  completed will be credited before the first stage.
                </p>
              </div>
            </section>
          )}

          {/* Wizard controls */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>

            {step < STEPS.length ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>
                Continue
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                size="lg"
                className="gradient-ai"
                disabled={generating || profile.onboardingComplete}
                onClick={() => void handleGenerate()}
              >
                <Wand2 className="size-4" />
                Generate my learning path
              </Button>
            )}
          </div>

          {step === 1 && !canAdvance && (
            <p className="mt-3 text-right text-xs text-muted-foreground">
              Pick a role or write a sentence about your goal to continue.
            </p>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Your answers are saved locally on this device and drive the roadmap for {profile.name}.
      </p>
    </main>
  );
}


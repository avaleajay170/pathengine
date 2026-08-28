import {
  courses,
  learningPaths,
  findPrerequisiteCourse,
  type LearningPath,
  type LearnerProfile,
  type PathNodeItem,
} from "@/data/mock";

export function pathIdForRole(role: LearnerProfile["selectedRole"]): string {
  return role === "ml-engineer"
    ? "ml-engineer"
    : role === "data-analyst"
      ? "data-analyst"
      : "fullstack";
}

function isCourseComplete(profile: LearnerProfile, courseId: string | undefined): boolean {
  return courseId !== undefined && profile.completedCourses.includes(courseId);
}

function prerequisitesComplete(profile: LearnerProfile, node: PathNodeItem): boolean {
  return (node.requires ?? []).every((requirement) => {
    const prerequisite = findPrerequisiteCourse(requirement);
    return prerequisite === undefined || profile.completedCourses.includes(prerequisite.id);
  });
}

function nodeStatus(profile: LearnerProfile, node: PathNodeItem): PathNodeItem["status"] {
  if (profile.nodeStatuses[node.id] === "completed" || isCourseComplete(profile, node.courseId))
    return "completed";
  if (!prerequisitesComplete(profile, node)) return "locked";
  if (node.courseId !== undefined && profile.enrolledCourses.includes(node.courseId)) {
    return "in-progress";
  }
  return "available";
}

export function generateLearningPath(profile: LearnerProfile): LearningPath {
  const template = learningPaths.find((path) => path.id === pathIdForRole(profile.selectedRole));
  if (!template) throw new Error("No learning path template exists for the selected role");

  const addedCourses = profile.addedCourseIds
    .map((id) => courses.find((course) => course.id === id))
    .filter((course): course is (typeof courses)[number] => course !== undefined)
    .filter(
      (course) =>
        !template.milestones.some((milestone) =>
          milestone.nodes.some((node) => node.courseId === course.id),
        ),
    );

  const milestones = template.milestones.map((milestone) => ({
    ...milestone,
    nodes: milestone.nodes.map((node) => ({ ...node, status: nodeStatus(profile, node) })),
  }));

  if (addedCourses.length > 0) {
    const lastMilestone = milestones[milestones.length - 1];
    if (lastMilestone) {
      lastMilestone.nodes.push(
        ...addedCourses.map((course) => ({
          id: `added-${course.id}`,
          courseId: course.id,
          kind: "course" as const,
          title: course.title,
          duration: `${course.hours} hrs`,
          status: nodeStatus(profile, {
            courseId: course.id,
            requires: course.prerequisites,
          } as PathNodeItem),
          skills: course.skills,
          description: course.blurb,
          requires: course.prerequisites,
          reason: "Added by you to keep this course visible in your personalized roadmap.",
        })),
      );
    }
  }

  const allNodes = milestones.flatMap((milestone) => milestone.nodes);
  const completed = allNodes.filter((node) => node.status === "completed").length;
  const hours = allNodes
    .filter((node) => node.status !== "completed")
    .reduce((total, node) => total + (Number.parseInt(node.duration, 10) || 0), 0);
  const weeks = Math.max(1, Math.ceil(hours / Math.max(1, profile.hoursPerWeek)));

  return {
    ...template,
    id: pathIdForRole(profile.selectedRole),
    title: `Become a ${profile.targetRole}`,
    goal: profile.goal || template.goal,
    courses: allNodes.filter((node) => node.kind === "course").length,
    weeks,
    progress: allNodes.length === 0 ? 0 : Math.round((completed / allNodes.length) * 100),
    eta: `${weeks} week${weeks === 1 ? "" : "s"} at ${profile.hoursPerWeek} hrs/week`,
    milestones,
  };
}

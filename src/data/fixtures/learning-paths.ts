/**
 * Learning-path fixture: three authored roadmaps.
 *
 * Each node carries a `reason` written the way the recommender would justify itself — that
 * text is the product's core promise, so it is authored per node rather than templated.
 * Node counts and completion are derived from these statuses by `src/domain/path.ts`; do not
 * add a stored progress field.
 */

import type { LearningPath } from "@/domain/path";

export const learningPaths: LearningPath[] = [
  {
    id: "ml-engineer",
    title: "Become a Machine Learning Engineer",
    goal: "Go from Python scripting to shipping production ML systems in 6 months at 8 hrs/week.",
    level: "Intermediate",
    weeks: 24,
    eta: "12 Feb 2027",
    milestones: [
      {
        id: "foundations",
        title: "Foundations",
        summary: "Close the programming and statistics gap before touching models.",
        nodes: [
          {
            id: "n1",
            courseId: "python-basics",
            kind: "course",
            title: "Python for Everybody: Programming Foundations",
            duration: "22 hrs",
            status: "completed",
            skills: ["Python", "Programming Logic"],
            description:
              "Refresher on Python syntax and data structures — completed ahead of schedule.",
            reason:
              "Your intake said you script occasionally in Python but hadn't formalised data structures. You cleared the diagnostic at 84%, so we compressed this from 4 weeks to 2.",
          },
          {
            id: "n2",
            courseId: "stats-inference",
            kind: "course",
            title: "Statistics & Inference for Data Science",
            duration: "30 hrs",
            status: "in-progress",
            completion: 62,
            skills: ["Statistics", "Experimentation"],
            description:
              "Distributions, confidence intervals and hypothesis testing on product datasets.",
            requires: ["Python for Everybody"],
            reason:
              "Statistics is your largest gap (45% vs the 85% ML-engineer benchmark). Hiring loops for ML engineers test inference reasoning, so we placed this before any modelling work.",
          },
          {
            id: "n3",
            kind: "assessment",
            title: "Skill checkpoint: Inference & sampling",
            duration: "45 min",
            status: "locked",
            skills: ["Statistics"],
            description:
              "Adaptive 20-question checkpoint that re-scores your statistics level and re-plans later stages.",
            requires: ["Statistics & Inference"],
            reason:
              "We insert a checkpoint after every large gap-closing course so the rest of your roadmap re-plans against measured skill, not self-assessment.",
          },
        ],
      },
      {
        id: "core",
        title: "Core Skills",
        summary: "Classical ML end-to-end, with reproducible data workflows.",
        nodes: [
          {
            id: "n4",
            courseId: "pandas-wrangling",
            kind: "course",
            title: "Data Wrangling with pandas",
            duration: "16 hrs",
            status: "available",
            skills: ["pandas", "Data Cleaning"],
            description: "Reshape, merge and clean real datasets in reproducible notebooks.",
            reason:
              "You already cleared SQL for Data Analytics, so we trimmed the SQL-overlap modules here and kept only the reshaping and cleaning units.",
          },
          {
            id: "n5",
            courseId: "ml-foundations",
            kind: "course",
            title: "Machine Learning Foundations",
            duration: "40 hrs",
            status: "locked",
            skills: ["Machine Learning", "scikit-learn"],
            description: "Supervised and unsupervised learning with honest evaluation.",
            requires: ["Statistics & Inference", "Data Wrangling with pandas"],
            reason:
              "This is the spine of your 6-month goal: it moves Machine Learning from 30% to roughly 70% and unlocks both the deep learning track and the capstone.",
          },
          {
            id: "n6",
            kind: "project",
            title: "Project: Churn prediction service",
            duration: "10 hrs",
            status: "locked",
            skills: ["Machine Learning", "Python"],
            description:
              "Build, evaluate and document a churn model on a 120k-row telecom dataset.",
            requires: ["Machine Learning Foundations"],
            reason:
              "You chose hands-on projects as your preferred format, so we added a portfolio artefact right after the theory-heavy course instead of a second lecture course.",
          },
        ],
      },
      {
        id: "specialization",
        title: "Specialization",
        summary: "Deep learning and productionisation — the parts ML roles interview hardest on.",
        nodes: [
          {
            id: "n7",
            courseId: "deep-learning",
            kind: "course",
            title: "Deep Learning with PyTorch",
            duration: "45 hrs",
            status: "locked",
            skills: ["Deep Learning", "PyTorch"],
            description: "Tensors, training loops and modern architectures.",
            requires: ["Machine Learning Foundations"],
            reason:
              "78% of ML-engineer postings you saved mention PyTorch. Your deep learning score is 12%, the widest remaining gap against your target role.",
          },
          {
            id: "n8",
            courseId: "mlops",
            kind: "course",
            title: "MLOps: Shipping Models to Production",
            duration: "26 hrs",
            status: "locked",
            skills: ["MLOps", "Docker"],
            description: "Package, deploy and monitor models responsibly.",
            requires: ["Deep Learning with PyTorch"],
            reason:
              "The 'engineer' half of your goal. Given 8 hrs/week we scheduled this in month 5 so it lands just before your capstone.",
          },
        ],
      },
      {
        id: "capstone",
        title: "Capstone",
        summary: "One shippable, interview-ready product.",
        nodes: [
          {
            id: "n9",
            courseId: "capstone-ml",
            kind: "course",
            title: "Capstone: End-to-End ML Product",
            duration: "35 hrs",
            status: "locked",
            skills: ["MLOps", "Deep Learning", "API Design"],
            description: "Data pipeline, trained model, served API and a monitoring dashboard.",
            requires: ["MLOps", "Deep Learning with PyTorch"],
            reason:
              "Your goal has a hard 6-month deadline, so the path ends with a single portfolio piece that demonstrates every skill in your target role profile at once.",
          },
        ],
      },
    ],
  },
  {
    id: "data-analyst",
    title: "Become a Data Analyst",
    goal: "Move from spreadsheets to SQL, statistics and stakeholder-ready dashboards.",
    level: "Beginner",
    weeks: 14,
    eta: "18 Nov 2026",
    milestones: [
      {
        id: "foundations",
        title: "Foundations",
        summary: "Query data and describe it accurately.",
        nodes: [
          {
            id: "d1",
            courseId: "sql-analytics",
            kind: "course",
            title: "SQL for Data Analytics",
            duration: "18 hrs",
            status: "available",
            skills: ["SQL"],
            description: "Joins, aggregation and window functions.",
            reason:
              "SQL appears in every analyst job description you shortlisted and has no prerequisites, so it opens the path.",
          },
          {
            id: "d2",
            courseId: "viz-storytelling",
            kind: "course",
            title: "Data Visualization & Storytelling",
            duration: "12 hrs",
            status: "locked",
            skills: ["Visualization"],
            description: "Chart selection and narrative for business audiences.",
            requires: ["SQL for Data Analytics"],
            reason:
              "You rated communication as a priority; analysts are hired on how they present findings, not only on query skill.",
          },
        ],
      },
      {
        id: "core",
        title: "Core Skills",
        summary: "Analysis that stands up to scrutiny.",
        nodes: [
          {
            id: "d3",
            courseId: "stats-inference",
            kind: "course",
            title: "Statistics & Inference for Data Science",
            duration: "30 hrs",
            status: "locked",
            skills: ["Statistics"],
            description: "Confidence intervals and A/B testing.",
            requires: ["Data Visualization & Storytelling"],
            reason:
              "Experiment analysis is the most common analyst interview task and your self-assessment placed you at beginner here.",
          },
          {
            id: "d4",
            courseId: "product-analytics",
            kind: "course",
            title: "Product Analytics for Decision Makers",
            duration: "14 hrs",
            status: "locked",
            skills: ["Analytics"],
            description: "Metric trees, cohorts and decision frameworks.",
            requires: ["Statistics & Inference"],
            reason:
              "Adds the business framing that separates a report writer from an analyst partnering with product teams.",
          },
        ],
      },
      {
        id: "capstone",
        title: "Capstone",
        summary: "A portfolio dashboard.",
        nodes: [
          {
            id: "d5",
            kind: "project",
            title: "Project: Retention dashboard",
            duration: "12 hrs",
            status: "locked",
            skills: ["SQL", "Visualization"],
            description: "Build a cohort retention dashboard and write the decision memo.",
            requires: ["Product Analytics"],
            reason:
              "Hiring managers ask for one artefact; this combines every skill in the path into a single shareable piece.",
          },
        ],
      },
    ],
  },
  {
    id: "fullstack",
    title: "Full-Stack Web Developer",
    goal: "Ship production web apps front to back with React, TypeScript and Node.",
    level: "Intermediate",
    weeks: 16,
    eta: "02 Dec 2026",
    milestones: [
      {
        id: "foundations",
        title: "Foundations",
        summary: "Interfaces that hold up on real devices.",
        nodes: [
          {
            id: "f1",
            courseId: "html-css",
            kind: "course",
            title: "Modern HTML & CSS Layouts",
            duration: "14 hrs",
            status: "available",
            skills: ["HTML", "CSS"],
            description: "Flexbox, grid and responsive patterns.",
            reason:
              "Layout gaps are the most common cause of shaky React work, so we front-load it even for developers who already write JavaScript.",
          },
        ],
      },
      {
        id: "core",
        title: "Core Skills",
        summary: "Application architecture.",
        nodes: [
          {
            id: "f2",
            courseId: "react-pro",
            kind: "course",
            title: "React 19 in Practice",
            duration: "28 hrs",
            status: "locked",
            skills: ["React"],
            description: "State design, data fetching and performance.",
            requires: ["Modern HTML & CSS Layouts"],
            reason: "React is named in your goal statement and drives the rest of this path.",
          },
          {
            id: "f3",
            courseId: "typescript-deep",
            kind: "course",
            title: "TypeScript Deep Dive",
            duration: "15 hrs",
            status: "locked",
            skills: ["TypeScript"],
            description: "Generics, narrowing and scalable type patterns.",
            requires: ["React 19 in Practice"],
            reason:
              "Placed after React so every type pattern is practised against components you have already written.",
          },
        ],
      },
      {
        id: "capstone",
        title: "Capstone",
        summary: "Full-stack delivery.",
        nodes: [
          {
            id: "f4",
            courseId: "node-apis",
            kind: "course",
            title: "Building APIs with Node.js",
            duration: "20 hrs",
            status: "locked",
            skills: ["Node.js", "API Design"],
            description: "Auth, validation and testing for backend services.",
            requires: ["TypeScript Deep Dive"],
            reason:
              "Completes the 'full-stack' half of your goal and lets you deploy the front-end project you build in module 2.",
          },
        ],
      },
    ],
  },
];

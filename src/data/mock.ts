// Mock data layer. Structured so it can be swapped for real API calls later:
// every accessor below is a pure function that could become an async fetch.

export type Level = "Beginner" | "Intermediate" | "Advanced";
export type NodeStatus = "locked" | "available" | "in-progress" | "completed";
export type NodeKind = "course" | "project" | "assessment";

export interface Course {
  id: string;
  title: string;
  provider: string;
  instructor: string;
  category: string;
  level: Level;
  rating: number;
  reviews: number;
  hours: number;
  price: number | "Free";
  blurb: string;
  skills: string[];
  syllabus: { title: string; items: string[] }[];
  prerequisites: string[];
  thumbHue: number;
}

export interface PathNodeItem {
  id: string;
  courseId?: string;
  kind: NodeKind;
  title: string;
  duration: string;
  status: NodeStatus;
  skills: string[];
  description: string;
  requires?: string[];
  reason: string;
}

export interface Milestone {
  id: string;
  title: string;
  summary: string;
  nodes: PathNodeItem[];
}

export interface LearningPath {
  id: string;
  title: string;
  goal: string;
  level: Level;
  courses: number;
  weeks: number;
  progress: number;
  eta: string;
  milestones: Milestone[];
}

export const categories = ["Data Science", "Web Development", "AI / ML", "Design", "Business"];

export const courses: Course[] = [
  {
    id: "python-basics",
    title: "Python for Everybody: Programming Foundations",
    provider: "University of Michigan",
    instructor: "Dr. Charles Severance",
    category: "Data Science",
    level: "Beginner",
    rating: 4.8,
    reviews: 21430,
    hours: 22,
    price: "Free",
    blurb:
      "Learn Python syntax, data structures and control flow by building small automation scripts.",
    skills: ["Python", "Programming Logic"],
    syllabus: [
      { title: "Week 1 — Why program?", items: ["Setup", "Variables & types", "Expressions"] },
      { title: "Week 2 — Control flow", items: ["Conditionals", "Loops", "Functions"] },
      { title: "Week 3 — Data structures", items: ["Lists", "Dicts", "Tuples"] },
      { title: "Week 4 — Files & APIs", items: ["Reading files", "JSON", "requests"] },
    ],
    prerequisites: [],
    thumbHue: 220,
  },
  {
    id: "stats-inference",
    title: "Statistics & Inference for Data Science",
    provider: "Duke University",
    instructor: "Prof. Mine Çetinkaya-Rundel",
    category: "Data Science",
    level: "Intermediate",
    rating: 4.7,
    reviews: 9120,
    hours: 30,
    price: 49,
    blurb:
      "Hypothesis testing, distributions and confidence intervals applied to real product datasets.",
    skills: ["Statistics", "Experimentation"],
    syllabus: [
      { title: "Module 1", items: ["Descriptive statistics", "Distributions"] },
      { title: "Module 2", items: ["Sampling", "Confidence intervals"] },
      { title: "Module 3", items: ["A/B testing", "p-values in practice"] },
    ],
    prerequisites: ["Python Basics"],
    thumbHue: 250,
  },
  {
    id: "sql-analytics",
    title: "SQL for Data Analytics",
    provider: "Meta",
    instructor: "Ana Ruiz",
    category: "Data Science",
    level: "Beginner",
    rating: 4.6,
    reviews: 15880,
    hours: 18,
    price: "Free",
    blurb: "Query, join and aggregate production-scale tables with confidence.",
    skills: ["SQL", "Data Modeling"],
    syllabus: [
      { title: "Basics", items: ["SELECT", "WHERE", "ORDER BY"] },
      { title: "Joins", items: ["INNER", "LEFT", "Self joins"] },
      { title: "Analytics", items: ["Window functions", "CTEs"] },
    ],
    prerequisites: [],
    thumbHue: 195,
  },
  {
    id: "pandas-wrangling",
    title: "Data Wrangling with pandas",
    provider: "DataCamp Labs",
    instructor: "Ravi Menon",
    category: "Data Science",
    level: "Intermediate",
    rating: 4.5,
    reviews: 6340,
    hours: 16,
    price: 39,
    blurb: "Clean messy CSVs, reshape frames and build reproducible analysis notebooks.",
    skills: ["pandas", "Data Cleaning"],
    syllabus: [
      { title: "Frames", items: ["Indexing", "Filtering"] },
      { title: "Reshape", items: ["Groupby", "Pivot", "Merge"] },
    ],
    prerequisites: ["Python Basics"],
    thumbHue: 210,
  },
  {
    id: "viz-storytelling",
    title: "Data Visualization & Storytelling",
    provider: "Google",
    instructor: "Elena Park",
    category: "Data Science",
    level: "Beginner",
    rating: 4.7,
    reviews: 8210,
    hours: 12,
    price: "Free",
    blurb: "Turn analysis into decisions with charts that stakeholders actually read.",
    skills: ["Visualization", "Communication"],
    syllabus: [
      { title: "Chart choice", items: ["Encodings", "Anti-patterns"] },
      { title: "Narrative", items: ["Dashboards", "Executive summaries"] },
    ],
    prerequisites: [],
    thumbHue: 175,
  },
  {
    id: "ml-foundations",
    title: "Machine Learning Foundations",
    provider: "Stanford Online",
    instructor: "Dr. Andrew Lin",
    category: "AI / ML",
    level: "Intermediate",
    rating: 4.9,
    reviews: 31240,
    hours: 40,
    price: 59,
    blurb: "Regression, classification, regularization and honest model evaluation.",
    skills: ["Machine Learning", "scikit-learn"],
    syllabus: [
      { title: "Supervised learning", items: ["Linear models", "Trees", "Ensembles"] },
      { title: "Evaluation", items: ["Cross-validation", "Metrics", "Leakage"] },
      { title: "Unsupervised", items: ["Clustering", "PCA"] },
    ],
    prerequisites: ["Python Basics", "Statistics"],
    thumbHue: 265,
  },
  {
    id: "deep-learning",
    title: "Deep Learning with PyTorch",
    provider: "DeepLearning.AI",
    instructor: "Priya Nair",
    category: "AI / ML",
    level: "Advanced",
    rating: 4.8,
    reviews: 17420,
    hours: 45,
    price: 79,
    blurb: "Build, train and debug neural networks from tensors to transformers.",
    skills: ["Deep Learning", "PyTorch"],
    syllabus: [
      { title: "Tensors & autograd", items: ["Backprop", "Optimizers"] },
      { title: "Architectures", items: ["CNNs", "RNNs", "Transformers"] },
    ],
    prerequisites: ["Machine Learning Foundations"],
    thumbHue: 285,
  },
  {
    id: "mlops",
    title: "MLOps: Shipping Models to Production",
    provider: "AWS Training",
    instructor: "Tomás Ferreira",
    category: "AI / ML",
    level: "Advanced",
    rating: 4.6,
    reviews: 4310,
    hours: 26,
    price: 69,
    blurb: "Package, deploy, monitor and retrain models without breaking production.",
    skills: ["MLOps", "Docker", "Monitoring"],
    syllabus: [
      { title: "Packaging", items: ["Docker", "Model registries"] },
      { title: "Serving", items: ["Batch vs online", "Latency budgets"] },
    ],
    prerequisites: ["Machine Learning Foundations"],
    thumbHue: 300,
  },
  {
    id: "nlp-applied",
    title: "Applied Natural Language Processing",
    provider: "Hugging Face",
    instructor: "Sofia Almeida",
    category: "AI / ML",
    level: "Intermediate",
    rating: 4.7,
    reviews: 7620,
    hours: 24,
    price: 45,
    blurb: "Fine-tune language models for classification, extraction and search.",
    skills: ["NLP", "Transformers"],
    syllabus: [
      { title: "Text pipelines", items: ["Tokenization", "Embeddings"] },
      { title: "Fine-tuning", items: ["Datasets", "Evaluation"] },
    ],
    prerequisites: ["Python Basics"],
    thumbHue: 275,
  },
  {
    id: "html-css",
    title: "Modern HTML & CSS Layouts",
    provider: "Frontend Masters",
    instructor: "Jen Alvarez",
    category: "Web Development",
    level: "Beginner",
    rating: 4.6,
    reviews: 11230,
    hours: 14,
    price: "Free",
    blurb: "Flexbox, grid and responsive patterns for production interfaces.",
    skills: ["HTML", "CSS"],
    syllabus: [
      { title: "Box model", items: ["Spacing", "Typography"] },
      { title: "Layout", items: ["Flexbox", "Grid", "Responsive"] },
    ],
    prerequisites: [],
    thumbHue: 205,
  },
  {
    id: "react-pro",
    title: "React 19 in Practice",
    provider: "Vercel Learn",
    instructor: "Marcus Webb",
    category: "Web Development",
    level: "Intermediate",
    rating: 4.8,
    reviews: 14980,
    hours: 28,
    price: 49,
    blurb: "Components, state design, data fetching and performance in real apps.",
    skills: ["React", "TypeScript"],
    syllabus: [
      { title: "Core", items: ["Components", "Hooks", "State design"] },
      { title: "Data", items: ["Caching", "Suspense", "Forms"] },
    ],
    prerequisites: ["HTML & CSS", "JavaScript"],
    thumbHue: 215,
  },
  {
    id: "node-apis",
    title: "Building APIs with Node.js",
    provider: "IBM",
    instructor: "Grace Okonkwo",
    category: "Web Development",
    level: "Intermediate",
    rating: 4.5,
    reviews: 6890,
    hours: 20,
    price: 39,
    blurb: "REST design, auth, validation and testing for backend services.",
    skills: ["Node.js", "API Design"],
    syllabus: [
      { title: "HTTP", items: ["Routing", "Middleware"] },
      { title: "Production", items: ["Auth", "Rate limiting", "Testing"] },
    ],
    prerequisites: ["JavaScript"],
    thumbHue: 160,
  },
  {
    id: "typescript-deep",
    title: "TypeScript Deep Dive",
    provider: "Microsoft",
    instructor: "Daniel Kruger",
    category: "Web Development",
    level: "Advanced",
    rating: 4.7,
    reviews: 5240,
    hours: 15,
    price: 35,
    blurb: "Generics, narrowing and type-level patterns that scale across teams.",
    skills: ["TypeScript"],
    syllabus: [
      { title: "Types", items: ["Unions", "Generics", "Narrowing"] },
      { title: "Patterns", items: ["Utility types", "Declaration files"] },
    ],
    prerequisites: ["JavaScript"],
    thumbHue: 230,
  },
  {
    id: "ux-fundamentals",
    title: "UX Design Fundamentals",
    provider: "California Institute of the Arts",
    instructor: "Nora Hensley",
    category: "Design",
    level: "Beginner",
    rating: 4.7,
    reviews: 13320,
    hours: 18,
    price: "Free",
    blurb: "Research, journey mapping and usability testing from first principles.",
    skills: ["UX Research", "Wireframing"],
    syllabus: [
      { title: "Discovery", items: ["Interviews", "Personas"] },
      { title: "Delivery", items: ["Wireframes", "Usability tests"] },
    ],
    prerequisites: [],
    thumbHue: 330,
  },
  {
    id: "design-systems",
    title: "Design Systems & Component Libraries",
    provider: "Figma Academy",
    instructor: "Leo Tanaka",
    category: "Design",
    level: "Intermediate",
    rating: 4.6,
    reviews: 4120,
    hours: 12,
    price: 29,
    blurb: "Tokens, components and documentation that keep product teams aligned.",
    skills: ["Design Systems", "Figma"],
    syllabus: [
      { title: "Tokens", items: ["Color", "Type scale", "Spacing"] },
      { title: "Components", items: ["Variants", "Docs"] },
    ],
    prerequisites: ["UX Fundamentals"],
    thumbHue: 315,
  },
  {
    id: "data-viz-design",
    title: "Visual Design for Dashboards",
    provider: "Tableau",
    instructor: "Ingrid Sø",
    category: "Design",
    level: "Intermediate",
    rating: 4.4,
    reviews: 2980,
    hours: 10,
    price: 25,
    blurb: "Layout, hierarchy and color for dense analytical interfaces.",
    skills: ["Visual Design", "Dashboards"],
    syllabus: [
      { title: "Hierarchy", items: ["Grids", "Density"] },
      { title: "Color", items: ["Palettes", "Accessibility"] },
    ],
    prerequisites: [],
    thumbHue: 190,
  },
  {
    id: "product-analytics",
    title: "Product Analytics for Decision Makers",
    provider: "Wharton Online",
    instructor: "Dr. Alan Pierce",
    category: "Business",
    level: "Beginner",
    rating: 4.5,
    reviews: 7130,
    hours: 14,
    price: "Free",
    blurb: "Metrics trees, cohort analysis and turning dashboards into decisions.",
    skills: ["Analytics", "Business Strategy"],
    syllabus: [
      { title: "Metrics", items: ["North star", "Cohorts"] },
      { title: "Decisions", items: ["Trade-offs", "Reporting"] },
    ],
    prerequisites: [],
    thumbHue: 145,
  },
  {
    id: "agile-pm",
    title: "Agile Project Management",
    provider: "Google",
    instructor: "Hannah Cole",
    category: "Business",
    level: "Beginner",
    rating: 4.6,
    reviews: 18240,
    hours: 16,
    price: 29,
    blurb: "Backlogs, sprints and stakeholder communication for delivery teams.",
    skills: ["Agile", "Stakeholder Management"],
    syllabus: [
      { title: "Foundations", items: ["Scrum", "Kanban"] },
      { title: "Delivery", items: ["Estimation", "Retrospectives"] },
    ],
    prerequisites: [],
    thumbHue: 130,
  },
  {
    id: "ai-strategy",
    title: "AI Strategy for Product Teams",
    provider: "INSEAD",
    instructor: "Dr. Camille Roy",
    category: "Business",
    level: "Intermediate",
    rating: 4.5,
    reviews: 3410,
    hours: 11,
    price: 55,
    blurb: "Where AI creates value, how to scope pilots and measure ROI.",
    skills: ["AI Strategy", "Roadmapping"],
    syllabus: [
      { title: "Opportunity", items: ["Use-case scoring", "Risk"] },
      { title: "Execution", items: ["Pilots", "ROI models"] },
    ],
    prerequisites: [],
    thumbHue: 260,
  },
  {
    id: "capstone-ml",
    title: "Capstone: End-to-End ML Product",
    provider: "Lumina Labs",
    instructor: "Priya Nair",
    category: "AI / ML",
    level: "Advanced",
    rating: 4.9,
    reviews: 1280,
    hours: 35,
    price: 89,
    blurb: "Ship a full ML product: data pipeline, model, API and monitoring dashboard.",
    skills: ["MLOps", "Deep Learning", "API Design"],
    syllabus: [
      { title: "Scoping", items: ["Problem framing", "Dataset design"] },
      { title: "Build", items: ["Training", "Serving", "Monitoring"] },
    ],
    prerequisites: ["Deep Learning with PyTorch"],
    thumbHue: 290,
  },
];

export const getCourse = (id: string) => courses.find((c) => c.id === id);

export interface LearnerProfile {
  name: string;
  goal: string;
  targetRole: string;
  timeframe: string;
  hoursPerWeek: number;
  streak: number;
  hoursLearned: number;
  skillsMastered: number;
  completedCourses: string[];
  skills: { skill: string; current: number; target: number }[];
}

export const learner: LearnerProfile = {
  name: "Rutik",
  goal: "Become a machine learning engineer in 6 months",
  targetRole: "Machine Learning Engineer",
  timeframe: "6 months",
  hoursPerWeek: 8,
  streak: 12,
  hoursLearned: 96,
  skillsMastered: 7,
  completedCourses: ["python-basics", "sql-analytics"],
  skills: [
    { skill: "Python", current: 78, target: 90 },
    { skill: "Statistics", current: 45, target: 85 },
    { skill: "Machine Learning", current: 30, target: 88 },
    { skill: "Deep Learning", current: 12, target: 80 },
    { skill: "MLOps", current: 8, target: 70 },
    { skill: "SQL", current: 72, target: 75 },
  ],
};

export const learningPaths: LearningPath[] = [
  {
    id: "ml-engineer",
    title: "Become a Machine Learning Engineer",
    goal: "Go from Python scripting to shipping production ML systems in 6 months at 8 hrs/week.",
    level: "Intermediate",
    courses: 8,
    weeks: 24,
    progress: 34,
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
    courses: 5,
    weeks: 14,
    progress: 0,
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
    courses: 4,
    weeks: 16,
    progress: 0,
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

export const getPath = (id: string) => learningPaths.find((p) => p.id === id);

export const activity = [
  { id: "a1", text: "Completed module “Sampling distributions”", when: "2 hours ago" },
  {
    id: "a2",
    text: "Path adapted: pandas course moved earlier after your feedback",
    when: "Yesterday",
  },
  { id: "a3", text: "Earned skill badge — SQL: Window Functions", when: "2 days ago" },
  { id: "a4", text: "Completed SQL for Data Analytics", when: "5 days ago" },
  { id: "a5", text: "Asked the assistant “Why is statistics before ML?”", when: "1 week ago" },
];

export const testimonials = [
  {
    name: "Aisha Rahman",
    role: "Data Analyst at Northwind",
    quote:
      "The path rebuilt itself after I flagged two courses as too easy. I skipped 30 hours of material I already knew and still hit my goal date.",
  },
  {
    name: "Diego Santos",
    role: "ML Engineer at Halcyon",
    quote:
      "Every recommendation came with a reason tied to my skill gaps. It felt like a mentor who had actually read my transcript.",
  },
  {
    name: "Lena Fischer",
    role: "Product Designer at Kite",
    quote:
      "I told it I only had five hours a week. The roadmap re-sequenced everything around that instead of guilt-tripping me.",
  },
];

export const stats = [
  { label: "Active learners", value: "10,000+" },
  { label: "Curated courses", value: "500+" },
  { label: "Goal completion", value: "98%" },
  { label: "Partner providers", value: "40+" },
];

export const skillTrend = [
  { month: "Mar", Python: 40, Statistics: 15, ML: 5 },
  { month: "Apr", Python: 55, Statistics: 22, ML: 10 },
  { month: "May", Python: 64, Statistics: 30, ML: 16 },
  { month: "Jun", Python: 70, Statistics: 38, ML: 22 },
  { month: "Jul", Python: 75, Statistics: 42, ML: 27 },
  { month: "Aug", Python: 78, Statistics: 45, ML: 30 },
];

// ---------------------------------------------------------------------------
// Course reviews. Deterministic per course id so the same course always shows
// the same reviews — swap getReviews() for a fetch when a real API exists.
// ---------------------------------------------------------------------------

export interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  when: string;
  body: string;
}

const reviewers = [
  { name: "Priyanka S.", role: "Analyst, fintech" },
  { name: "Marcus O.", role: "Career switcher" },
  { name: "Yuki T.", role: "Backend engineer" },
  { name: "Dani R.", role: "Recent graduate" },
  { name: "Tobias L.", role: "Ops lead" },
  { name: "Amara N.", role: "Product designer" },
  { name: "Sam K.", role: "Data engineer" },
  { name: "Helena V.", role: "Consultant" },
] as const;

const firstSkill = (c: Course) => c.skills[0] ?? c.category;
const lastSkill = (c: Course) => c.skills[c.skills.length - 1] ?? c.category;
const firstModule = (c: Course) => c.syllabus[0]?.title ?? "the opening module";

const reviewBodies = [
  (c: Course) =>
    `The ${firstSkill(c)} sections are the reason to take this. I'd tried two other ${c.category} courses before and this was the first one that explained why rather than just how. Budget more than the listed ${c.hours} hours if you actually do the exercises.`,
  (c: Course) =>
    `${c.instructor} moves fast but never skips the reasoning. I watched at 1.5x and still had to rewind the ${lastSkill(c)} material twice — in a good way.`,
  (c: Course) =>
    `Good structure, and the assignments are graded on real datasets instead of toy examples. Docked a star because a couple of the ${c.provider} platform videos are a year out of date.`,
  (c: Course) =>
    `Came in as a ${c.level.toLowerCase()} and that was the right call. The first module felt slow, then it earned it — by the end I'd shipped something I put in my portfolio.`,
  (c: Course) =>
    `Worth it for the ${firstSkill(c)} depth alone. I use about half of this at work now, and the notes are the ones I actually go back to.`,
  (c: Course) =>
    `Dense but fair. Do the ${firstModule(c).toLowerCase()} exercises properly before moving on or the later modules will hurt.`,
] as const;

const whenPool = [
  "2 weeks ago",
  "1 month ago",
  "2 months ago",
  "3 months ago",
  "5 months ago",
] as const;

const seedOf = (s: string) => s.split("").reduce((n, ch) => n + ch.charCodeAt(0), 0);

/** Deterministic pick from a non-empty list; the index wraps around. */
function cycle<T>(items: readonly [T, ...T[]], index: number): T {
  return items[Math.abs(index) % items.length] ?? items[0];
}

export function getReviews(courseId: string): Review[] {
  const course = getCourse(courseId);
  if (!course) return [];
  const seed = seedOf(courseId);
  return [0, 1, 2].map((i) => {
    const reviewer = cycle<{ name: string; role: string }>(reviewers, seed + i * 3);
    return {
      id: `${courseId}-r${i}`,
      name: reviewer.name,
      role: reviewer.role,
      rating: i === 2 && course.rating < 4.7 ? 4 : 5,
      when: cycle(whenPool, seed + i * 2),
      body: cycle(reviewBodies, seed + i * 2)(course),
    };
  });
}

/** Plausible star distribution (percentages, sums to 100) derived from the rating. */
export function ratingBreakdown(course: Course): { stars: number; pct: number }[] {
  const t = Math.min(1, Math.max(0, (course.rating - 4.4) / 0.5));
  const five = Math.round(62 + t * 30);
  const four = Math.round(24 - t * 18);
  const three = Math.round(8 - t * 7);
  const two = Math.round(4 - t * 3);
  const one = Math.max(0, 100 - five - four - three - two);
  return [
    { stars: 5, pct: five },
    { stars: 4, pct: four },
    { stars: 3, pct: three },
    { stars: 2, pct: two },
    { stars: 1, pct: one },
  ];
}

/** Where a course sits inside a learning path — powers "why this is in your path". */
export function findCourseInPaths(courseId: string) {
  for (const path of learningPaths) {
    for (const milestone of path.milestones) {
      const node = milestone.nodes.find((n) => n.courseId === courseId);
      if (node) return { path, milestone, node };
    }
  }
  return null;
}

/** Resolve a prerequisite label (e.g. "Python Basics") to a real course when possible. */
export function findPrerequisiteCourse(label: string): Course | undefined {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const lower = label.toLowerCase();
  return (
    courses.find((c) => c.id === slug) ??
    courses.find((c) => c.title.toLowerCase().includes(lower)) ??
    courses.find((c) => lower.includes(c.title.toLowerCase()))
  );
}

function firstOf<T>(items: readonly T[], label: string): T {
  const [head] = items;
  if (head === undefined) throw new Error(`mock data: expected at least one ${label}`);
  return head;
}

/** The path we fall back to when an id doesn't match — always defined. */
export const defaultPath: LearningPath = firstOf(learningPaths, "learning path");

/** Like getPath(), but guaranteed to return a path so pages never render empty. */
export function getPathOrDefault(id: string): LearningPath {
  return getPath(id) ?? defaultPath;
}

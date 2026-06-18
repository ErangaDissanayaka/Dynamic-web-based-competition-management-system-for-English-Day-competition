export type UserRole = "admin" | "school" | "student" | "judge" | "guest";

export type EventStatus =
  | "upcoming"
  | "registration_open"
  | "registration_closed"
  | "judging_live"
  | "results_published";

export type Category = string;
export type ScoreDimension =
  | "delivery"
  | "content"
  | "language"
  | "presentation";

export type ScoreInput = Record<ScoreDimension, number>;

export type ScoringCriterion = {
  key: ScoreDimension;
  label: string;
  weight: number;
  maxScore: number;
};

type ScoringProfileKey =
  | "oral"
  | "drama"
  | "writing"
  | "handwriting"
  | "dictation"
  | "quiz";

type CategoryDefinition = {
  label: string;
  icon: string;
  description: string;
  minGrade: number;
  maxGrade: number;
  scoringProfile: ScoringProfileKey;
};

const MAX_SCORE = 100;

const SCORING_PROFILES: Record<ScoringProfileKey, readonly ScoringCriterion[]> =
  {
    oral: [
      {
        key: "delivery",
        label: "Delivery & Expression",
        weight: 0.35,
        maxScore: MAX_SCORE,
      },
      {
        key: "content",
        label: "Content & Structure",
        weight: 0.3,
        maxScore: MAX_SCORE,
      },
      {
        key: "language",
        label: "Language Accuracy",
        weight: 0.2,
        maxScore: MAX_SCORE,
      },
      {
        key: "presentation",
        label: "Audience Impact",
        weight: 0.15,
        maxScore: MAX_SCORE,
      },
    ],
    drama: [
      {
        key: "delivery",
        label: "Acting & Voice",
        weight: 0.3,
        maxScore: MAX_SCORE,
      },
      {
        key: "content",
        label: "Interpretation",
        weight: 0.25,
        maxScore: MAX_SCORE,
      },
      {
        key: "language",
        label: "Language Use",
        weight: 0.2,
        maxScore: MAX_SCORE,
      },
      {
        key: "presentation",
        label: "Stage Craft",
        weight: 0.25,
        maxScore: MAX_SCORE,
      },
    ],
    writing: [
      {
        key: "delivery",
        label: "Ideas & Relevance",
        weight: 0.3,
        maxScore: MAX_SCORE,
      },
      {
        key: "content",
        label: "Organization",
        weight: 0.25,
        maxScore: MAX_SCORE,
      },
      {
        key: "language",
        label: "Language Accuracy",
        weight: 0.3,
        maxScore: MAX_SCORE,
      },
      {
        key: "presentation",
        label: "Originality & Style",
        weight: 0.15,
        maxScore: MAX_SCORE,
      },
    ],
    handwriting: [
      {
        key: "delivery",
        label: "Letter Formation",
        weight: 0.35,
        maxScore: MAX_SCORE,
      },
      {
        key: "content",
        label: "Spacing & Alignment",
        weight: 0.25,
        maxScore: MAX_SCORE,
      },
      {
        key: "language",
        label: "Accuracy",
        weight: 0.15,
        maxScore: MAX_SCORE,
      },
      {
        key: "presentation",
        label: "Neatness",
        weight: 0.25,
        maxScore: MAX_SCORE,
      },
    ],
    dictation: [
      {
        key: "delivery",
        label: "Listening Accuracy",
        weight: 0.4,
        maxScore: MAX_SCORE,
      },
      {
        key: "content",
        label: "Spelling",
        weight: 0.25,
        maxScore: MAX_SCORE,
      },
      {
        key: "language",
        label: "Punctuation",
        weight: 0.2,
        maxScore: MAX_SCORE,
      },
      {
        key: "presentation",
        label: "Written Presentation",
        weight: 0.15,
        maxScore: MAX_SCORE,
      },
    ],
    quiz: [
      {
        key: "delivery",
        label: "Knowledge",
        weight: 0.35,
        maxScore: MAX_SCORE,
      },
      {
        key: "content",
        label: "Accuracy",
        weight: 0.3,
        maxScore: MAX_SCORE,
      },
      {
        key: "language",
        label: "English Usage",
        weight: 0.15,
        maxScore: MAX_SCORE,
      },
      {
        key: "presentation",
        label: "Response Speed",
        weight: 0.2,
        maxScore: MAX_SCORE,
      },
    ],
  };

export const CATEGORY_DEFINITIONS: Record<string, CategoryDefinition> = {
  drama_primary: {
    label: "Drama - Primary",
    icon: "🎭",
    description:
      "Short stage productions built around values, peace, and environmental themes.",
    minGrade: 3,
    maxGrade: 5,
    scoringProfile: "drama",
  },
  drama_junior: {
    label: "Drama - Junior",
    icon: "🎭",
    description:
      "Junior drama performances with stronger ensemble work and character expression.",
    minGrade: 6,
    maxGrade: 9,
    scoringProfile: "drama",
  },
  drama_senior: {
    label: "Drama - Senior",
    icon: "🎭",
    description:
      "Senior dramatic interpretation with advanced language use and stage presence.",
    minGrade: 10,
    maxGrade: 13,
    scoringProfile: "drama",
  },
  oratory: {
    label: "Oratory",
    icon: "🎤",
    description:
      "Prepared speeches focused on pronunciation, fluency, argument, and audience impact.",
    minGrade: 6,
    maxGrade: 13,
    scoringProfile: "oral",
  },
  poetry_recitation: {
    label: "Poetry Recitation",
    icon: "📜",
    description:
      "Expressive spoken poetry judged on intonation, rhythm, and emotional delivery.",
    minGrade: 1,
    maxGrade: 13,
    scoringProfile: "oral",
  },
  storytelling: {
    label: "Storytelling",
    icon: "📖",
    description:
      "Narrative performance that rewards clarity, creativity, pacing, and engagement.",
    minGrade: 1,
    maxGrade: 9,
    scoringProfile: "oral",
  },
  essay_writing: {
    label: "Essay Writing",
    icon: "✍️",
    description:
      "Structured English writing that tests originality, coherence, grammar, and style.",
    minGrade: 6,
    maxGrade: 13,
    scoringProfile: "writing",
  },
  handwriting: {
    label: "Handwriting",
    icon: "🖋️",
    description:
      "Calligraphy-style handwriting evaluated for neatness, spacing, and presentation.",
    minGrade: 1,
    maxGrade: 8,
    scoringProfile: "handwriting",
  },
  dictation: {
    label: "Dictation",
    icon: "📝",
    description:
      "Listening and written accuracy assessed through spelling, punctuation, and mechanics.",
    minGrade: 1,
    maxGrade: 8,
    scoringProfile: "dictation",
  },
  debate: {
    label: "Debate",
    icon: "💬",
    description:
      "Team-based argumentation measured through rebuttal, evidence, and spoken confidence.",
    minGrade: 9,
    maxGrade: 13,
    scoringProfile: "oral",
  },
  literary_quiz: {
    label: "Language & Literary Quiz",
    icon: "🧠",
    description:
      "Fast-response quiz on vocabulary, literature, grammar, and general language knowledge.",
    minGrade: 6,
    maxGrade: 13,
    scoringProfile: "quiz",
  },
};

export const DEFAULT_EVENT_CATEGORIES: Category[] = [
  "drama_primary",
  "drama_junior",
  "drama_senior",
  "oratory",
  "poetry_recitation",
  "storytelling",
  "essay_writing",
  "handwriting",
  "dictation",
  "debate",
  "literary_quiz",
];

function formatGradeBand(minGrade: number, maxGrade: number) {
  return minGrade === maxGrade
    ? `Grade ${minGrade}`
    : `Grades ${minGrade}-${maxGrade}`;
}

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_DEFINITIONS).map(([key, definition]) => [
    key,
    definition.label,
  ]),
);

export const CATEGORY_ICONS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_DEFINITIONS).map(([key, definition]) => [
    key,
    definition.icon,
  ]),
);

export const CATEGORY_DESCRIPTIONS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_DEFINITIONS).map(([key, definition]) => [
    key,
    definition.description,
  ]),
);

export const CATEGORY_GRADE_BANDS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_DEFINITIONS).map(([key, definition]) => [
    key,
    formatGradeBand(definition.minGrade, definition.maxGrade),
  ]),
);

export const GRADE_OPTIONS = Array.from(
  { length: 13 },
  (_, index) => `Grade ${index + 1}`,
);

export const COMPETITION_LEVELS = [
  {
    key: "zonal",
    label: "Zonal Level",
    description:
      "Local inter-school competition coordinated across the education zone.",
  },
  {
    key: "district",
    label: "District Level",
    description:
      "District-wide contest featuring top performers from zonal competitions.",
  },
  {
    key: "provincial",
    label: "Provincial Level",
    description: "Provincial finals that consolidate the top zonal performers.",
  },
  {
    key: "national",
    label: "National Level",
    description:
      "Island-wide showcase for the best school English Day competitors.",
  },
] as const;

function humanizeCategory(category: string) {
  return category
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getCategoryLabel(category: Category) {
  return CATEGORY_LABELS[category] || humanizeCategory(category);
}

export function getCategoryIcon(category: Category) {
  return CATEGORY_ICONS[category] || "🏅";
}

export function getCategoryDescription(category: Category) {
  return CATEGORY_DESCRIPTIONS[category] || "Competition category";
}

export function getCategoryGradeBand(category: Category) {
  return CATEGORY_GRADE_BANDS[category] || "Grades 1-13";
}

export function getMaxSlotsForCategory(category: Category) {
  if (isDramaCategory(category)) {
    return 10;
  }

  const definition = CATEGORY_DEFINITIONS[category];
  if (!definition) {
    return 13; // Default to all grades
  }
  return definition.maxGrade - definition.minGrade + 1;
}

export function isDramaCategory(category: Category): boolean {
  return String(category || "").startsWith("drama_");
}

export function parseGradeLevel(grade: string) {
  const match = String(grade || "").match(/(\d{1,2})/);
  if (!match) {
    return null;
  }

  const value = Number(match[1]);
  return Number.isInteger(value) ? value : null;
}

export function getAllowedGradesForCategory(category: Category) {
  const definition = CATEGORY_DEFINITIONS[category];
  if (!definition) {
    return GRADE_OPTIONS;
  }

  return GRADE_OPTIONS.filter((grade) => {
    const level = parseGradeLevel(grade);
    return (
      level !== null &&
      level >= definition.minGrade &&
      level <= definition.maxGrade
    );
  });
}

export function isGradeAllowedForCategory(category: Category, grade: string) {
  return getAllowedGradesForCategory(category).includes(grade);
}

export function getCategoryScoreCriteria(
  category: Category,
): ScoringCriterion[] {
  const definition = CATEGORY_DEFINITIONS[category];
  const profile = definition?.scoringProfile || "oral";
  return SCORING_PROFILES[profile].map((criterion) => ({ ...criterion }));
}

export function getOrderedCategories(categories: readonly Category[]) {
  const unique: Category[] = [];

  for (const category of categories) {
    if (category && !unique.includes(category)) {
      unique.push(category);
    }
  }

  const builtIn = DEFAULT_EVENT_CATEGORIES.filter((category) =>
    unique.includes(category),
  );
  const custom = unique
    .filter((category) => !DEFAULT_EVENT_CATEGORIES.includes(category))
    .sort((left, right) =>
      getCategoryLabel(left).localeCompare(getCategoryLabel(right)),
    );

  return [...builtIn, ...custom];
}

export const STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: "Upcoming",
  registration_open: "Registration Open",
  registration_closed: "Registration Closed",
  judging_live: "Judging Live",
  results_published: "Results Published",
};

export interface School {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  color: string;
  approved: boolean;
}

export interface Student {
  id: string;
  name: string;
  schoolId: string;
  category: Category;
  eventId: string;
  grade: string;
}

export interface Event {
  id: string;
  name: string;
  year: number;
  date: string;
  venue: string;
  status: EventStatus;
  registrationDeadline: string;
  categories: Category[];
}

export interface EventNotificationSummary {
  status: "sent" | "partial" | "failed" | "skipped";
  recipientCount: number;
  deliveredCount: number;
  failedCount: number;
  message: string;
}

export interface Score {
  id: string;
  studentId: string;
  judgeId: string;
  eventId: string;
  category: Category;
  delivery: number;
  content: number;
  language: number;
  presentation: number;
  total: number;
}

export interface LeaderboardEntry {
  rank: number;
  studentName: string;
  schoolName: string;
  schoolColor: string;
  category: Category;
  avgScore: number;
  scores: {
    delivery: number;
    content: number;
    language: number;
    presentation: number;
  };
}

export const SCORING_CRITERIA = getCategoryScoreCriteria("oratory");

export function calculateWeightedTotal(
  scores: ScoreInput,
  category?: Category,
) {
  return Math.round(
    getCategoryScoreCriteria(category || "oratory").reduce(
      (total, criterion) => total + scores[criterion.key] * criterion.weight,
      0,
    ),
  );
}

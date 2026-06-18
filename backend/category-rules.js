export const DEFAULT_EVENT_CATEGORIES = [
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

const MAX_SCORE = 100;

const SCORING_PROFILES = {
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
    { key: "language", label: "Accuracy", weight: 0.15, maxScore: MAX_SCORE },
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
    { key: "content", label: "Spelling", weight: 0.25, maxScore: MAX_SCORE },
    { key: "language", label: "Punctuation", weight: 0.2, maxScore: MAX_SCORE },
    {
      key: "presentation",
      label: "Written Presentation",
      weight: 0.15,
      maxScore: MAX_SCORE,
    },
  ],
  quiz: [
    { key: "delivery", label: "Knowledge", weight: 0.35, maxScore: MAX_SCORE },
    { key: "content", label: "Accuracy", weight: 0.3, maxScore: MAX_SCORE },
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

const CATEGORY_RULES = {
  drama_primary: { minGrade: 3, maxGrade: 5, scoringProfile: "drama" },
  drama_junior: { minGrade: 6, maxGrade: 9, scoringProfile: "drama" },
  drama_senior: { minGrade: 10, maxGrade: 13, scoringProfile: "drama" },
  oratory: { minGrade: 6, maxGrade: 13, scoringProfile: "oral" },
  poetry_recitation: { minGrade: 1, maxGrade: 13, scoringProfile: "oral" },
  storytelling: { minGrade: 1, maxGrade: 9, scoringProfile: "oral" },
  essay_writing: { minGrade: 6, maxGrade: 13, scoringProfile: "writing" },
  handwriting: { minGrade: 1, maxGrade: 8, scoringProfile: "handwriting" },
  dictation: { minGrade: 1, maxGrade: 8, scoringProfile: "dictation" },
  debate: { minGrade: 9, maxGrade: 13, scoringProfile: "oral" },
  literary_quiz: { minGrade: 6, maxGrade: 13, scoringProfile: "quiz" },
};

function cloneCriteria(criteria) {
  return criteria.map((criterion) => ({ ...criterion }));
}

export function parseGradeLevel(grade) {
  const match = String(grade || "").match(/(\d{1,2})/);
  if (!match) {
    return null;
  }

  const value = Number(match[1]);
  return Number.isInteger(value) ? value : null;
}

export function getCategoryRule(category) {
  return (
    CATEGORY_RULES[String(category)] || {
      minGrade: 1,
      maxGrade: 13,
      scoringProfile: "oral",
    }
  );
}

export function getCategoryGradeBand(category) {
  const { minGrade, maxGrade } = getCategoryRule(category);
  return minGrade === maxGrade
    ? `Grade ${minGrade}`
    : `Grades ${minGrade}-${maxGrade}`;
}

export function getMaxSlotsForCategory(category) {
  if (isDramaCategory(category)) {
    return 10;
  }

  const { minGrade, maxGrade } = getCategoryRule(category);
  return maxGrade - minGrade + 1;
}

export function isDramaCategory(category) {
  return String(category || "").startsWith("drama_");
}

export function isGradeAllowedForCategory(category, grade) {
  const gradeLevel = parseGradeLevel(grade);
  if (gradeLevel === null) {
    return false;
  }

  const { minGrade, maxGrade } = getCategoryRule(category);
  return gradeLevel >= minGrade && gradeLevel <= maxGrade;
}

export function getScoringCriteria(category) {
  const { scoringProfile } = getCategoryRule(category);
  return cloneCriteria(
    SCORING_PROFILES[scoringProfile] || SCORING_PROFILES.oral,
  );
}

export function calculateWeightedTotal(scores, category) {
  return Math.round(
    getScoringCriteria(category).reduce(
      (total, criterion) =>
        total + Number(scores?.[criterion.key] || 0) * criterion.weight,
      0,
    ),
  );
}

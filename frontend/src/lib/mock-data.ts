import type {
  School,
  Student,
  Event,
  Score,
  LeaderboardEntry,
  Category,
} from "./types";
import { calculateWeightedTotal, DEFAULT_EVENT_CATEGORIES } from "./types";

export const schools: School[] = [
  {
    id: "s1",
    name: "St. George's International School",
    shortName: "SGIS",
    logo: "🏫",
    color: "#1e3a5f",
    approved: true,
  },
  {
    id: "s2",
    name: "Greenfield Academy",
    shortName: "GA",
    logo: "🌿",
    color: "#2d6a4f",
    approved: true,
  },
  {
    id: "s3",
    name: "Sunrise International College",
    shortName: "SIC",
    logo: "☀️",
    color: "#e07b39",
    approved: true,
  },
  {
    id: "s4",
    name: "Lakewood High School",
    shortName: "LHS",
    logo: "🌊",
    color: "#3a86a8",
    approved: false,
  },
];

export const events: Event[] = [
  {
    id: "e1",
    name: "English Day 2024",
    year: 2024,
    date: "2024-03-15",
    venue: "National Auditorium",
    status: "results_published",
    registrationDeadline: "2024-02-15",
    categories: [...DEFAULT_EVENT_CATEGORIES],
  },
  {
    id: "e2",
    name: "English Day 2025",
    year: 2025,
    date: "2025-03-20",
    venue: "Grand Convention Centre",
    status: "results_published",
    registrationDeadline: "2025-02-20",
    categories: [...DEFAULT_EVENT_CATEGORIES],
  },
  {
    id: "e3",
    name: "English Day 2026",
    year: 2026,
    date: "2026-04-10",
    venue: "City Arena Hall",
    status: "registration_open",
    registrationDeadline: "2026-03-25",
    categories: [...DEFAULT_EVENT_CATEGORIES],
  },
];

export const students: Student[] = [
  {
    id: "st1",
    name: "Emma Richardson",
    schoolId: "s1",
    category: "oratory",
    eventId: "e3",
    grade: "Grade 10",
  },
  {
    id: "st2",
    name: "James Tan",
    schoolId: "s1",
    category: "debate",
    eventId: "e3",
    grade: "Grade 12",
  },
  {
    id: "st3",
    name: "Sophia Chen",
    schoolId: "s1",
    category: "drama_senior",
    eventId: "e3",
    grade: "Grade 11",
  },
  {
    id: "st4",
    name: "Aiden Kumar",
    schoolId: "s2",
    category: "storytelling",
    eventId: "e3",
    grade: "Grade 6",
  },
  {
    id: "st5",
    name: "Mia Rossi",
    schoolId: "s2",
    category: "poetry_recitation",
    eventId: "e3",
    grade: "Grade 8",
  },
  {
    id: "st6",
    name: "Oliver Park",
    schoolId: "s3",
    category: "essay_writing",
    eventId: "e3",
    grade: "Grade 13",
  },
  {
    id: "st7",
    name: "Zara Ahmed",
    schoolId: "s3",
    category: "literary_quiz",
    eventId: "e3",
    grade: "Grade 9",
  },
  {
    id: "st8",
    name: "Liam O'Brien",
    schoolId: "s1",
    category: "handwriting",
    eventId: "e3",
    grade: "Grade 5",
  },
  {
    id: "st13",
    name: "Nethmi Perera",
    schoolId: "s2",
    category: "dictation",
    eventId: "e3",
    grade: "Grade 4",
  },
  {
    id: "st14",
    name: "Kavindu Silva",
    schoolId: "s3",
    category: "drama_primary",
    eventId: "e3",
    grade: "Grade 5",
  },
  {
    id: "st15",
    name: "Tharushi Fernando",
    schoolId: "s3",
    category: "drama_junior",
    eventId: "e3",
    grade: "Grade 8",
  },
  // Past events
  {
    id: "st9",
    name: "Sarah Lee",
    schoolId: "s1",
    category: "oratory",
    eventId: "e2",
    grade: "Grade 11",
  },
  {
    id: "st10",
    name: "Daniel Wong",
    schoolId: "s2",
    category: "debate",
    eventId: "e2",
    grade: "Grade 10",
  },
  {
    id: "st11",
    name: "Priya Sharma",
    schoolId: "s3",
    category: "drama_senior",
    eventId: "e2",
    grade: "Grade 11",
  },
  {
    id: "st12",
    name: "Marcus Hall",
    schoolId: "s1",
    category: "literary_quiz",
    eventId: "e1",
    grade: "Grade 9",
  },
];

const makeScore = (
  studentId: string,
  eventId: string,
  category: Category,
  d: number,
  c: number,
  l: number,
  p: number,
): Score => ({
  id: `sc-${studentId}-${eventId}`,
  studentId,
  judgeId: "j1",
  eventId,
  category,
  delivery: d,
  content: c,
  language: l,
  presentation: p,
  total: calculateWeightedTotal(
    {
      delivery: d,
      content: c,
      language: l,
      presentation: p,
    },
    category,
  ),
});

export const scores: Score[] = [
  makeScore("st9", "e2", "oratory", 88, 85, 90, 92),
  makeScore("st10", "e2", "debate", 84, 88, 82, 86),
  makeScore("st11", "e2", "drama_senior", 91, 87, 85, 90),
  makeScore("st12", "e1", "literary_quiz", 95, 90, 88, 85),
];

export function getLeaderboard(
  eventId: string,
  category?: Category,
): LeaderboardEntry[] {
  const eventScores = scores.filter(
    (s) => s.eventId === eventId && (!category || s.category === category),
  );
  const entries: LeaderboardEntry[] = eventScores.map((score) => {
    const student = students.find((st) => st.id === score.studentId)!;
    const school = schools.find((sc) => sc.id === student.schoolId)!;
    return {
      rank: 0,
      studentName: student.name,
      schoolName: school.shortName,
      schoolColor: school.color,
      category: score.category,
      avgScore: score.total,
      scores: {
        delivery: score.delivery,
        content: score.content,
        language: score.language,
        presentation: score.presentation,
      },
    };
  });
  entries.sort((a, b) => b.avgScore - a.avgScore);
  entries.forEach((e, i) => (e.rank = i + 1));
  return entries;
}

export const pastWinners = [
  {
    year: 2025,
    category: "Oratory",
    winner: "Sarah Lee",
    school: "SGIS",
    score: 88,
  },
  {
    year: 2025,
    category: "Drama - Senior",
    winner: "Priya Sharma",
    school: "SIC",
    score: 89,
  },
  {
    year: 2024,
    category: "Language & Literary Quiz",
    winner: "Marcus Hall",
    school: "SGIS",
    score: 91,
  },
  {
    year: 2024,
    category: "Poetry Recitation",
    winner: "Emma Chen",
    school: "GA",
    score: 85,
  },
  {
    year: 2024,
    category: "Debate",
    winner: "Tom Richards",
    school: "SIC",
    score: 87,
  },
];

export const schoolPerformance = [
  { year: 2024, SGIS: 88, GA: 82, SIC: 79 },
  { year: 2025, SGIS: 90, GA: 85, SIC: 87 },
];

import {
  calculateWeightedTotal,
  DEFAULT_EVENT_CATEGORIES,
} from "./category-rules.js";

const nextId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export { calculateWeightedTotal };

export const users = [
  {
    id: "school-1",
    name: "School Rep (SGIS)",
    email: "school@sgis.edu",
    password: "school123",
    role: "school",
    schoolId: "s1",
    approvalStatus: "approved",
  },
  {
    id: "student-1",
    name: "Sarah Lee",
    email: "student@sgis.edu",
    password: "student123",
    role: "student",
    schoolId: "s1",
    approvalStatus: "approved",
  },
  {
    id: "judge-1",
    name: "Judge Panel A",
    email: "judge@panel.edu",
    password: "judge123",
    role: "judge",
    judgeCategory: "all",
    approvalStatus: "approved",
  },
];

export const schools = [
  {
    id: "s1",
    name: "St. George's International School",
    shortName: "SGIS",
    logo: "SGIS",
    color: "#1e3a5f",
    approved: true,
    reviewStatus: "approved",
  },
  {
    id: "s2",
    name: "Greenfield Academy",
    shortName: "GA",
    logo: "GA",
    color: "#2d6a4f",
    approved: true,
    reviewStatus: "approved",
  },
  {
    id: "s3",
    name: "Sunrise International College",
    shortName: "SIC",
    logo: "SIC",
    color: "#e07b39",
    approved: true,
    reviewStatus: "approved",
  },
  {
    id: "s4",
    name: "Lakewood High School",
    shortName: "LHS",
    logo: "LHS",
    color: "#3a86a8",
    approved: false,
    reviewStatus: "pending",
  },
];

export const events = [
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
    venue: "City Hall",
    status: "registration_open",
    registrationDeadline: "2026-03-25",
    categories: [...DEFAULT_EVENT_CATEGORIES],
  },
];

export const students = [
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

export const scores = [
  {
    id: "sc-st9-e2",
    studentId: "st9",
    judgeId: "j1",
    eventId: "e2",
    category: "oratory",
    delivery: 88,
    content: 85,
    language: 90,
    presentation: 92,
    total: calculateWeightedTotal(
      {
        delivery: 88,
        content: 85,
        language: 90,
        presentation: 92,
      },
      "oratory",
    ),
  },
  {
    id: "sc-st10-e2",
    studentId: "st10",
    judgeId: "j1",
    eventId: "e2",
    category: "debate",
    delivery: 84,
    content: 88,
    language: 82,
    presentation: 86,
    total: calculateWeightedTotal(
      {
        delivery: 84,
        content: 88,
        language: 82,
        presentation: 86,
      },
      "debate",
    ),
  },
  {
    id: "sc-st11-e2",
    studentId: "st11",
    judgeId: "j1",
    eventId: "e2",
    category: "drama_senior",
    delivery: 91,
    content: 87,
    language: 85,
    presentation: 90,
    total: calculateWeightedTotal(
      {
        delivery: 91,
        content: 87,
        language: 85,
        presentation: 90,
      },
      "drama_senior",
    ),
  },
  {
    id: "sc-st12-e1",
    studentId: "st12",
    judgeId: "j1",
    eventId: "e1",
    category: "literary_quiz",
    delivery: 95,
    content: 90,
    language: 88,
    presentation: 85,
    total: calculateWeightedTotal(
      {
        delivery: 95,
        content: 90,
        language: 88,
        presentation: 85,
      },
      "literary_quiz",
    ),
  },
];

export const toSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  schoolId: user.schoolId,
  judgeCategory: user.judgeCategory,
});

export const findUserByEmail = (email) => {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
};

export const createUser = ({
  name,
  email,
  password,
  role,
  schoolId,
  judgeCategory,
}) => {
  const newUser = {
    id: nextId("user"),
    name,
    email,
    password,
    role,
    schoolId,
    judgeCategory,
  };

  users.push(newUser);
  return newUser;
};

export const createSchool = ({ name, shortName }) => {
  const newSchool = {
    id: nextId("school"),
    name,
    shortName,
    logo: shortName,
    color: "#475569",
    approved: false,
  };

  schools.push(newSchool);
  return newSchool;
};

export const createStudent = ({ name, schoolId, category, eventId, grade }) => {
  const newStudent = {
    id: nextId("st"),
    name,
    schoolId,
    category,
    eventId,
    grade,
  };

  students.push(newStudent);
  return newStudent;
};

export const createEvent = ({
  name,
  year,
  date,
  venue,
  status,
  registrationDeadline,
  categories,
}) => {
  const newEvent = {
    id: nextId("e"),
    name,
    year,
    date,
    venue,
    status,
    registrationDeadline,
    categories,
  };

  events.push(newEvent);
  return newEvent;
};

export const upsertScore = ({
  studentId,
  judgeId,
  eventId,
  category,
  delivery,
  content,
  language,
  presentation,
}) => {
  const total = calculateWeightedTotal(
    {
      delivery,
      content,
      language,
      presentation,
    },
    category,
  );
  const existingIndex = scores.findIndex(
    (score) =>
      score.studentId === studentId &&
      score.eventId === eventId &&
      score.judgeId === judgeId,
  );

  const scorePayload = {
    id: existingIndex >= 0 ? scores[existingIndex].id : nextId("sc"),
    studentId,
    judgeId,
    eventId,
    category,
    delivery,
    content,
    language,
    presentation,
    total,
  };

  if (existingIndex >= 0) {
    scores[existingIndex] = scorePayload;
    return scorePayload;
  }

  scores.push(scorePayload);
  return scorePayload;
};

export const getLeaderboard = (eventId, category) => {
  const eventScores = scores.filter(
    (score) =>
      score.eventId === eventId && (!category || score.category === category),
  );

  const rows = eventScores
    .map((score) => {
      const student = students.find((entry) => entry.id === score.studentId);
      const school = schools.find((entry) => entry.id === student?.schoolId);

      if (!student || !school) {
        return null;
      }

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
    })
    .filter(Boolean)
    .sort((a, b) => b.avgScore - a.avgScore)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  return rows;
};

import {
  calculateWeightedTotal,
  DEFAULT_EVENT_CATEGORIES,
} from "./category-rules.js";

const nextId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export { calculateWeightedTotal };

export const users = [
  {
    id: "student-1",
    name: "D.M.Nadini Nihansa",
    email: "nadini@rcc.edu",
    password: "student1",
    role: "student",
    schoolId: "s1",
    approvalStatus: "approved",
  },
  {
    id: "school-1",
    name: "N.W.p/I/Omaragolla Maha Vidyalaya",
    email: "school@omv.edu",
    password: "Omv123",
    role: "school",
    schoolId: "s1",
    approvalStatus: "approved",
  },
  {
    id: "school-2",
    name: "N.W.p/I/Medamulla De Mel Navodya Vidyalaya",
    email: "school@demel.edu",
    password: "Demel123",
    role: "school",
    schoolId: "s2",
    approvalStatus: "approved",
  },
  {
    id: "school-3",
    name: "N.W.p/I/Gokarella National College",
    email: "school@gokarella.edu",
    password: "GCC123",
    role: "school",
    schoolId: "s3",
    approvalStatus: "approved",
  },
  {
    id: "school-4",
    name: "N.W.p/I/Ibbagamuwa Adarsha Maha Vidyalaya",
    email: "school@modelimv.edu",
    password: "Imv123",
    role: "school",
    schoolId: "s4",
    approvalStatus: "approved",
  },
  {
    id: "school-5",
    name: "N.W.p/I/Ibbagamuwa Central College",
    email: "school@icc.edu",
    password: "ICC123",
    role: "school",
    schoolId: "s5",
    approvalStatus: "approved",
  },
];

export const schools = [
  {
    id: "s1",
    name: "NWP/I/Omaragolla Maha Vidyalaya",
    shortName: "OMV",
    logo: "OMV",
    color: "#1e3a5f",
    approved: true,
    reviewStatus: "approved",
  },
  {
    id: "s2",
    name: "NWP/I/Medamulla De Mel Navodya Vidyalaya",
    shortName: "MDMV",
    logo: "MDMV",
    color: "#2d6a4f",
    approved: true,
    reviewStatus: "approved",
  },
  {
    id: "s3",
    name: "NWP/I/Gokarella Central College",
    shortName: "GCC",
    logo: "GCC",
    color: "#e07b39",
    approved: true,
    reviewStatus: "approved",
  },
  {
    id: "s4",
    name: "NWP/I/Ibbagamuwa Adarsha Maha Vidyalaya",
    shortName: "IMMV",
    logo: "IMMV",
    color: "#3a86a8",
    approved: true,
    reviewStatus: "approved",
  },
  {
    id: "s5",
    name: "NWP/I/Ibbagamuwa Central College",
    shortName: "ICC",
    logo: "ICC",
    color: "#8338ec",
    approved: true,
    reviewStatus: "approved",
  },
];

export const events = [
  {
    id: "e1",
    name: "English Day Competition 2025 -Monaragala",
    year: 2025,
    date: "2025-03-15",
    venue: "Ibbagamuwa Central College",
    status: "results_published",
    registrationDeadline: "2025-02-15",
    categories: [...DEFAULT_EVENT_CATEGORIES],
  },
  {
    id: "e2",
    name: "English Day 2025- Kurunegala",
    year: 2025,
    date: "2025-05-20",
    venue: "Kurunegala Maliyadeva College Auditorium",
    status: "results_published",
    registrationDeadline: "2025-04-20",
    categories: [...DEFAULT_EVENT_CATEGORIES],
  },
  {
    id: "e3",
    name: "English Day 2025 - North Western Province",
    year: 2025,
    date: "2025-06-10",
    venue: "Kurunegala City Hall",
    status: "results_published",
    registrationDeadline: "2025-05-15",
    categories: [...DEFAULT_EVENT_CATEGORIES],
  },
];

const eventOneSchoolOrder = ["s1", "s2", "s3", "s4", "s5"];

const eventOneCategoryGrades = {
  drama_primary: "Grade 4",
  drama_junior: "Grade 7",
  drama_senior: "Grade 11",
  oratory: "Grade 9",
  poetry_recitation: "Grade 5",
  storytelling: "Grade 6",
  essay_writing: "Grade 8",
  handwriting: "Grade 3",
  dictation: "Grade 2",
  debate: "Grade 10",
  literary_quiz: "Grade 12",
};

const eventOneStudentRosters = {
  s1: [
    { name: "A.L. Nethmi Perera" },
    { name: "K.M. Tharushi Wickramasinghe" },
    { name: "S.H. Dilakshi Fernando" },
    { name: "D.M. Kasun Madushanka" },
    { name: "P.W. Rashmi Senanayake" },
    { name: "R.A. Thilina Abeywardena" },
    { name: "N.D. Sanduni Kumari" },
    { name: "P.K. Anushka Bandara" },
    { name: "H.E. Ishalka Priyadarshani" },
    { name: "T.M. Pasindu Lakshan" },
    { name: "B.G. Sachini Wijerathna" },
  ],
  s2: [
    { name: "D.S. Hiruni Kumari" },
    { name: "K.A. Vidusha Lakmali" },
    { name: "M.R. Sachintha Perera" },
    { name: "N.W. Amandi Ranasinghe" },
    { name: "S.K. Chanuka Sandeepa" },
    { name: "P.R. Imasha Dilrukshi" },
    { name: "A.H. Dilini Madhubhashini" },
    { name: "E.P. Tharindu Jayasekara" },
    { name: "R.M. Sasini Nethmini" },
    { name: "L.K. Kaveesha Udayanga" },
    { name: "C.A. Hasara Weerasinghe" },
  ],
  s3: [
    { name: "M.S. Sanduni Hewage" },
    { name: "R.T. Hasithka Perera" },
    { name: "K.M. Dineth Sandaruwan" },
    { name: "S.P. Nuwandi Jayasinghe" },
    { name: "A.D. Shalani Kularathna" },
    { name: "T.N. Prabodha Wickramasinghe" },
    { name: "H.M. Chathuranga Bandara" },
    { name: "S.C. Dilhara Wijesuriya" },
    { name: "P.K. Nimesha Prasadani" },
    { name: "E.R. Tharuka Jayawardena" },
    { name: "D.H. Sasindu Ranaweera" },
  ],
  s4: [
    { name: "N.P. Yashodara Perera" },
    { name: "R.A. Sanuli Fernando" },
    { name: "K.L. Vishwa Madushan" },
    { name: "S.M. Kavindi Lakshani" },
    { name: "P.D. Janith De Silva" },
    { name: "H.A. Supun Abeysekara" },
    { name: "M.N. Tharushi Dilmi" },
    { name: "A.P. Lakmali Pathirana" },
    { name: "D.R. Nishadi Madushani" },
    { name: "T.K. Randika Weeraratne" },
    { name: "S.H. Sameera Karunaratne" },
  ],
  s5: [
    { name: "R.P. Anjali Peris" },
    { name: "K.S. Pramuditha Silva" },
    { name: "M.T. Hansi Weerakoon" },
    { name: "D.K. Nawodi Rajapaksha" },
    { name: "A.R. Isuru Chathuranga" },
    { name: "P.M. Sachini Manjula" },
    { name: "H.S. Dulanjana Perera" },
    { name: "C.N. Malith Bandara" },
    { name: "E.K. Shani Sandaruwan" },
    { name: "N.A. Vihanga Mendis" },
    { name: "L.R. Shalinka Jayathilaka" },
  ],
};

const buildEventOneStudents = () =>
  eventOneSchoolOrder.flatMap((schoolId) =>
    DEFAULT_EVENT_CATEGORIES.map((category, categoryIndex) => ({
      id: `e1-${schoolId}-${category}`,
      name: eventOneStudentRosters[schoolId][categoryIndex].name,
      schoolId,
      category,
      eventId: "e2",
      grade: eventOneCategoryGrades[category],
    })),
  );

const makeScore = (studentId, eventId, category, d, c, l, p) => ({
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

export const students = [
  {
    id: "st9",
    name: "D.M.Sameera Kumara",
    schoolId: "s2",
    category: "essay_writing",
    eventId: "e1",
    grade: "Grade 6",
  },
  {
    id: "st10",
    name: "K.A.Farhan Azizan",
    schoolId: "s2",
    category: "essay_writing",
    eventId: "e1",
    grade: "Grade 7",
  },
  {
    id: "st11",
    name: "S.A.Shashika Perera",
    schoolId: "s2",
    category: "essay_writing",
    eventId: "e1",
    grade: "Grade 8",
  },
  {
    id: "st12",
    name: "R.M.Dilini Perera",
    schoolId: "s2",
    category: "essay_writing",
    eventId: "e2",
    grade: "Grade 9",
  },
  ...buildEventOneStudents(),
];

const eventOneStudents = students.filter((entry) => entry.id.startsWith("e1-"));

export const scores = [
  makeScore("st9", "e1", "oratory", 88, 85, 90, 92),
  makeScore("st10", "e1", "debate", 84, 88, 82, 86),
  makeScore("st11", "e1", "drama_senior", 91, 87, 85, 90),
  makeScore("st12", "e2", "literary_quiz", 95, 90, 88, 85),
  ...eventOneStudents.map((student) => {
    const schoolIndex = eventOneSchoolOrder.indexOf(student.schoolId);
    const categoryIndex = DEFAULT_EVENT_CATEGORIES.indexOf(student.category);
    const baseScore = 72 + categoryIndex + schoolIndex * 2;

    return makeScore(
      student.id,
      student.eventId,
      student.category,
      baseScore + 3,
      baseScore + 1,
      baseScore,
      baseScore + 2,
    );
  }),
];

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

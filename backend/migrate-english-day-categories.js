import "dotenv/config";
import mongoose from "mongoose";
import {
  calculateWeightedTotal,
  DEFAULT_EVENT_CATEGORIES,
  parseGradeLevel,
} from "./category-rules.js";
import { connectDatabase } from "./database.js";
import { EventModel, ScoreModel, StudentModel, UserModel } from "./models.js";

const LEGACY_FULL_EVENT_CATEGORIES = [
  "oratory",
  "drama",
  "spelling_bee",
  "debate",
];
const DRAMA_CATEGORY_REPLACEMENTS = [
  "drama_primary",
  "drama_junior",
  "drama_senior",
];
const SPELLING_CATEGORY_REPLACEMENTS = ["dictation", "literary_quiz"];
const EXECUTE = process.argv.includes("--execute");

function arraysMatchAsSet(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  const leftSorted = [...left].sort();
  const rightSorted = [...right].sort();
  return leftSorted.every((value, index) => value === rightSorted[index]);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getDramaCategoryForGrade(grade) {
  const gradeLevel = parseGradeLevel(grade);
  if (gradeLevel === null) {
    return "drama_junior";
  }

  if (gradeLevel <= 5) {
    return "drama_primary";
  }

  if (gradeLevel <= 9) {
    return "drama_junior";
  }

  return "drama_senior";
}

function getSpellingReplacementForGrade(grade) {
  const gradeLevel = parseGradeLevel(grade);
  if (gradeLevel === null) {
    return "dictation";
  }

  return gradeLevel <= 8 ? "dictation" : "literary_quiz";
}

function migrateLegacyStudentCategory(category, grade) {
  if (category === "drama") {
    return getDramaCategoryForGrade(grade);
  }

  if (category === "spelling_bee") {
    return getSpellingReplacementForGrade(grade);
  }

  return category;
}

function migrateLegacyJudgeCategory(category) {
  if (!category || category === "all") {
    return category;
  }

  if (category === "drama" || category === "spelling_bee") {
    return "all";
  }

  return category;
}

function migrateEventCategories(categories) {
  const existing = Array.isArray(categories) ? categories : [];
  if (arraysMatchAsSet(existing, LEGACY_FULL_EVENT_CATEGORIES)) {
    return [...DEFAULT_EVENT_CATEGORIES];
  }

  const migrated = [];

  for (const category of existing) {
    if (category === "drama") {
      migrated.push(...DRAMA_CATEGORY_REPLACEMENTS);
      continue;
    }

    if (category === "spelling_bee") {
      migrated.push(...SPELLING_CATEGORY_REPLACEMENTS);
      continue;
    }

    migrated.push(category);
  }

  return unique(migrated);
}

function sameArray(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function logSummary(summary) {
  console.log("English Day category migration summary");
  console.log(`Mode: ${EXECUTE ? "execute" : "dry-run"}`);
  console.log(`Events updated: ${summary.events}`);
  console.log(`Students updated: ${summary.students}`);
  console.log(`Scores updated: ${summary.scores}`);
  console.log(`Judge accounts updated: ${summary.judges}`);
  console.log(`Legacy drama judges moved to all: ${summary.dramaJudgesToAll}`);
  console.log(
    `Legacy spelling judges moved to all: ${summary.spellingJudgesToAll}`,
  );
}

async function run() {
  await connectDatabase();

  const [events, students, scores, users] = await Promise.all([
    EventModel.find().select("id categories -_id").lean(),
    StudentModel.find().select("id category grade -_id").lean(),
    ScoreModel.find()
      .select(
        "id studentId category delivery content language presentation total -_id",
      )
      .lean(),
    UserModel.find({ role: "judge" }).select("id judgeCategory -_id").lean(),
  ]);

  const studentCategoryById = new Map();
  const eventOperations = [];
  const studentOperations = [];
  const scoreOperations = [];
  const judgeOperations = [];
  const summary = {
    events: 0,
    students: 0,
    scores: 0,
    judges: 0,
    dramaJudgesToAll: 0,
    spellingJudgesToAll: 0,
  };

  for (const student of students) {
    const nextCategory = migrateLegacyStudentCategory(
      student.category,
      student.grade,
    );
    studentCategoryById.set(student.id, nextCategory);

    if (nextCategory !== student.category) {
      summary.students += 1;
      studentOperations.push({
        updateOne: {
          filter: { id: student.id },
          update: { $set: { category: nextCategory } },
        },
      });
    }
  }

  for (const event of events) {
    const nextCategories = migrateEventCategories(event.categories || []);
    if (!sameArray(nextCategories, event.categories || [])) {
      summary.events += 1;
      eventOperations.push({
        updateOne: {
          filter: { id: event.id },
          update: { $set: { categories: nextCategories } },
        },
      });
    }
  }

  for (const score of scores) {
    const nextCategory =
      studentCategoryById.get(score.studentId) ||
      migrateLegacyStudentCategory(score.category, undefined);
    const nextTotal = calculateWeightedTotal(
      {
        delivery: Number(score.delivery),
        content: Number(score.content),
        language: Number(score.language),
        presentation: Number(score.presentation),
      },
      nextCategory,
    );

    if (nextCategory !== score.category || nextTotal !== score.total) {
      summary.scores += 1;
      scoreOperations.push({
        updateOne: {
          filter: { id: score.id },
          update: {
            $set: {
              category: nextCategory,
              total: nextTotal,
            },
          },
        },
      });
    }
  }

  for (const judge of users) {
    const nextJudgeCategory = migrateLegacyJudgeCategory(judge.judgeCategory);
    if (nextJudgeCategory !== judge.judgeCategory) {
      summary.judges += 1;
      if (judge.judgeCategory === "drama") {
        summary.dramaJudgesToAll += 1;
      }
      if (judge.judgeCategory === "spelling_bee") {
        summary.spellingJudgesToAll += 1;
      }
      judgeOperations.push({
        updateOne: {
          filter: { id: judge.id },
          update: { $set: { judgeCategory: nextJudgeCategory } },
        },
      });
    }
  }

  logSummary(summary);

  if (!EXECUTE) {
    console.log("Dry run only. Re-run with --execute to apply changes.");
    return;
  }

  if (eventOperations.length > 0) {
    await EventModel.bulkWrite(eventOperations);
  }
  if (studentOperations.length > 0) {
    await StudentModel.bulkWrite(studentOperations);
  }
  if (scoreOperations.length > 0) {
    await ScoreModel.bulkWrite(scoreOperations);
  }
  if (judgeOperations.length > 0) {
    await UserModel.bulkWrite(judgeOperations);
  }

  console.log("Migration applied successfully.");
}

run()
  .catch((error) => {
    console.error("Migration failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });

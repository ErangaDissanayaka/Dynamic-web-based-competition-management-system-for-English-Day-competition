import { events, schools, scores, students, users } from "./data.js";
import {
  EventModel,
  SchoolModel,
  ScoreModel,
  StudentModel,
  UserModel,
} from "./models.js";

async function ensureSeedDocuments(model, docs, name) {
  const operations = docs.map((doc) => ({
    updateOne: {
      filter: { id: doc.id },
      update: { $setOnInsert: doc },
      upsert: true,
    },
  }));

  const result = await model.bulkWrite(operations, { ordered: false });
  if (result.upsertedCount > 0) {
    // eslint-disable-next-line no-console
    console.log(`Seeded ${name}: ${result.upsertedCount} documents added`);
  }
}

export async function seedDatabase() {
  await ensureSeedDocuments(UserModel, users, "users");
  await ensureSeedDocuments(SchoolModel, schools, "schools");
  await ensureSeedDocuments(EventModel, events, "events");
  await ensureSeedDocuments(StudentModel, students, "students");
  await ensureSeedDocuments(ScoreModel, scores, "scores");
}

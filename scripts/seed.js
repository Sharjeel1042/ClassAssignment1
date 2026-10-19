// Seeds the demo program and course data
import { client, db, connect, ensureIndexes } from "../src/shared/db.js";

await connect();
await ensureIndexes();

await db.collection("programs").replaceOne(
  { _id: "CS" },
  { _id: "CS", name: "BS Computer Science", min_gpa: 3.0 },
  { upsert: true }
);

// Only 2 seats, so you can demo a full course and race conditions
await db.collection("courses").replaceOne(
  { _id: "CS101" },
  { _id: "CS101", program_id: "CS", name: "Intro to Programming", seats_available: 2 },
  { upsert: true }
);

console.log("Seed complete");
await client.close();
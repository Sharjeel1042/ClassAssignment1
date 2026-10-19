// API tests: admissions, enrollment, duplicate prevention, seat limit
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { client, db, connect, ensureIndexes } from "../src/shared/db.js";
import { MONGO_DB } from "../src/shared/config.js";

if (!MONGO_DB.endsWith("_test")) {
  throw new Error(
    `Tests must use a database ending in _test (got "${MONGO_DB}"). ` +
    `Set MONGO_DB=admissions_test before running npm test.`
  );
}

const app = createApp();

async function resetData() {
  await db.collection("applicants").deleteMany({});
  await db.collection("applications").deleteMany({});
  await db.collection("enrollments").deleteMany({});
  await db.collection("programs").replaceOne(
    { _id: "CS" }, { _id: "CS", name: "BS Computer Science", min_gpa: 3.0 }, { upsert: true }
  );
  await db.collection("courses").replaceOne(
    { _id: "CS101" },
    { _id: "CS101", program_id: "CS", name: "Intro to Programming", seats_available: 2 },
    { upsert: true }
  );
}

async function submit(email, gpa = 3.5) {
  const res = await request(app).post("/applications").send({
    name: "Test Student", email, program_id: "CS", gpa,
  });
  expect(res.status).toBe(201);
  return res.body._id;
}

async function admit(id) {
  const res = await request(app).patch(`/applications/${id}/decision`).send({ decision: "ADMITTED" });
  expect(res.status).toBe(200);
}

const enrollBody = (id) => ({ application_id: id, course_id: "CS101" });

beforeAll(async () => {
  await connect();
  await ensureIndexes();
});

afterAll(async () => {
  await client.close();
});

beforeEach(resetData);

describe("admissions", () => {
  it("rejects an invalid GPA with 422", async () => {
    const res = await request(app).post("/applications").send({
      name: "X Y", email: "a@x.com", program_id: "CS", gpa: 5,
    });
    expect(res.status).toBe(422);
  });

  it("returns 409 for a duplicate application", async () => {
    await submit("dup@x.com");
    const res = await request(app).post("/applications").send({
      name: "Dup", email: "dup@x.com", program_id: "CS", gpa: 3.5,
    });
    expect(res.status).toBe(409);
  });

  it("returns 404 for an unknown application", async () => {
    const res = await request(app).get("/applications/does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("enrollment", () => {
  it("rejects a student who has not been admitted", async () => {
    const id = await submit("pending@x.com");
    const res = await request(app).post("/enrollments").send(enrollBody(id));
    expect(res.status).toBe(422);
  });

  it("blocks duplicate enrollment without consuming a second seat", async () => {
    const id = await submit("dupe@x.com");
    await admit(id);

    const first = await request(app).post("/enrollments").send(enrollBody(id));
    expect(first.status).toBe(201);

    const second = await request(app).post("/enrollments").send(enrollBody(id));
    expect(second.status).toBe(409);

    const course = await db.collection("courses").findOne({ _id: "CS101" });
    expect(course.seats_available).toBe(1);
  });

  it("handles two simultaneous enrollments of the same student", async () => {
    const id = await submit("race@x.com");
    await admit(id);

    const [a, b] = await Promise.all([
      request(app).post("/enrollments").send(enrollBody(id)),
      request(app).post("/enrollments").send(enrollBody(id)),
    ]);
    expect([a.status, b.status].sort()).toEqual([201, 409]);
  });

  it("enforces the seat limit", async () => {
    const ids = [];
    for (const email of ["s1@x.com", "s2@x.com", "s3@x.com"]) {
      const id = await submit(email);
      await admit(id);
      ids.push(id);
    }
    const statuses = [];
    for (const id of ids) {
      const res = await request(app).post("/enrollments").send(enrollBody(id));
      statuses.push(res.status);
    }
    expect(statuses.filter((s) => s === 201)).toHaveLength(2);
    expect(statuses.filter((s) => s === 409)).toHaveLength(1);
  });
});
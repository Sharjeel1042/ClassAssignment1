// Course allocation: seat reservation with timeout and outage simulation
import { db } from "../shared/db.js";
import * as config from "../shared/config.js";
import { AppError } from "../shared/errors.js";

// Takes one seat, or fails if none are left
async function reserve(courseId, session) {
  if (config.ALLOCATION_FAIL) {
    throw new AppError(503, "Course allocation service is unavailable");
  }
  // Atomic check-and-decrement: matches only if a seat is still free
  const course = await db.collection("courses").findOneAndUpdate(
    { _id: courseId, seats_available: { $gt: 0 } },
    { $inc: { seats_available: -1 } },
    { session, returnDocument: "after" }
  );
  if (!course) throw new AppError(409, "No seats left in this course");
}

// Adds a time limit to the reservation
export async function reserveSeat(courseId, session) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new AppError(503, "Course allocation timed out. Please retry.")),
      config.ALLOCATION_TIMEOUT_MS
    );
  });
  const attempt = reserve(courseId, session);
  // If the timeout wins, a late failure of the attempt must not crash the process
  attempt.catch(() => {});
  try {
    await Promise.race([attempt, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
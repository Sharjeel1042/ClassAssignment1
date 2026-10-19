// Enrollment business logic with a transaction
import { randomUUID } from "node:crypto";
import { client, db } from "../shared/db.js";
import { AppError } from "../shared/errors.js";
import { reserveSeat } from "../allocation/service.js";

export async function enroll(applicationId, courseId) {
  const session = client.startSession();
  try {
    let enrollment;
    await session.withTransaction(async () => {
      const app = await db.collection("applications").findOne({ _id: applicationId }, { session });
      if (!app) throw new AppError(404, "Application not found");
      if (app.status !== "ADMITTED") {
        throw new AppError(422, "Only admitted applicants can be enrolled");
      }

      const course = await db.collection("courses").findOne({ _id: courseId }, { session });
      if (!course) throw new AppError(404, "Course not found");
      if (course.program_id !== app.program_id) {
        throw new AppError(422, "Course does not belong to the applicant's program");
      }

      await reserveSeat(courseId, session);

      enrollment = {
        _id: randomUUID(),
        student_id: app.applicant_id,
        course_id: courseId,
        enrolled_at: new Date(),
      };
      await db.collection("enrollments").insertOne(enrollment, { session });
    });
    return enrollment;
  } catch (err) {
    if (err.code === 11000) {
     
      throw new AppError(409, "Student is already enrolled in this course");
    }
    throw err;
  } finally {
    await session.endSession();
  }
}
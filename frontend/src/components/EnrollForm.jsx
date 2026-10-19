import { useState } from "react";
import { api } from "../api.js";
import Message from "./Message.jsx";

export default function EnrollForm({ applicationId, setApplicationId }) {
  const [courseId, setCourseId] = useState("CS101");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enrollment, setEnrollment] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setEnrollment(null);
    try {
      setEnrollment(await api.enroll(applicationId.trim(), courseId.trim()));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>3. Enroll in a course</h2>
      <p className="hint">Only admitted applicants can enroll. Seats are limited.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Application ID
          <input value={applicationId} onChange={(e) => setApplicationId(e.target.value)} required />
        </label>
        <label>
          Course ID
          <input value={courseId} onChange={(e) => setCourseId(e.target.value)} required />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Enrolling…" : "Enroll"}
        </button>
      </form>

      <Message type="error" text={error} />
      {enrollment && (
        <Message
          type="success"
          text={`Enrolled in ${enrollment.course_id} on ${new Date(enrollment.enrolled_at).toLocaleString()}.`}
        />
      )}
    </section>
  );
}

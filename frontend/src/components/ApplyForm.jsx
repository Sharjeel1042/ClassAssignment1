import { useState } from "react";
import { api } from "../api.js";
import Message from "./Message.jsx";

const emptyForm = { name: "", email: "", program_id: "CS", gpa: "" };

export default function ApplyForm({ onSubmitted }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  // One change handler for every input, using the input's name attribute
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser from reloading the page
    setLoading(true);
    setError("");
    setCreated(null);
    try {
      // GPA comes from the input as text; the backend expects a number
      const application = await api.submitApplication({ ...form, gpa: Number(form.gpa) });
      setCreated(application);
      setForm(emptyForm);
      onSubmitted(application._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>1. Apply</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Full name
          <input name="name" value={form.name} onChange={handleChange} required minLength={2} />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Program ID
          <input name="program_id" value={form.program_id} onChange={handleChange} required />
        </label>
        <label>
          GPA (0 – 4)
          <input
            name="gpa"
            type="number"
            step="0.01"
            min="0"
            max="4"
            value={form.gpa}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Submit application"}
        </button>
      </form>

      <Message type="error" text={error} />
      {created && (
        <div className="message success">
          Application submitted. Your application ID is:
          <code className="id">{created._id}</code>
          Keep it to track your application.
        </div>
      )}
    </section>
  );
}

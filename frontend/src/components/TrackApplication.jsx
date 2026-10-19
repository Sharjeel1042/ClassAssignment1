import { useState } from "react";
import { api } from "../api.js";
import Message from "./Message.jsx";

export default function TrackApplication({ applicationId, setApplicationId }) {
  const [application, setApplication] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Runs any API call with the same loading / error handling
  async function run(action) {
    setLoading(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function lookUp(e) {
    e.preventDefault();
    setApplication(null);
    setEligibility(null);
    run(async () => setApplication(await api.getApplication(applicationId.trim())));
  }

  function checkEligibility() {
    run(async () => setEligibility(await api.checkEligibility(application._id)));
  }

  function decide(decision) {
    run(async () => setApplication(await api.decide(application._id, decision)));
  }

  return (
    <section className="card">
      <h2>2. Track application</h2>
      <form onSubmit={lookUp} className="row">
        <input
          placeholder="Application ID"
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>Look up</button>
      </form>

      <Message type="error" text={error} />

      {application && (
        <>
          <dl className="details">
            <dt>Status</dt>
            <dd><span className={`badge ${application.status}`}>{application.status}</span></dd>
            <dt>Program</dt>
            <dd>{application.program_id}</dd>
            <dt>GPA</dt>
            <dd>{application.gpa}</dd>
            <dt>Submitted</dt>
            <dd>{new Date(application.submittedAt).toLocaleString()}</dd>
            {application.decided_at && (
              <>
                <dt>Decided</dt>
                <dd>{new Date(application.decided_at).toLocaleString()}</dd>
              </>
            )}
          </dl>

          <button className="secondary" onClick={checkEligibility} disabled={loading}>
            Check eligibility
          </button>
          {eligibility && (
            <Message
              type={eligibility.eligible ? "success" : "error"}
              text={eligibility.eligible ? "Eligible for admission." : eligibility.reason}
            />
          )}

          {/* A decision can only be made once, while the application is still SUBMITTED */}
          {application.status === "SUBMITTED" && (
            <div className="admin">
              <h3>Admin decision</h3>
              <div className="row">
                <button onClick={() => decide("ADMITTED")} disabled={loading}>Admit</button>
                <button className="danger" onClick={() => decide("REJECTED")} disabled={loading}>
                  Reject
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

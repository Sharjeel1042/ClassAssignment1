import { useState } from "react";
import ApplyForm from "./components/ApplyForm.jsx";
import TrackApplication from "./components/TrackApplication.jsx";
import EnrollForm from "./components/EnrollForm.jsx";

export default function App() {
  // Shared between the cards: after applying, the new ID is filled in everywhere
  const [applicationId, setApplicationId] = useState("");

  return (
    <div className="page">
      <header>
        <h1>University Admissions</h1>
        <p className="subtitle">Apply, track your application, and enroll in courses.</p>
      </header>

      <main className="grid">
        <ApplyForm onSubmitted={setApplicationId} />
        <TrackApplication applicationId={applicationId} setApplicationId={setApplicationId} />
        <EnrollForm applicationId={applicationId} setApplicationId={setApplicationId} />
      </main>
    </div>
  );
}

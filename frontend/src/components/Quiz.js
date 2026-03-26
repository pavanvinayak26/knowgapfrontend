import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuizService from "../services/quiz.service";

const Quiz = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [practiceSet, setPracticeSet] = useState(null);
  const [loadingPractice, setLoadingPractice] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    QuizService.getQuestionsForTopic(topicId).then(
      (response) => {
        setQuestions(response.data || []);
        setLoading(false);
      },
      (err) => {
        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }
        setError("Failed to load quiz. Please try again.");
        setLoading(false);
      }
    );
  }, [topicId, navigate]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const handleOptionChange = (questionId, optionKey) => {
    setError("");
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const loadWeakPractice = async () => {
    setLoadingPractice(true);
    try {
      const response = await QuizService.getWeakPractice(8);
      setPracticeSet(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError("Could not load weak-topic practice set right now.");
    } finally {
      setLoadingPractice(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    QuizService.submitAttempt(parseInt(topicId, 10), answers).then(
      async (response) => {
        setResult(response.data);
        setSubmitting(false);
        await loadWeakPractice();
      },
      (err) => {
        setSubmitting(false);
        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }
        const msg = err.response?.data || "Failed to submit quiz. Please try again.";
        setError(typeof msg === "string" ? msg : "Failed to submit quiz. Please try again.");
      }
    );
  };

  if (loading && !result) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }} className="fade-in">
        <div
          className="spinner"
          style={{
            border: "4px solid rgba(255,255,255,0.1)",
            borderTop: "4px solid var(--primary)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite",
            margin: "0 auto 1.5rem"
          }}
        />
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Assembling your knowledge assessment...</p>
      </div>
    );
  }

  if (result) {
    const wrongAnswers = (result.questionReviews || []).filter((review) => !review.correct);

    return (
      <div style={{ padding: "3rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }} className="fade-in">
        <div className="glass-container" style={{ marginBottom: "1.5rem" }}>
          <h2 className="title" style={{ textAlign: "left", marginBottom: "1rem" }}>Assessment Analysis</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            <div className="admin-card" style={{ textAlign: "center" }}>
              <p style={{ color: "var(--text-dim)", marginBottom: "0.2rem", fontSize: "0.9rem" }}>Score</p>
              <h3 style={{ margin: 0 }}>{result.score} / {result.totalQuestions}</h3>
            </div>
            <div className="admin-card" style={{ textAlign: "center" }}>
              <p style={{ color: "var(--text-dim)", marginBottom: "0.2rem", fontSize: "0.9rem" }}>Accuracy</p>
              <h3 style={{ margin: 0 }}>{result.accuracy}%</h3>
            </div>
            <div className="admin-card" style={{ textAlign: "center" }}>
              <p style={{ color: "var(--text-dim)", marginBottom: "0.2rem", fontSize: "0.9rem" }}>Grade</p>
              <h3 style={{ margin: 0 }}>{result.grade}</h3>
            </div>
            <div className="admin-card" style={{ textAlign: "center" }}>
              <p style={{ color: "var(--text-dim)", marginBottom: "0.2rem", fontSize: "0.9rem" }}>Incorrect</p>
              <h3 style={{ margin: 0 }}>{wrongAnswers.length}</h3>
            </div>
          </div>
        </div>

        <div className="quiz-result-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
          <div className="glass-container">
            <h3 style={{ marginBottom: "1rem" }}>Question-by-Question Review</h3>
            {(result.questionReviews || []).length === 0 ? (
              <p style={{ color: "var(--text-dim)" }}>No review data available for this attempt.</p>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {(result.questionReviews || []).map((review, index) => {
                  const highlightColor = review.correct ? "var(--success)" : "var(--error)";
                  return (
                    <div key={review.questionId} className="admin-card" style={{ borderColor: `${highlightColor}55` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.75rem" }}>
                        <h4 style={{ margin: 0, fontSize: "1rem" }}>Q{index + 1}. {review.questionText}</h4>
                        <span style={{ color: highlightColor, fontWeight: "700", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                          {review.correct ? "Correct" : "Incorrect"}
                        </span>
                      </div>
                      <p style={{ margin: "0.2rem 0", color: "var(--text-secondary)", fontSize: "0.92rem" }}>
                        Your answer: <strong style={{ color: review.correct ? "var(--success)" : "var(--error)" }}>{review.yourAnswer || "Not attempted"}</strong> - {review.yourAnswerText}
                      </p>
                      {!review.correct ? (
                        <p style={{ margin: "0.2rem 0", color: "#c7d2fe", fontSize: "0.92rem" }}>
                          Correct answer: <strong>{review.correctAnswer}</strong> - {review.correctAnswerText}
                        </p>
                      ) : null}
                      <p style={{ margin: "0.65rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                        AI Explanation: {review.aiExplanation}
                      </p>
                      <p style={{ margin: "0.35rem 0 0 0", color: "#9ae6b4", fontSize: "0.86rem" }}>
                        Action: {review.studyAction}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="glass-container">
              <h3 style={{ marginBottom: "1rem" }}>Weak Topics</h3>
              {(result.weakTopics || []).length === 0 ? (
                <p style={{ color: "var(--text-dim)" }}>No major weak topics detected.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {(result.weakTopics || []).map((topic) => (
                    <div key={topic.topicId} className="admin-card" style={{ padding: "1rem" }}>
                      <p style={{ margin: 0, fontWeight: "600" }}>{topic.topicName}</p>
                      <p style={{ margin: "0.2rem 0", color: "var(--error)", fontSize: "0.88rem" }}>
                        {topic.wrong} wrong / {topic.attempted} attempted ({topic.accuracy}% accuracy)
                      </p>
                      <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.82rem" }}>{topic.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-container">
              <h3 style={{ marginBottom: "1rem" }}>Next Steps</h3>
              {(result.nextSteps || []).map((step, idx) => (
                <p key={idx} style={{ marginBottom: "0.6rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  {idx + 1}. {step}
                </p>
              ))}
              <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
                <button className="btn-primary" onClick={() => navigate("/dashboard")}>View Progress Dashboard</button>
                <button
                  className="btn-primary"
                  onClick={() => navigate("/subjects")}
                  style={{ background: "transparent", border: "1px solid var(--glass-border)", boxShadow: "none" }}
                >
                  Practice Another Topic
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-container" style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
            <h3 style={{ margin: 0 }}>Weak Topic Practice Booster</h3>
            <button className="btn-primary" style={{ width: "auto", padding: "0.6rem 1rem" }} onClick={loadWeakPractice} disabled={loadingPractice}>
              {loadingPractice ? "Refreshing..." : "Refresh Practice Set"}
            </button>
          </div>

          <p style={{ color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "0.9rem" }}>
            {practiceSet?.focusReason || "Generate a focused practice set from your weakest topics."}
          </p>

          {!practiceSet || (practiceSet.questions || []).length === 0 ? (
            <p style={{ color: "var(--text-dim)" }}>No practice set available yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "0.9rem" }}>
              {(practiceSet.questions || []).map((q, idx) => (
                <div key={q.questionId} className="admin-card" style={{ padding: "1rem" }}>
                  <p style={{ margin: 0, fontWeight: "600", marginBottom: "0.35rem" }}>{idx + 1}. {q.questionText}</p>
                  <p style={{ margin: 0, fontSize: "0.83rem", color: "#c7d2fe" }}>Topic: {q.topicName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "4rem 2rem", maxWidth: "900px", margin: "0 auto" }} className="fade-in">
      <div className="glass-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "0.8rem" }}>
          <h2 className="title" style={{ margin: 0, textAlign: "left" }}>Knowledge Assessment</h2>
          <div style={{ background: "rgba(99, 102, 241, 0.1)", padding: "0.5rem 0.9rem", borderRadius: "100px", border: "1px solid var(--primary)", fontSize: "0.8rem", color: "var(--primary)", fontWeight: "600" }}>
            {answeredCount}/{questions.length} ANSWERED
          </div>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        {questions.length === 0 ? (
          <div className="admin-card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--text-dim)", margin: 0 }}>No questions available for this topic.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {questions.map((q, index) => (
                <div key={q.id} className="admin-card" style={{ padding: "1.4rem" }}>
                  <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1rem" }}>
                    <span style={{ color: "var(--primary)", fontWeight: "800", fontSize: "1.1rem" }}>{index + 1}.</span>
                    <h4 style={{ margin: 0, fontSize: "1.02rem", lineHeight: "1.45" }}>{q.text}</h4>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                    {["A", "B", "C", "D"].map((opt) => {
                      const optText = q[`option${opt}`];
                      if (!optText) return null;

                      const isSelected = answers[q.id] === opt;
                      return (
                        <label
                          key={opt}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            cursor: "pointer",
                            padding: "0.85rem",
                            background: isSelected ? "rgba(99, 102, 241, 0.15)" : "rgba(0,0,0,0.2)",
                            borderRadius: "10px",
                            border: "1px solid",
                            borderColor: isSelected ? "var(--primary)" : "var(--glass-border)",
                            transition: "var(--transition)"
                          }}
                        >
                          <input
                            type="radio"
                            name={`question_${q.id}`}
                            value={opt}
                            checked={isSelected}
                            onChange={() => handleOptionChange(q.id, opt)}
                            required
                            style={{ accentColor: "var(--primary)", width: "16px", height: "16px" }}
                          />
                          <span style={{ fontSize: "0.9rem" }}>
                            <strong style={{ color: isSelected ? "var(--primary)" : "var(--text-dim)", marginRight: "6px" }}>{opt}</strong>
                            {optText}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "center" }}>
              <button type="submit" className="btn-primary" disabled={submitting} style={{ width: "auto", padding: "1rem 3rem", borderRadius: "100px" }}>
                {submitting ? "Submitting..." : "Submit Assessment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Quiz;

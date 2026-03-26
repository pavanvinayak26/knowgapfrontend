import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    // We can fetch public content here if available
    fetch('http://localhost:8086/api/home')
      .then(res => res.text())
      .then(data => setContent(data))
      .catch(err => console.error("Error fetching API:", err));
  }, []);

  return (
    <div className="auth-wrapper fade-in" style={{ flexDirection: 'column', textAlign: 'center' }}>
      <h1 className="hero-title">
        KnowGap
      </h1>
      <p className="hero-subtitle">
        An intelligent knowledge gap detection system designed to identify and analyze your learning progress through targeted quizzes.
      </p>

      {content && (
        <div className="glass-container" style={{ padding: '1rem 2.5rem', marginBottom: '3.5rem', borderRadius: '100px' }}>
          <p style={{ margin: 0, fontWeight: '600', color: 'var(--success)', letterSpacing: '0.05em' }}>
            <span style={{ opacity: 0.7 }}>STATUS:</span> {content}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <Link to="/register" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ width: 'auto', padding: '1.1rem 3rem', fontSize: '1.1rem' }}>
            Get Started Free
          </button>
        </Link>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ 
            width: 'auto', 
            padding: '1.1rem 3rem', 
            fontSize: '1.1rem',
            background: 'transparent', 
            border: '2px solid var(--primary)',
            boxShadow: 'none'
          }}>
            Login
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;

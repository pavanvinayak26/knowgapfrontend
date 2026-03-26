import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthService from "../services/auth.service";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    AuthService.login(username, password).then(
      () => {
        navigate("/dashboard");
        // We reload to reset the global App.js navbar state properly
        window.location.reload();
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setLoading(false);
        setMessage(resMessage);
      }
    );
  };

  return (
    <div className="auth-wrapper fade-in">
      <div className="glass-container auth-inner">
        <h2 className="title">Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              className="form-control"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? <span>Logging in... </span> : <span>Login</span>}
          </button>
        </form>

        {message && (
          <div className="form-group">
            <div className="alert alert-danger">
              {message}
            </div>
          </div>
        )}
        
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
           <span style={{color: "var(--text-secondary)"}}>Don't have an account? </span>
           <Link to="/register" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: '600' }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

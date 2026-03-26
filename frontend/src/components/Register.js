import React, { useState } from "react";
import AuthService from "../services/auth.service";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successful, setSuccessful] = useState(false);
  const [message, setMessage] = useState("");
  
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage("");
    setSuccessful(false);

    AuthService.register(username, email, password).then(
      (response) => {
        setMessage(response.data.message);
        setSuccessful(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setMessage(resMessage);
        setSuccessful(false);
      }
    );
  };

  return (
    <div className="auth-wrapper fade-in">
      <div className="glass-container auth-inner">
        <h2 className="title">Join KnowGap</h2>
        <form onSubmit={handleRegister}>
          <div className="form-group">
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

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
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

          <button className="btn-primary" type="submit" style={{ width: "100%" }}>
            Sign Up
          </button>
        </form>

        {message && (
          <div className="form-group">
            <div className={ successful ? "alert alert-success" : "alert alert-danger" }>
              {message}
            </div>
          </div>
        )}
        
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
           <span style={{color: "var(--text-secondary)"}}>Already have an account? </span>
           <Link to="/login" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: '600' }}>Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

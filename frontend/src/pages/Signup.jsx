// src/pages/Signup.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email address.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (!form.confirm) errs.confirm = "Please confirm your password.";
    else if (form.password !== form.confirm) errs.confirm = "Passwords do not match.";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      await signup(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.code === "auth/email-already-in-use"
          ? "This email is already registered."
          : err.code === "auth/weak-password"
          ? "Password is too weak."
          : "Sign up failed. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">✦</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join us today — it's free.</p>
        </div>

        {serverError && <div className="error-banner">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className={`field-group ${errors.email ? "has-error" : ""}`}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className={`field-group ${errors.password ? "has-error" : ""}`}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className={`field-group ${errors.confirm ? "has-error" : ""}`}>
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={handleChange}
            />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>

      <div className="auth-backdrop" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
    </div>
  );
};

export default Signup;

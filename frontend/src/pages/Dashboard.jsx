// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";
import { auth } from '../firebase';

// const STATS = [
//   { label: "Sessions", value: "24", delta: "+12%", icon: "◈" },
//   { label: "Projects", value: "7", delta: "+3", icon: "◉" },
//   { label: "API Calls", value: "1,284", delta: "+8.4%", icon: "◎" },
//   { label: "Uptime", value: "99.9%", delta: "Stable", icon: "◌" },
// ];

// const ACTIVITY = [
//   { time: "2 min ago", action: "Logged in from Chrome · Chennai" },
//   { time: "1 hr ago", action: "Password changed successfully" },
//   { time: "Yesterday", action: "New project created: Alpha" },
//   { time: "2 days ago", action: "API key regenerated" },
//   { time: "3 days ago", action: "Profile updated" },
// ];

const Dashboard = () => {
  
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);



  return (
    <div className="dashboard">
      {/* Sidebar */}

      <aside className="sidebar">
        <div className="sidebar-logo">✦ Luminary</div>
        <nav className="sidebar-nav">
          <a href="/tasks" className="nav-item">
            <span className="nav-icon">✓</span> Task Manager
          </a>
          <a href="/dashboard" className="nav-item active">
            <span className="nav-icon">◈</span> API Keys
          </a>
          
          <a href="#" className="nav-item">
            <span className="nav-icon">◉</span> Settings
          </a>
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{displayName}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Sign out">
            ⏻
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dash-main">
        {/* Header */}
        <header className="dash-header">
          <div>
            <p className="dash-greeting">{greeting},</p>
            <h2 className="dash-headline">{displayName} ✦</h2>
          </div>
          <div className="header-actions">
            <div className="status-badge">
              <span className="status-dot" /> Live
            </div>
            <button className="btn-icon" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>

        {/* Stats
        <section className="stats-grid">
          {STATS.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-top">
                <span className="stat-icon">{s.icon}</span>
                <span className="stat-delta">{s.delta}</span>
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </section>*/}

        {/* Bottom two columns */}
        <div className="dash-columns">
          {/* Activity feed */}
          {/* <div className="dash-card">
            <h3 className="card-title">Recent Activity</h3>
            <ul className="activity-list">
              {ACTIVITY.map((a, i) => (
                <li key={i} className="activity-item">
                  <span className="activity-dot" />
                  <div>
                    <p className="activity-action">{a.action}</p>
                    <p className="activity-time">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>  */}

          {/* Auth info */}
          <div className="dash-card">
            <h3 className="card-title">Auth Session</h3>
            <div className="auth-info-list">
              <div className="auth-info-row">
                <span className="info-label">UID</span>
                <span className="info-value mono">{user?.uid?.slice(0, 16)}…</span>
              </div>
              <div className="auth-info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="auth-info-row">
                <span className="info-label">Verified</span>
                <span className={`info-badge ${user?.emailVerified ? "badge-ok" : "badge-warn"}`}>
                  {user?.emailVerified ? "Verified" : "Unverified"}
                </span>
              </div>
              <div className="auth-info-row">
                <span className="info-label">Member since</span>
                <span className="info-value">
                  {new Date(user?.metadata?.creationTime).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="token-section">
              <p className="token-label">JWT Token (truncated)</p>
              <div className="token-box">
                <code className="token-text">{token?.slice(0, 60)}…</code>
                <button className="btn-copy" onClick={copyToken}>
                  {copied ? "✓" : "⧉"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default Dashboard;

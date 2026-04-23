// src/components/TaskManager.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./TaskManager.css";

const TaskManager = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [greeting, setGreeting] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: ""
  });
  const [editingId, setEditingId] = useState(null);

  // Set greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Fetch tasks on mount
  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://task-manager-luminary.onrender.com/api/tasks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setTasks(data.tasks);
      else setError(data.error);
    } catch (err) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    try {
      const res = await fetch("https://task-manager-luminary.onrender.com/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTask)
      });
      const data = await res.json();
      if (data.success) {
        setTasks([data.task, ...tasks]);
        setNewTask({ title: "", description: "", priority: "medium", dueDate: "" });
      }
    } catch (err) {
      setError("Failed to create task");
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const res = await fetch(`https://task-manager-luminary.onrender.com/api/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !task.completed })
      });
      const data = await res.json();
      if (data.success) {
        setTasks(tasks.map(t => t._id === task._id ? data.task : t));
      }
    } catch (err) {
      setError("Failed to update task");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`https://task-manager-luminary.onrender.com/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTasks(tasks.filter(t => t._id !== id));
      }
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const res = await fetch(`https://task-manager-luminary.onrender.com/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        setTasks(tasks.map(t => t._id === id ? data.task : t));
        setEditingId(null);
      }
    } catch (err) {
      setError("Failed to update task");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const priorityClass = (p) => {
    switch (p) {
      case "high": return "priority-high";
      case "medium": return "priority-medium";
      default: return "priority-low";
    }
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div>Loading...</div>;

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">✦ Luminary</div>
        <nav className="sidebar-nav">
          <Link to="/tasks" className="nav-item active">
            <span className="nav-icon">✓</span> Task Manager
          </Link>
          <Link to="/dashboard" className="nav-item">
            <span className="nav-icon">⬡</span> API Keys
          </Link>
          
          
          <a href="#" className="nav-item">
            <span className="nav-icon">○</span> Settings
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

        {/* Task Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-icon">📋</span>
              <span className="stat-delta">Total</span>
            </div>
            <div className="stat-value">{tasks.length}</div>
            <div className="stat-label">Tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-icon">✅</span>
              <span className="stat-delta">Done</span>
            </div>
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-icon">⏳</span>
              <span className="stat-delta">Active</span>
            </div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-icon">📊</span>
              <span className="stat-delta">Rate</span>
            </div>
            <div className="stat-value">
              {tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0}%
            </div>
            <div className="stat-label">Completion</div>
          </div>
        </section>

        {/* Task Manager Content */}
        <div className="task-manager-wrapper">
          <div className="task-header">
            <h2 className="task-title">Task Manager</h2>
            <span className="task-count">{tasks.length} items</span>
          </div>

          {error && <div className="task-error">{error}</div>}

          <form className="task-form" onSubmit={handleCreate}>
            <div className="form-row">
              <input
                type="text"
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="task-input"
                required
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="task-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button type="submit" className="btn-add">+ Add</button>
            </div>
            <div className="form-row-secondary">
              <input
                type="text"
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="task-input-desc"
              />
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="task-date"
              />
            </div>
          </form>

          <div className="task-list">
            {tasks.length === 0 ? (
              <div className="task-empty">No tasks yet. Create one above.</div>
            ) : (
              tasks.map((task) => (
                <div key={task._id} className={`task-item ${task.completed ? "completed" : ""}`}>
                  {editingId === task._id ? (
                    <EditTaskForm
                      task={task}
                      onSave={(updates) => handleUpdate(task._id, updates)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      <div className="task-checkbox">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleComplete(task)}
                        />
                      </div>
                      <div className="task-content">
                        <div className="task-title-row">
                          <span className="task-title-text">{task.title}</span>
                          <span className={`task-priority ${priorityClass(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="task-description">{task.description}</p>
                        )}
                        <div className="task-meta">
                          {task.dueDate && (
                            <span className="task-due">
                              📅 {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className="task-created">
                            Created {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="task-actions">
                        <button
                          className="task-btn edit"
                          onClick={() => setEditingId(task._id)}
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          className="task-btn delete"
                          onClick={() => handleDelete(task._id)}
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Inline edit form component
const EditTaskForm = ({ task, onSave, onCancel }) => {
  const [title, setTitle] = React.useState(task.title);
  const [description, setDescription] = React.useState(task.description || "");
  const [priority, setPriority] = React.useState(task.priority);
  const [dueDate, setDueDate] = React.useState(task.dueDate ? task.dueDate.slice(0, 10) : "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, description, priority, dueDate: dueDate || null });
  };

  return (
    <form className="edit-task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="edit-input"
        autoFocus
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="edit-input"
      />
      <div className="edit-row">
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="edit-select">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="edit-date"
        />
      </div>
      <div className="edit-actions">
        <button type="submit" className="btn-save">Save</button>
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default TaskManager;
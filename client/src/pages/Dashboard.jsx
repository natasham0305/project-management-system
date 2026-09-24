import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import { fetchProjects, fetchTasks } from "../services/projectService.js";

function Dashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [taskStats, setTaskStats] = useState({ todo: 0, inProgress: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all projects
        const projectsData = await fetchProjects(token);
        setProjects(projectsData);

        // Fetch tasks for each project and aggregate counts
        let todo = 0;
        let inProgress = 0;
        let done = 0;

        await Promise.all(
          projectsData.map(async (project) => {
            const tasks = await fetchTasks(project.id, token);
            for (const task of tasks) {
              const s = (task.status || "").toLowerCase();
              if (s === "done" || s === "completed") done++;
              else if (s === "in_progress" || s === "in progress") inProgress++;
              else todo++;
            }
          })
        );

        setTaskStats({ todo, inProgress, done });
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const totalTasks = taskStats.todo + taskStats.inProgress + taskStats.done;

  // Compute per-project progress based on task completion
  const recentProjects = projects.slice(0, 5);

  // Stat cards derived from real data
  const statistics = [
    {
      title: "Projects",
      value: loading ? "—" : projects.length,
      icon: "📁",
      description: "Total projects",
    },
    {
      title: "Tasks",
      value: loading ? "—" : totalTasks,
      icon: "✓",
      description: "All tasks across projects",
    },
    {
      title: "Completed",
      value: loading ? "—" : taskStats.done,
      icon: "🎯",
      description: "Tasks completed",
    },
    {
      title: "In Progress",
      value: loading ? "—" : taskStats.inProgress,
      icon: "⚡",
      description: "Tasks in progress",
    },
  ];

  return (
    <main className="main-content dashboard-page">
      {/* Header */}
      <section className="dashboard-header">
        <div>
          <span className="page-eyebrow">OVERVIEW</span>

          <h1>Dashboard</h1>

          <p>
            {user ? `Welcome back, ${user.username}! ` : ""}
            Here's what's happening across your workspace.
          </p>
        </div>

        <div className="dashboard-header-action">
          <span className="dashboard-date">Workspace Overview</span>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="dashboard-error-banner" role="alert">
          ⚠ {error}
        </div>
      )}

      {/* Statistics */}
      <section className="dashboard-stats">
        {statistics.map((stat) => (
          <div className="dashboard-stat-card" key={stat.title}>
            <div className="dashboard-stat-top">
              <div className="dashboard-stat-icon">{stat.icon}</div>

              <span className="dashboard-stat-label">{stat.title}</span>
            </div>

            <div className="dashboard-stat-value">
              {loading ? (
                <span className="dashboard-skeleton dashboard-skeleton-value" />
              ) : (
                stat.value
              )}
            </div>

            <p>{stat.description}</p>
          </div>
        ))}
      </section>

      {/* Main dashboard grid */}
      <section className="dashboard-main-grid">
        {/* Recent projects */}
        <div className="dashboard-panel dashboard-projects-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="card-eyebrow">PROJECTS</span>

              <h2>Recent projects</h2>
            </div>

            <button
              type="button"
              className="dashboard-text-button"
              onClick={() => navigate("/projects")}
            >
              View all
            </button>
          </div>

          <div className="dashboard-project-list">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div className="dashboard-project-item" key={n}>
                  <div className="dashboard-skeleton dashboard-skeleton-row" />
                </div>
              ))
            ) : recentProjects.length === 0 ? (
              <p className="dashboard-empty">No projects found.</p>
            ) : (
              recentProjects.map((project) => (
                <div
                  className="dashboard-project-item"
                  key={project.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="dashboard-project-left">
                    <div className="dashboard-project-icon">
                      {project.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3>{project.name}</h3>

                      <div className="dashboard-project-meta">
                        <span>{project.priority} priority</span>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-project-right">
                    <span
                      className={`dashboard-status ${(project.status || "")
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {project.status || "Active"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task overview */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="card-eyebrow">TASKS</span>

              <h2>Task overview</h2>
            </div>
          </div>

          <div className="task-overview">
            <div className="task-overview-item">
              <div className="task-overview-label">
                <span className="task-dot todo" />
                <span>Todo</span>
              </div>

              <strong>
                {loading ? (
                  <span className="dashboard-skeleton dashboard-skeleton-num" />
                ) : (
                  taskStats.todo
                )}
              </strong>
            </div>

            <div className="task-overview-item">
              <div className="task-overview-label">
                <span className="task-dot progress" />
                <span>In Progress</span>
              </div>

              <strong>
                {loading ? (
                  <span className="dashboard-skeleton dashboard-skeleton-num" />
                ) : (
                  taskStats.inProgress
                )}
              </strong>
            </div>

            <div className="task-overview-item">
              <div className="task-overview-label">
                <span className="task-dot done" />
                <span>Completed</span>
              </div>

              <strong>
                {loading ? (
                  <span className="dashboard-skeleton dashboard-skeleton-num" />
                ) : (
                  taskStats.done
                )}
              </strong>
            </div>

            <div className="task-overview-total">
              <span>Total tasks</span>

              <strong>
                {loading ? (
                  <span className="dashboard-skeleton dashboard-skeleton-num" />
                ) : (
                  totalTasks
                )}
              </strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;

import Card from "../components/Card";

function Dashboard() {
  const statistics = [
    {
      title: "Projects",
      value: 12,
      icon: "📁",
      description: "Total projects",
    },
    {
      title: "Tasks",
      value: 45,
      icon: "✓",
      description: "All assigned tasks",
    },
    {
      title: "Completed",
      value: 28,
      icon: "🎯",
      description: "Tasks completed",
    },
    {
      title: "Overdue",
      value: 3,
      icon: "⚠",
      description: "Need attention",
    },
  ];

  const recentProjects = [
    {
      name: "Project Management System",
      status: "In Progress",
      priority: "High",
      tasks: 18,
      progress: 72,
    },
    {
      name: "Website Redesign",
      status: "Planning",
      priority: "Medium",
      tasks: 12,
      progress: 35,
    },
    {
      name: "Mobile Application",
      status: "Completed",
      priority: "Low",
      tasks: 24,
      progress: 100,
    },
  ];

  const recentActivity = [
    {
      icon: "✓",
      title: "Task completed",
      description: "API authentication task was completed",
      time: "5 min ago",
    },
    {
      icon: "+",
      title: "Project member added",
      description: "Rahul was added to Website Redesign",
      time: "18 min ago",
    },
    {
      icon: "💬",
      title: "New message",
      description: "New message in Project Management System",
      time: "32 min ago",
    },
    {
      icon: "✎",
      title: "Task updated",
      description: "Database integration status changed",
      time: "1 hour ago",
    },
  ];

  return (
    <main className="main-content dashboard-page">
      {/* Header */}
      <section className="dashboard-header">
        <div>
          <span className="page-eyebrow">OVERVIEW</span>

          <h1>Dashboard</h1>

          <p>Here's what's happening across your workspace.</p>
        </div>

        <div className="dashboard-header-action">
          <span className="dashboard-date">Workspace Overview</span>
        </div>
      </section>

      {/* Statistics */}
      <section className="dashboard-stats">
        {statistics.map((stat) => (
          <div className="dashboard-stat-card" key={stat.title}>
            <div className="dashboard-stat-top">
              <div className="dashboard-stat-icon">{stat.icon}</div>

              <span className="dashboard-stat-label">{stat.title}</span>
            </div>

            <div className="dashboard-stat-value">{stat.value}</div>

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

            <button type="button" className="dashboard-text-button">
              View all
            </button>
          </div>

          <div className="dashboard-project-list">
            {recentProjects.map((project) => (
              <div className="dashboard-project-item" key={project.name}>
                <div className="dashboard-project-left">
                  <div className="dashboard-project-icon">
                    {project.name.charAt(0)}
                  </div>

                  <div>
                    <h3>{project.name}</h3>

                    <div className="dashboard-project-meta">
                      <span>{project.tasks} tasks</span>

                      <span>•</span>

                      <span>{project.priority} priority</span>
                    </div>
                  </div>
                </div>

                <div className="dashboard-project-right">
                  <span
                    className={`dashboard-status ${project.status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {project.status}
                  </span>

                  <div className="dashboard-progress">
                    <div className="dashboard-progress-bar">
                      <div
                        className="dashboard-progress-fill"
                        style={{
                          width: `${project.progress}%`,
                        }}
                      />
                    </div>

                    <span>{project.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
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
                <span className="task-dot todo"></span>
                <span>Todo</span>
              </div>

              <strong>8</strong>
            </div>

            <div className="task-overview-item">
              <div className="task-overview-label">
                <span className="task-dot progress"></span>
                <span>In Progress</span>
              </div>

              <strong>9</strong>
            </div>

            <div className="task-overview-item">
              <div className="task-overview-label">
                <span className="task-dot done"></span>
                <span>Completed</span>
              </div>

              <strong>28</strong>
            </div>

            <div className="task-overview-total">
              <span>Total tasks</span>

              <strong>45</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Activity */}
      <section className="dashboard-panel dashboard-activity-panel">
        <div className="dashboard-panel-header">
          <div>
            <span className="card-eyebrow">ACTIVITY</span>

            <h2>Recent activity</h2>
          </div>

          <button type="button" className="dashboard-text-button">
            View all
          </button>
        </div>

        <div className="dashboard-activity-list">
          {recentActivity.map((activity, index) => (
            <div
              className="dashboard-activity-item"
              key={`${activity.title}-${index}`}
            >
              <div className="dashboard-activity-icon">{activity.icon}</div>

              <div className="dashboard-activity-content">
                <strong>{activity.title}</strong>

                <p>{activity.description}</p>
              </div>

              <span className="dashboard-activity-time">{activity.time}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Dashboard;

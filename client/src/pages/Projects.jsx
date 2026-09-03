import { useEffect, useState } from "react";

import ProjectCard from "../components/ProjectCard";
import CreateProject from "../components/CreateProject";

import { deleteProject, fetchProjects } from "../services/projectService";
import { useAuth } from "../context/useAuth";

function Projects() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await fetchProjects(token);

        setProjects(data);
      } catch {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [token]);

  function handleProjectSaved(project) {
    setProjects((currentProjects) => {
      const exists = currentProjects.some((item) => item.id === project.id);

      if (exists) {
        return currentProjects.map((item) =>
          item.id === project.id ? project : item,
        );
      }

      return [...currentProjects, project];
    });

    setEditingProject(null);
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProject(id, token);

      setProjects((currentProjects) =>
        currentProjects.filter((project) => project.id !== id),
      );
    } catch (error) {
      console.error(error);
    }
  }

  function handleEdit(project) {
    setEditingProject(project);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleCancelEdit() {
    setEditingProject(null);
  }

  return (
    <div className="main-content">
      {/* Page Header */}

      <section className="page-header">
        <div>
          <span className="page-eyebrow">WORKSPACE</span>

          <h1>Projects</h1>

          <p>Plan, track and manage everything your team is working on.</p>
        </div>

        <div className="header-stats">
          <div className="stat-box">
            <span>Total projects</span>
            <strong>{projects.length}</strong>
          </div>

          <div className="stat-box">
            <span>In progress</span>

            <strong>
              {
                projects.filter((project) => project.status === "In Progress")
                  .length
              }
            </strong>
          </div>
        </div>
      </section>

      {/* Create / Edit */}

      <CreateProject
        onProjectSaved={handleProjectSaved}
        editingProject={editingProject}
        onCancelEdit={handleCancelEdit}
      />

      {/* Projects */}

      <section className="projects-section">
        <div className="section-header">
          <div>
            <h2>All projects</h2>

            <span>
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
          </div>

          <div className="view-controls">
            <button className="view-button active">▦</button>

            <button className="view-button">☷</button>
          </div>
        </div>

        {loading ? (
          <div className="state-card">
            <div className="spinner"></div>
            <h3>Loading projects...</h3>
            <p>Getting your workspace ready.</p>
          </div>
        ) : error ? (
          <div className="state-card error-state">
            <div className="state-icon">!</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="state-card empty-state">
            <div className="empty-icon">✦</div>

            <h3>No projects yet</h3>

            <p>
              Create your first project above and start organizing your work.
            </p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Projects;

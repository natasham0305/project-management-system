import { useEffect, useState } from "react";

import {
  createProject,
  fetchManagers,
  updateProject,
} from "../services/projectService";
import { useAuth } from "../context/AuthContext";

function CreateProject({ onProjectSaved, editingProject, onCancelEdit }) {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    manager_id: "",
    description: "",
    priority: "Medium",
    status: "Planning",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    if (user?.role !== "admin") {
      return;
    }

    async function loadManagers() {
      try {
        const data = await fetchManagers(token);
        setManagers(data);
      } catch (error) {
        setError("Failed to load managers");
      }
    }

    loadManagers();
  }, [token, user]);
  useEffect(() => {
    if (editingProject) {
      setFormData({
        name: editingProject.name || "",
        manager_id: editingProject.manager_id || "",
        description: editingProject.description || "",
        priority: editingProject.priority || "Medium",
        status: editingProject.status || "Planning",
      });
    } else {
      setFormData({
        name: "",
        manager_id: "",
        description: "",
        priority: "Medium",
        status: "Planning",
      });
    }

    setError("");
  }, [editingProject]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Project name is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (editingProject) {
        const updatedProject = await updateProject(
          editingProject.id,
          formData,
          token,
        );

        onProjectSaved(updatedProject);
      } else {
        const newProject = await createProject(formData, token);

        onProjectSaved(newProject);

        // Clear form immediately after successful creation
        setFormData({
          name: "",
          manager_id: "",
          description: "",
          priority: "Medium",
          status: "Planning",
        });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`project-form-card ${editingProject ? "editing" : ""}`}>
      <div className="form-header">
        <div>
          <span className="form-eyebrow">
            {editingProject ? "EDIT PROJECT" : "NEW PROJECT"}
          </span>

          <h2>
            {editingProject ? "Update your project" : "Create a new project"}
          </h2>

          <p>
            {editingProject
              ? "Make changes to your project details."
              : "Add a project and start tracking your work."}
          </p>
        </div>

        <div className="form-icon">{editingProject ? "✎" : "+"}</div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Project name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Website redesign"
            />
          </div>

          {user?.role === "admin" && (
            <div className="form-group">
              <label htmlFor="manager_id">Project Manager</label>

              <select
                id="manager_id"
                name="manager_id"
                value={formData.manager_id || ""}
                onChange={handleChange}
              >
                <option value="">Select a manager</option>

                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.username}
                  </option>
                ))}
              </select>

              <small className="form-help">
                Select the manager responsible for this project.
              </small>
            </div>
          )}

          <div className="form-group full-width">
            <label>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this project about?"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Priority</label>

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Planning">Planning</option>

              <option value="In Progress">In Progress</option>

              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="form-error">
            <span>!</span>
            {error}
          </div>
        )}

        <div className="form-actions">
          {editingProject && (
            <button
              type="button"
              className="cancel-button"
              onClick={onCancelEdit}
              disabled={loading}
            >
              Cancel
            </button>
          )}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading
              ? "Saving..."
              : editingProject
                ? "Update Project"
                : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateProject;

import { useEffect, useState } from "react";
import {
  createTask,
  fetchProjectMembers,
  updateTask,
} from "../services/projectService";
import { useAuth } from "../context/useAuth";

function CreateTask({
  projectId,
  onTaskCreated,
  onTaskUpdated,
  onCancel,
  editingTask,
}) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: editingTask?.title || "",
    description: editingTask?.description || "",
    status: editingTask?.status || "Todo",
    priority: editingTask?.priority || "Medium",
    assigned_to: editingTask?.assigned_to || "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectMembers, setprojectMembers] = useState([]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchProjectMembers(projectId, token);
        setprojectMembers(data);
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    }
    loadUsers();
  }, [projectId, token]);

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || "",
        description: editingTask.description || "",
        status: editingTask.status || "Todo",
        priority: editingTask.priority || "Medium",
        assigned_to: editingTask.assigned_to || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "Todo",
        priority: "Medium",
        assigned_to: "",
      });
    }
  }, [editingTask]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      setError("");

      if (editingTask) {
        const updatedTask = await updateTask(editingTask.id, formData, token);

        onTaskUpdated(updatedTask);
      } else {
        const newTask = await createTask(projectId, formData, token);

        onTaskCreated(newTask);
      }

      setFormData({
        title: "",
        description: "",
        status: "Todo",
        priority: "Medium",
        assigned_to: "",
      });
    } catch (error) {
      console.error(error);
      setError(editingTask ? "Failed to update task" : "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Task Title</label>

        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Design homepage"
        />
      </div>

      <div className="form-group">
        <label>Description</label>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe what needs to be done..."
          rows="4"
        />
      </div>

      <div className="form-group">
        <label htmlFor="assigned_to">Assign To</label>

        <select
          id="assigned_to"
          name="assigned_to"
          value={formData.assigned_to}
          onChange={handleChange}
        >
          <option value="">Unassigned</option>

          {projectMembers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username} ({user.role})
            </option>
          ))}
        </select>
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

      {/* <div className="form-group"> */}
      {/* <label>Status</label> */}

      {/* <select
    name="status"
    value={formData.status}
    onChange={handleChange}
  >
    <option value="Todo">
      Todo
    </option>

    <option value="In Progress">
      In Progress
    </option>

    <option value="Done">
      Done
    </option>
  </select> */}
      {/* </div> */}

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="cancel-button" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit" className="create-task-button" disabled={loading}>
          {loading
            ? editingTask
              ? "Saving..."
              : "Creating..."
            : editingTask
              ? "Save Changes"
              : "Create Task"}
        </button>
      </div>
    </form>
  );
}

export default CreateTask;

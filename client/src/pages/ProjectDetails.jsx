import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getProjectById,
  fetchTasks,
  deleteTask,
  updateTask,
  fetchProjectMembers,
  addProjectMember,
  removeProjectMember,
  fetchUsers,
} from "../services/projectService";

import CreateTask from "../components/CreateTask";
import { useAuth } from "../context/AuthContext";

function ProjectDetails() {
  const { token, user } = useAuth();

  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);

  const [allUsers, setAllUsers] = useState([]);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isMember = user?.role === "member";
  const isViewer = user?.role === "viewer";

  useEffect(() => {
    if (!token) {
      return;
    }

    async function loadProject() {
      setLoading(true);
      setTasksLoading(true);
      setMembersLoading(true);

      setError("");
      setTasksError("");

      try {
        const projectData = await getProjectById(id, token);
        setProject(projectData);
      } catch (error) {
        console.error("Failed to load project:", error);
        setError(error.message || "Failed to load project");
      } finally {
        setLoading(false);
      }

      try {
        const memberData = await fetchProjectMembers(id, token);
        setMembers(memberData);
      } catch (error) {
        console.error("Failed to load project members:", error);
      } finally {
        setMembersLoading(false);
      }

      try {
        const usersData = await fetchUsers(token);
        setAllUsers(usersData);
      } catch (error) {
        console.error("Failed to load users:", error);
      }

      try {
        const taskData = await fetchTasks(id, token);
        console.log("TASK DATA:", taskData);
        setTasks(taskData);
      } catch (error) {
        console.error("Failed to load tasks:", error);
        setTasksError(error.message || "Failed to load tasks");
      } finally {
        setTasksLoading(false);
      }
    }

    loadProject();
  }, [id, token]);

  function handleTaskCreated(newTask) {
    setTasks((currentTasks) => [...currentTasks, newTask]);
  }

  function handleEditTask(task) {
    setEditingTask(task);
    setShowTaskForm(true);
  }

  function handleTaskUpdated(updatedTask) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      ),
    );

    setEditingTask(null);
    setShowTaskForm(false);
  }

  async function handleDeleteTask(taskId) {
    try {
      await deleteTask(taskId, token);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  }

  async function handleStatusChange(task, newStatus) {
    try {
      const updatedTask = await updateTask(
        task.id,
        {
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: newStatus,
          assigned_to: task.assigned_to,
        },
        token,
      );

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id ? updatedTask : currentTask,
        ),
      );
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  }

  async function handleAddMember() {
    if (!selectedUserId) {
      return;
    }

    try {
      await addProjectMember(id, selectedUserId, token);
      const updatedMember = await fetchProjectMembers(id, token);
      setMembers(updatedMember);
      setSelectedUserId("");
      setShowMemberForm(false);
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  }

  async function handleRemoveMember(userId) {
    try {
      await removeProjectMember(id, userId, token);
      setMembers((currentMembers) =>
        currentMembers.filter((member) => member.id !== userId),
      );
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  }

  if (loading) {
    return (
      <main className="main-content">
        <div className="state-card">
          <div className="spinner"></div>

          <h3>Loading project...</h3>

          <p>Getting project details.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content">
        <div className="state-card error-state">
          <div className="state-icon">!</div>

          <h3>Something went wrong</h3>

          <p>{error}</p>

          <button
            className="primary-button"
            onClick={() => navigate("/projects")}
          >
            Back to Projects
          </button>
        </div>
      </main>
    );
  }

  if (!project) {
    return null;
  }

  const priorityClass = project.priority?.toLowerCase() || "medium";

  const statusClass =
    project.status?.toLowerCase().replace(/\s+/g, "-") || "planning";

  return (
    <main className="main-content project-details-page">
      {/* Back button */}

      <button className="back-button" onClick={() => navigate("/projects")}>
        ← Back to Projects
      </button>

      {/* Project header */}

      <section className="details-header">
        <div className="details-title-area">
          <div className="details-project-icon">
            {project.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <span className="page-eyebrow">PROJECT DETAILS</span>

            <h1>{project.name}</h1>

            <p>Project #{project.id}</p>
          </div>
        </div>

        {/* Only Admin and Manager can manage project */}

        {(isAdmin || isManager) && (
          <div className="details-actions">
            <button
              className="secondary-button"
              onClick={() => navigate("/projects")}
            >
              Edit Project
            </button>

            <button
              className="primary-button"
              onClick={() => navigate("/projects")}
            >
              Manage Project
            </button>
          </div>
        )}
      </section>

      {/* Main content */}

      <div className="details-grid">
        {/* Left column */}

        <div className="details-main">
          <section className="details-card">
            <div className="details-card-header">
              <div>
                <span className="card-eyebrow">OVERVIEW</span>

                <h2>About this project</h2>
              </div>
            </div>

            <p className="details-description">
              {project.description ||
                "No description has been added for this project yet."}
            </p>
          </section>

          {/* Activity */}

          <section className="details-card">
            <div className="details-card-header">
              <div>
                <span className="card-eyebrow">ACTIVITY</span>

                <h2>Recent activity</h2>
              </div>
            </div>

            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">✓</div>

                <div>
                  <strong>Project created</strong>

                  <p>This project was added to your workspace.</p>
                </div>

                <span>Recently</span>
              </div>

              <div className="activity-item">
                <div className="activity-icon">✎</div>

                <div>
                  <strong>Project details available</strong>

                  <p>You can manage the project from here.</p>
                </div>

                <span>Now</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right column */}

        <aside className="details-sidebar">
          {/* Status */}

          <section className="details-card">
            <span className="card-eyebrow">STATUS</span>

            <h2 className="details-section-title">Current status</h2>

            <div className={`details-status badge status-${statusClass}`}>
              <i></i>
              {project.status}
            </div>
          </section>

          {/* Priority */}

          <section className="details-card">
            <span className="card-eyebrow">PRIORITY</span>

            <h2 className="details-section-title">Project priority</h2>

            <div className={`details-status badge priority-${priorityClass}`}>
              <i></i>
              {project.priority}
            </div>
          </section>

          {/* Team */}

          <section className="details-card">
            <div className="details-card-header">
              <div>
                <span className="card-eyebrow">TEAM</span>

                <h2 className="details-section-title">Project members</h2>
              </div>

              {(isAdmin || isManager) && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowMemberForm((current) => !current)}
                >
                  {showMemberForm ? "Cancel" : "+ Add Member"}
                </button>
              )}
            </div>

            {showMemberForm && (
              <div className="member-form">
                <select
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                >
                  <option value="">Select a user</option>

                  {allUsers
                    .filter(
                      (user) =>
                        !members.some((member) => member.id === user.id),
                    )
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.role})
                      </option>
                    ))}
                </select>

                <button
                  type="button"
                  className="primary-button"
                  onClick={handleAddMember}
                  disabled={!selectedUserId}
                >
                  Add
                </button>
              </div>
            )}

            <div className="team-members">
              {membersLoading ? (
                <p>Loading team...</p>
              ) : members.length === 0 ? (
                <p>No team members assigned.</p>
              ) : (
                members.map((member) => (
                  <div className="team-member" key={member.id}>
                    <div className="team-avatar">
                      {member.username?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <strong>{member.username}</strong>

                      <span>{member.role}</span>
                    </div>

                    {(isAdmin || isManager) && (
                      <button
                        type="button"
                        className="remove-member-button"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>

      {/* Tasks */}

      <div className="tasks-section">
        <div className="section-header">
          <div>
            <h2>Tasks</h2>
            <p>Manage tasks for this project</p>
          </div>

          <span className="task-count">
            {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
          </span>

          {/* Only Admin and Manager can create tasks */}

          {(isAdmin || isManager) && (
            <button
              className="add-task-button"
              onClick={() => setShowTaskForm(true)}
            >
              + Add Task
            </button>
          )}

          {showTaskForm && (
            <div className="modal-overlay">
              <div className="task-modal">
                <div className="modal-header">
                  <div>
                    <h2>{editingTask ? "Edit Task" : "Add New Task"}</h2>

                    <p>
                      {editingTask
                        ? "Update the task details"
                        : "Create a task for this project"}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => {
                      setEditingTask(null);
                      setShowTaskForm(false);
                    }}
                  >
                    ×
                  </button>
                </div>

                <CreateTask
                  projectId={id}
                  editingTask={editingTask}
                  onTaskCreated={(newTask) => {
                    handleTaskCreated(newTask);
                    setShowTaskForm(false);
                  }}
                  onTaskUpdated={handleTaskUpdated}
                  onCancel={() => {
                    setEditingTask(null);
                    setShowTaskForm(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Task loading */}

        {tasksLoading ? (
          <div className="empty-state">
            <p>Loading tasks...</p>
          </div>
        ) : tasksError ? (
          <div className="empty-state">
            <p>{tasksError}</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks yet</h3>

            <p>Create your first task to start working on this project.</p>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => {
              const isAssignedToMe =
                Number(task.assigned_to) === Number(user?.id);

              return (
                <div className="task-card" key={task.id}>
                  <div className="task-card-left">
                    <button className="task-checkbox" type="button">
                      {task.status === "Done" ? "✓" : ""}
                    </button>

                    <div className="task-info">
                      <h3>{task.title}</h3>

                      {task.description && <p>{task.description}</p>}

                      <div className="task-meta">
                        <span
                          className={`priority-badge ${
                            task.priority?.toLowerCase() || ""
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Status permissions */}

                        {isAdmin ||
                        isManager ||
                        (isMember && isAssignedToMe) ? (
                          <select
                            className="status-select"
                            value={task.status}
                            onChange={(event) =>
                              handleStatusChange(task, event.target.value)
                            }
                          >
                            <option value="Todo">Todo</option>

                            <option value="In Progress">In Progress</option>

                            <option value="Done">Done</option>
                          </select>
                        ) : (
                          <span className="status-select status-readonly">
                            {task.status}
                          </span>
                        )}

                        {/* Assigned user */}

                        {task.assignee && (
                          <span className="task-assignee">
                            Assigned to: {task.assignee?.username}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Admin and Manager only */}

                  {(isAdmin || isManager) && (
                    <div className="task-actions">
                      <button
                        type="button"
                        onClick={() => handleEditTask(task)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default ProjectDetails;

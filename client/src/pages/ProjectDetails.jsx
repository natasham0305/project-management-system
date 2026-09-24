import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../services/socket";
import {
  getProjectById,
  fetchTasks,
  deleteTask,
  updateTask,
  fetchProjectMembers,
  addProjectMember,
  removeProjectMember,
  fetchUsers,
  sendProjectMessage,
  fetchProjectMessages,
  deleteProjectMessage,
} from "../services/projectService";

import CreateTask from "../components/CreateTask";
import { useAuth } from "../context/useAuth";

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

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const chatOpenRef = useRef(chatOpen);
  const receivedMessageIdsRef = useRef(new Set());

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isMember = user?.role === "member";
  const isViewer = user?.role === "viewer";
  useLayoutEffect(() => {
    if (!chatOpen || messagesLoading) {
      return;
    }

    const container = chatMessagesRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
    shouldAutoScrollRef.current = true;
  }, [chatOpen, messagesLoading]);

  //newly added message
  useEffect(() => {
    if (!chatOpen) {
      return;
    }

    const container = chatMessagesRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    const isNearBottom = distanceFromBottom < 100;

    if (isNearBottom) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [messages, chatOpen]);

  // useEffect(() => {
  //   if (!chatOpen || messagesLoading) {
  //     return;
  //   }

  //   const container = chatMessagesRef.current;

  //   if (!container) {
  //     return;
  //   }

  //   if (shouldAutoScrollRef.current) {
  //     container.scrollTo({
  //       top: container.scrollHeight,
  //       behavior: "smooth",
  //     });
  //   }
  // }, [messages]);

  // //to always start with new message
  // useEffect(() => {
  //   if (!chatOpen) {
  //     shouldAutoScrollRef.current = true;
  //   }
  // }, [chatOpen]);

  useEffect(() => {
    if (!id) {
      return;
    }

    socket.connect();

    socket.emit("joinProject", id);

    return () => {
      socket.disconnect();
    };
  }, [id]);
  useEffect(() => {
    if (!id) {
      return;
    }

    function handleNewMessage(message) {
      // Prevent processing the same socket message more than once
      if (receivedMessageIdsRef.current.has(message.id)) {
        return;
      }

      receivedMessageIdsRef.current.add(message.id);

      if (!chatOpenRef.current) {
        setUnreadCount((currentCount) => currentCount + 1);
      }

      setMessages((currentMessages) => {
        const alreadyExists = currentMessages.some(
          (currentMessage) => currentMessage.id === message.id,
        );

        if (alreadyExists) {
          return currentMessages;
        }

        return [...currentMessages, message];
      });
    }

    socket.on("newProjectMessage", handleNewMessage);

    return () => {
      socket.off("newProjectMessage", handleNewMessage);
    };
  }, [id]);

  useEffect(() => {
    chatOpenRef.current = chatOpen;

    if (chatOpen) {
      setUnreadCount(0);
    }
  }, [chatOpen]);

  useEffect(() => {
    if (!chatOpen) {
      return;
    }

    shouldAutoScrollRef.current = true;
  }, [chatOpen]);

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

      const projectPromise = getProjectById(id, token)
        .then((projectData) => {
          setProject(projectData);
        })
        .catch((error) => {
          console.error("Failed to load project:", error);
          setError(error.message || "Failed to load project");
        })
        .finally(() => {
          setLoading(false);
        });

      const handleOpenAttachment = async (attachment) => {
        try {
          const blob = await fetchProjectAttachment(
            project.id,
            attachment.id,
            token,
          );

          const fileUrl = URL.createObjectURL(blob);

          window.open(fileUrl, "_blank");

          setTimeout(() => {
            URL.revokeObjectURL(fileUrl);
          }, 60_000);
        } catch (error) {
          console.error("Attachment error:", error);
          alert(error.message);
        }
      };
      // try {
      //   const projectData = await getProjectById(id, token);
      //   setProject(projectData);
      // } catch (error) {
      //   console.error("Failed to load project:", error);
      //   setError(error.message || "Failed to load project");
      // } finally {
      //   setLoading(false);
      // }

      const membersPromise = fetchProjectMembers(id, token)
        .then((memberData) => {
          setMembers(memberData);
        })
        .catch((error) => {
          console.error("Failed to load project members:", error);
        })
        .finally(() => {
          setMembersLoading(false);
        });

      // try {
      //   const memberData = await fetchProjectMembers(id, token);
      //   setMembers(memberData);
      // } catch (error) {
      //   console.error("Failed to load project members:", error);
      // } finally {
      //   setMembersLoading(false);
      // }

      const tasksPromise = fetchTasks(id, token)
        .then((taskData) => {
          setTasks(taskData);
        })
        .catch((error) => {
          console.error("Failed to load tasks:", error);
          setTasksError(error.message || "Failed to load tasks");
        })
        .finally(() => {
          setTasksLoading(false);
        });

      // if (isAdmin || isManager) {
      //   try {
      //     const usersData = await fetchUsers(token);
      //     setAllUsers(usersData);
      //   } catch (error) {
      //     console.error("Failed to load users:", error);
      //   }
      // }

      const usersPromise =
        isAdmin || isManager
          ? fetchUsers(token)
              .then((usersData) => {
                setAllUsers(usersData);
              })
              .catch((error) => {
                console.error("Failed to load users:", error);
              })
          : Promise.resolve();

      // try {
      //   const taskData = await fetchTasks(id, token);
      //   setTasks(taskData);
      // } catch (error) {
      //   console.error("Failed to load tasks:", error);
      //   setTasksError(error.message || "Failed to load tasks");
      // } finally {
      //   setTasksLoading(false);
      // }

      await Promise.all([
        projectPromise,
        membersPromise,
        tasksPromise,
        usersPromise,
      ]);
    }

    loadProject();
  }, [id, token, isAdmin, isManager]);

  useEffect(() => {
    if (!token || !id || !chatOpen) {
      return;
    }

    async function loadMessages() {
      setMessagesLoading(true);
      setMessagesError("");

      try {
        const messageData = await fetchProjectMessages(id, token);
        messageData.forEach((message) => {
          receivedMessageIdsRef.current.add(message.id);
        });
        setMessages(messageData);
      } catch (error) {
        console.error("Failed to load project messages:", error);
        setMessagesError(error.message || "Failed to load project messages");
      } finally {
        setMessagesLoading(false);
      }
    }

    loadMessages();
  }, [id, token, chatOpen]);

  function handleChatScroll() {
    const container = chatMessagesRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    shouldAutoScrollRef.current = distanceFromBottom < 100;
  }

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

  async function handleSendMessage(event) {
    event.preventDefault();

    const trimmedMessage = newMessage.trim();

    if (!trimmedMessage && !selectedFile) {
      return;
    }

    setSendingMessage(true);
    setMessagesError("");

    try {
      await sendProjectMessage(id, trimmedMessage, selectedFile, token);

      setNewMessage("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessagesError(error.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  }
  async function handleDeleteMessage(messageId) {
    try {
      await deleteProjectMessage(id, messageId, token);

      setMessages((currentMessages) =>
        currentMessages.filter((message) => message.id !== messageId),
      );

      setSelectedMessage(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
      setMessagesError(error.message || "Failed to delete message");
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
      {/* Project Chat */}
      <div className={`project-chat-drawer ${chatOpen ? "open" : ""}`}>
        {/* Collapsed / toggle bar */}
        <button
          type="button"
          className="project-chat-toggle"
          onClick={() => setChatOpen((current) => !current)}
        >
          <div className="project-chat-toggle-left">
            <span className="project-chat-toggle-info">
              <strong>Project Chat</strong>

              <span>
                {unreadCount > 0
                  ? `${unreadCount} new ${
                      unreadCount === 1 ? "message" : "messages"
                    }`
                  : `${messages.length} ${
                      messages.length === 1 ? "message" : "messages"
                    }`}
              </span>
            </span>
          </div>

          <span className="project-chat-toggle-arrow">
            {chatOpen ? "⌄" : "⌃"}
          </span>
        </button>

        {/* Expanded chat window */}
        {chatOpen && (
          <div className="project-chat-window">
            {/* Header */}
            <div className="project-chat-window-header">
              <div className="project-chat-project-info">
                <div className="project-chat-project-avatar">
                  {project.name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3>{project.name}</h3>
                  <span>
                    {members.length}{" "}
                    {members.length === 1 ? "member" : "members"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="project-chat-close"
                onClick={() => setChatOpen(false)}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            {/* Conversation */}
            <div
              className="project-chat-messages"
              ref={chatMessagesRef}
              onScroll={handleChatScroll}
            >
              {messagesLoading ? (
                <div className="project-chat-state">
                  <div className="spinner"></div>
                  <p>Loading conversation...</p>
                </div>
              ) : messagesError ? (
                <div className="project-chat-state chat-error">
                  <p>{messagesError}</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="project-chat-state">
                  <div className="project-chat-empty-icon">💬</div>

                  <h4>No messages yet</h4>

                  <p>Start the conversation with your project team.</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage =
                    Number(message.sender_id) === Number(user?.id);

                  const senderName = message.sender?.username || "Unknown user";

                  const senderRole = message.sender?.role || "";

                  const initials = senderName.charAt(0).toUpperCase();

                  return (
                    <div
                      key={message.id}
                      className={`project-message ${
                        isOwnMessage ? "project-message-own" : ""
                      }`}
                    >
                      {!isOwnMessage && (
                        <div className="project-message-avatar">{initials}</div>
                      )}
                      <div className="project-message-body">
                        {/* Sender line */}
                        <div className="project-message-meta">
                          <div className="project-message-sender">
                            <strong>{isOwnMessage ? "You" : senderName}</strong>

                            {!isOwnMessage && <span>{senderRole}</span>}
                          </div>

                          <button
                            type="button"
                            className="project-message-menu"
                            onClick={() =>
                              setSelectedMessage(
                                selectedMessage === message.id
                                  ? null
                                  : message.id,
                              )
                            }
                          >
                            ⋮
                          </button>
                        </div>

                        {/* Message menu */}
                        {selectedMessage === message.id && (
                          <div className="project-message-actions">
                            <button type="button">Reply</button>

                            {(isOwnMessage || isAdmin) && (
                              <button
                                type="button"
                                className="delete-message-action"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        )}

                        {/* Message bubble */}
                        <div className="project-message-bubble">
                          {message.message && (
                            <div className="project-message-text">
                              {message.message}
                            </div>
                          )}

                          {message.attachments?.length > 0 && (
                            <div className="project-message-attachments">
                              {message.attachments.map((attachment) => {
                                const isImage =
                                  attachment.file_type.startsWith("image/");

                                const fileSizeKB =
                                  attachment.file_size >= 1024
                                    ? `${(attachment.file_size / 1024).toFixed(1)} KB`
                                    : `${attachment.file_size} B`;

                                return (
                                  <div
                                    key={attachment.id}
                                    className="chat-attachment"
                                  >
                                    {isImage ? (
                                      <button
                                        type="button"
                                        className="chat-image-link"
                                        onClick={() =>
                                          handleOpenAttachment(attachment)
                                        }
                                      >
                                        <div className="chat-image-placeholder">
                                          🖼️ {attachment.file_name}
                                        </div>
                                      </button>
                                    ) : (
                                      <div className="chat-file-card">
                                        <div className="chat-file-icon">📄</div>

                                        <div className="chat-file-info">
                                          <strong>
                                            {attachment.file_name}
                                          </strong>

                                          <span>{fileSizeKB}</span>

                                          <div className="chat-file-actions">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleOpenAttachment(attachment)
                                              }
                                            >
                                              Open
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleOpenAttachment(attachment)
                                              }
                                            >
                                              Download
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        {/* Time */}
                        <div className="project-message-time">
                          {message.created_at
                            ? new Date(message.created_at).toLocaleTimeString(
                                [],
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                },
                              )
                            : ""}
                        </div>
                      </div>
                      {isOwnMessage && (
                        <div className="project-message-avatar own">
                          {user?.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            {!isViewer ? (
              <form
                className="project-chat-composer"
                onSubmit={handleSendMessage}
              >
                {/* Selected file preview */}
                {selectedFile && (
                  <div className="selected-file">
                    <span>📎</span>

                    <span className="selected-file-name">
                      {selectedFile.name}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);

                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Input row */}
                <div className="chat-input-row">
                  <button
                    type="button"
                    className="project-chat-attach"
                    title="Attach file"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📎
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (file) {
                        setSelectedFile(file);
                      }
                    }}
                  />

                  <input
                    type="text"
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    placeholder="Write a message..."
                    disabled={sendingMessage}
                  />

                  <button
                    type="submit"
                    className="project-chat-send"
                    disabled={
                      sendingMessage || (!newMessage.trim() && !selectedFile)
                    }
                  >
                    {sendingMessage ? "..." : "Send"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="project-chat-readonly">
                You can read this conversation, but you cannot send messages.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default ProjectDetails;

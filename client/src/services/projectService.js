import { apiFetch } from "./api";

// PROJECTS

export async function getProjectById(id, token) {
  return apiFetch(`/projects/${id}`, {}, token);
}

export async function fetchProjects(token) {
  const data = await apiFetch("/projects", {}, token);

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    priority: item.priority,
    status: item.status,
  }));
}

export async function createProject(projectData, token) {
  return apiFetch(
    "/projects",
    {
      method: "POST",
      body: JSON.stringify(projectData),
    },
    token,
  );
}

export async function updateProject(id, projectData, token) {
  return apiFetch(
    `/projects/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(projectData),
    },
    token,
  );
}

export async function deleteProject(id, token) {
  return apiFetch(
    `/projects/${id}`,
    {
      method: "DELETE",
    },
    token,
  );
}

export async function fetchProjectMembers(projectId, token) {
  return apiFetch(`/projects/${projectId}/members`, {}, token);
}

export async function addProjectMember(projectId, userId, token) {
  return apiFetch(
    `/projects/${projectId}/members`,
    {
      method: "POST",
      body: JSON.stringify({
        userId,
      }),
    },
    token,
  );
}

export async function removeProjectMember(projectId, userId, token) {
  return apiFetch(
    `/projects/${projectId}/members/${userId}`,
    {
      method: "DELETE",
    },
    token,
  );
}

//message

export async function fetchProjectMessages(projectId, token) {
  return apiFetch(
    `/projects/${projectId}/messages`,
    {
      method: "GET",
    },
    token,
  );
}

export async function sendProjectMessage(projectId, message, file, token) {
  const formData = new FormData();

  if (message?.trim()) {
    formData.append("message", message.trim());
  }

  if (file) {
    formData.append("file", file);
  }

  return apiFetch(
    `/projects/${projectId}/messages`,
    {
      method: "POST",
      body: formData,
    },
    token,
  );
}

export async function deleteProjectMessage(projectId, messageId, token) {
  return apiFetch(
    `/projects/${projectId}/messages/${messageId}`,
    {
      method: "DELETE",
    },
    token,
  );
}

export async function fetchProjectAttachment(projectId, attachmentId, token) {
  return apiFetch(
    `/projects/${projectId}/attachments/${attachmentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    token,
  );
}

//   )
//   const response = await fetch(
//     `${import.meta.env.VITE_API_URL}`,
//     {

//     },
//   );

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}));

//     throw new Error(
//       errorData.message || "Failed to fetch attachment",
//     );
//   }

//   return response.blob();
// }
// TASKS

export async function fetchTasks(projectId, token) {
  return apiFetch(`/projects/${projectId}/tasks`, {}, token);
}

export async function createTask(projectId, taskData, token) {
  return apiFetch(
    `/projects/${projectId}/tasks`,
    {
      method: "POST",
      body: JSON.stringify(taskData),
    },
    token,
  );
}

export async function updateTask(taskId, taskData, token) {
  return apiFetch(
    `/tasks/${taskId}`,
    {
      method: "PUT",
      body: JSON.stringify(taskData),
    },
    token,
  );
}

export async function deleteTask(taskId, token) {
  return apiFetch(
    `/tasks/${taskId}`,
    {
      method: "DELETE",
    },
    token,
  );
}

// USERS

export async function fetchUsers(token) {
  return apiFetch("/users", {}, token);
}

export async function updateUserRole(userId, role, token) {
  return apiFetch(
    `/users/${userId}/role`,
    {
      method: "PUT",
      body: JSON.stringify({
        role,
      }),
    },
    token,
  );
}

//MANAGER

export async function fetchManagers(token) {
  return apiFetch(`/users/?role=manager`, {}, token);
}

// export async function getProjectById(id) {
//   const response = await fetch(
//     `${import.meta.env.VITE_API_URL}/projects/${id}`,
//   );

//   if (!response.ok) {
//     throw new Error("Failed to fetch project");
//   }
//   return response.json();
// }

// export async function fetchProjects() {
//   const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`);

//   if (!response.ok) {
//     throw new Error("Failed to fetch projects");
//   }

//   const data = await response.json();

//   return data.map((item) => ({
//     id: item.id,
//     name: item.name,
//     description: item.description,
//     priority: item.priority,
//     status: "In Progress",
//   }));
// }

// export async function createProject(projectData) {
//   const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(projectData),
//   });

//   if (!response.ok) {
//     const errorData = await response.json();

//     throw new Error(errorData.message || "Failed to create project");
//   }

//   return response.json();
// }

// export async function updateProject(id, projectData) {
//   const response = await fetch(
//     `${import.meta.env.VITE_API_URL}/projects/${id}`,
//     {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(projectData),
//     },
//   );

//   if (!response.ok) {
//     const errorData = await response.json();

//     throw new Error(errorData.message || "Failed to update project");
//   }

//   return response.json();
// }

// export async function deleteProject(id) {
//   const response = await fetch(
//     `${import.meta.env.VITE_API_URL}/projects/${id}`,
//     {
//       method: `DELETE`,
//     },
//   );
//   if (!response.ok) {
//     throw new Error("Failed to delete project");
//   }

//   return response.json();
// }

// export async function fetchTasks(projectId) {
//   const response = await fetch(
//     `${import.meta.env.VITE_API_URL}/projects/${projectId}/tasks`,
//   );

//   if (!response.ok) {
//     throw new Error("Failed to fetch tasks");
//   }

//   return response.json();
// }

// export async function createTask(projectId, taskData) {
//   const response = await fetch(
//     `${import.meta.env.VITE_API_URL}/projects/${projectId}/tasks`,
//     {
//       method: "POST",

//       headers: {
//         "Content-Type": "application/json",
//       },

//       body: JSON.stringify(taskData),
//     },
//   );

//   if (!response.ok) {
//     throw new Error("Failed to create task");
//   }

//   return response.json();
// }

// export async function updateTask(taskId, taskData) {
//   const response = await fetch(
//     `${import.meta.env.VITE_API_URL}/tasks/${taskId}`,
//     {
//       method: "PUT",

//       headers: {
//         "Content-Type": "application/json",
//       },

//       body: JSON.stringify(taskData),
//     },
//   );

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}));
//     throw new Error(errorData.message || "Failed to update task");
//   }

//   return response.json();
// }

// export async function deleteTask(taskId) {
//   const response = await fetch(
//     `${import.meta.env.VITE_API_URL}/tasks/${taskId}`,
//     {
//       method: "DELETE",
//     },
//   );

//   if (!response.ok) {
//     throw new Error("Failed to delete task");
//   }

//   return response.json();
// }

// export async function fetchUsers() {
//   const response = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error("Failed to Fetch Users");
//   }
//   return response.json;
// }

// // export async function fetchProjects() {
// //   const response = await fetch(
// //     'https://jsonplaceholder.typicode.com/posts'
// //   );

// //   if (!response.ok) {
// //     throw new Error('Failed to fetch projects');
// //   }

// //   const data = await response.json();

// //   return data.slice(0, 5).map((item) => ({
// //     id: item.id,
// //     name: item.title,
// //     status: 'In Progress'
// //   }));
// // }

// // export async function createProject(projectData) {
// //   const response = await fetch(
// //     'https://jsonplaceholder.typicode.com/posts',
// //     {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json'
// //       },
// //       body: JSON.stringify(projectData)
// //     }
// //   );

// //   if (!response.ok) {
// //     throw new Error('Failed to create project');
// //   }

// //   return response.json();
// // }

// // export function fetchProjects() {
// //   return new Promise((resolve) => {
// //     setTimeout(() => {
// //       resolve([
// //         {
// //           id: 1,
// //           name: 'Website Redesign',
// //           status: 'In Progress'
// //         },
// //         {
// //           id: 2,
// //           name: 'Mobile App',
// //           status: 'Completed'
// //         },
// //         {
// //           id: 3,
// //           name: 'Marketing Campaign',
// //           status: 'Not Started'
// //         }
// //       ]);
// //     }, 2000);
// //   });
// // }

// // export function fetchProjects() {
// //   return new Promise((resolve, reject) => {
// //     setTimeout(() => {
// //       reject(new Error('Server error'));
// //     }, 2000);
// //   });
// // }

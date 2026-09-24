import { test, expect } from "@playwright/test";
import { getAuthFromState, authHeader } from "../helpers/apiAuth";

test.describe("Project API", () => {
  let adminToken: string;
  let managerToken: string;
  let managerId: number;
  let memberToken: string;

  // Track IDs created during tests for teardown (avoids database pollution)
  const createdProjectIds: number[] = [];

  // Load tokens and user info directly from the saved auth state files
  // No HTTP login calls needed — state files were created by auth.setup.ts
  test.beforeAll(async () => {
    const admin = getAuthFromState("admin");
    adminToken = admin.token;

    const manager = getAuthFromState("manager");
    managerToken = manager.token;
    managerId = manager.user.id;

    const member = getAuthFromState("member");
    memberToken = member.token;
  });

  // Teardown: Clean up any leftover projects created during test runs
  test.afterAll(async ({ request }) => {
    for (const id of createdProjectIds) {
      await request
        .delete(`/api/projects/${id}`, {
          headers: authHeader(adminToken),
        })
        .catch(() => {});
    }
  });

  // Auth & Permission Checks (401 & 403)
  test.describe("Authentication & Authorization Guard", () => {
    test("should reject GET /api/projects without token (401)", async ({ request }) => {
      const response = await request.get("/api/projects");
      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.message).toBe("Authentication required");
    });

    test("should reject POST /api/projects without token (401)", async ({ request }) => {
      const response = await request.post("/api/projects", {
        data: {
          name: "Unauthorized Project",
          description: "A project without auth",
          priority: "High",
          status: "Planning",
        },
      });
      expect(response.status()).toBe(401);
    });

    test("should reject POST /api/projects for member role (403 Forbidden)", async ({ request }) => {
      const response = await request.post("/api/projects", {
        headers: authHeader(memberToken),
        data: {
          name: "Member Forbidden Project",
          description: "Member attempt",
          priority: "Low",
          status: "Planning",
        },
      });

      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body.message).toBe("You do not have permission to perform this action");
    });
  });

  test.describe("POST /api/projects (Creation)", () => {
    test("manager can successfully create a new project", async ({ request }) => {
      const projectName = `Manager Project ${Date.now()}`;
      const response = await request.post("/api/projects", {
        headers: authHeader(managerToken),
        data: {
          name: projectName,
          description: "Created by manager via API test",
          priority: "High",
          status: "Planning",
        },
      });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty("id");
      expect(body.name).toBe(projectName);
      expect(body.priority).toBe("High");
      expect(Number(body.manager_id)).toBe(managerId);
      createdProjectIds.push(body.id);
    });

    test("admin can create a project by assigning a manager_id", async ({ request }) => {
      const projectName = `Admin Project ${Date.now()}`;
      const response = await request.post("/api/projects", {
        headers: authHeader(adminToken),
        data: {
          name: projectName,
          description: "Created by admin via API test",
          priority: "Medium",
          status: "In Progress",
          manager_id: managerId,
        },
      });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty("id");
      expect(body.name).toBe(projectName);
      expect(Number(body.manager_id)).toBe(managerId);
      createdProjectIds.push(body.id);
    });

    test("should reject creation when project name is missing", async ({ request }) => {
      const response = await request.post("/api/projects", {
        headers: authHeader(managerToken),
        data: {
          name: "",
          description: "Missing name test",
          priority: "Low",
          status: "Planning",
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toBe("Project name is required");
    });

    test("should reject creation when priority is invalid", async ({ request }) => {
      const response = await request.post("/api/projects", {
        headers: authHeader(managerToken),
        data: {
          name: "Invalid Priority Project",
          description: "Invalid priority test",
          priority: "Urgent", // Only Low, Medium, High allowed
          status: "Planning",
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toBe("Invalid priority");
    });

    test("should reject creation when admin omits manager_id", async ({ request }) => {
      const response = await request.post("/api/projects", {
        headers: authHeader(adminToken),
        data: {
          name: "Missing Manager Project",
          description: "No manager provided",
          priority: "Low",
          status: "Planning",
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toBe("Manager is required");
    });
  });

  // Fetching Projects (GET /api/projects & GET /api/projects/:id)
  test.describe("GET /api/projects", () => {
    test("authenticated user can retrieve all projects", async ({ request }) => {
      const response = await request.get("/api/projects", {
        headers: authHeader(adminToken),
      });

      expect(response.status()).toBe(200);
      const projects = await response.json();
      expect(Array.isArray(projects)).toBeTruthy();
    });

    test("authenticated user can retrieve a specific project by id", async ({ request }) => {
      // 1. Create a project with all required fields
      const createRes = await request.post("/api/projects", {
        headers: authHeader(managerToken),
        data: {
          name: `Fetch Test ${Date.now()}`,
          description: "Testing single project retrieval",
          priority: "Low",
          status: "Planning",
        },
      });
      expect(createRes.status()).toBe(201);
      const created = await createRes.json();
      createdProjectIds.push(created.id);

      // 2. Fetch it by ID
      const fetchRes = await request.get(`/api/projects/${created.id}`, {
        headers: authHeader(managerToken),
      });

      expect(fetchRes.status()).toBe(200);
      const project = await fetchRes.json();
      expect(project.id).toBe(created.id);
      expect(project.name).toBe(created.name);
    });

    test("should return 404 for non-existent project id", async ({ request }) => {
      const response = await request.get("/api/projects/999999", {
        headers: authHeader(adminToken),
      });

      expect(response.status()).toBe(404);
      const body = await response.json();
      expect(body.message).toBe("Project not found");
    });
  });

  // Updating & Deletion (PUT & DELETE)
  test.describe("PUT & DELETE /api/projects/:id", () => {
    test("manager can update their own project", async ({ request }) => {
      const createRes = await request.post("/api/projects", {
        headers: authHeader(managerToken),
        data: {
          name: `Before Update ${Date.now()}`,
          description: "Initial description",
          priority: "Low",
          status: "Planning",
        },
      });
      expect(createRes.status()).toBe(201);
      const created = await createRes.json();
      createdProjectIds.push(created.id);

      const updateRes = await request.put(`/api/projects/${created.id}`, {
        headers: authHeader(managerToken),
        data: {
          name: "Updated Project Name",
          description: "Updated description",
          priority: "High",
          status: "In Progress",
        },
      });

      expect(updateRes.status()).toBe(200);
      const updated = await updateRes.json();
      expect(updated.name).toBe("Updated Project Name");
      expect(updated.description).toBe("Updated description");
      expect(updated.priority).toBe("High");
      expect(updated.status).toBe("In Progress");
    });

    test("manager cannot delete a project (403 forbidden)", async ({ request }) => {
      const createRes = await request.post("/api/projects", {
        headers: authHeader(managerToken),
        data: {
          name: `Cannot Delete ${Date.now()}`,
          description: "Manager delete attempt",
          priority: "Low",
          status: "Planning",
        },
      });
      expect(createRes.status()).toBe(201);
      const created = await createRes.json();
      createdProjectIds.push(created.id);

      const deleteRes = await request.delete(`/api/projects/${created.id}`, {
        headers: authHeader(managerToken),
      });

      expect(deleteRes.status()).toBe(403);
    });

    test("admin can successfully delete a project (200)", async ({ request }) => {
      const createRes = await request.post("/api/projects", {
        headers: authHeader(adminToken),
        data: {
          name: `To Delete ${Date.now()}`,
          description: "Project will be deleted",
          priority: "Low",
          status: "Planning",
          manager_id: managerId,
        },
      });
      expect(createRes.status()).toBe(201);
      const created = await createRes.json();

      const deleteRes = await request.delete(`/api/projects/${created.id}`, {
        headers: authHeader(adminToken),
      });

      expect(deleteRes.status()).toBe(200);

      // Verify it is gone (404)
      const verifyRes = await request.get(`/api/projects/${created.id}`, {
        headers: authHeader(adminToken),
      });
      expect(verifyRes.status()).toBe(404);
    });
  });
});
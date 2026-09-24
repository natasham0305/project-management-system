import { test, expect } from "@playwright/test";

test.describe("Auth API", () => {
  test.describe("POST /api/auth/register", () => {
    test("should successfully register a new user", async ({ request }) => {
      const uniqueSuffix = Date.now();
      const payload = {
        username: `user_${uniqueSuffix}`,
        email: `user_${uniqueSuffix}@example.com`,
        password: "Password123!",
        confirmPassword: "Password123!",
      };

      const response = await request.post("/api/auth/register", {
        data: payload,
      });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.message).toBe("User registered successfully");
      expect(body.user).toHaveProperty("id");
      expect(body.user.username).toBe(payload.username);
      expect(body.user.email).toBe(payload.email.toLowerCase());
      expect(body.user).toHaveProperty("role");
      expect(body.user).not.toHaveProperty("password");
    });

    test("should fail when username is missing", async ({ request }) => {
      const response = await request.post("/api/auth/register", {
        data: {
          username: "",
          email: "missing_user@example.com",
          password: "Password123!",
          confirmPassword: "Password123!",
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toBe("Username is required");
    });

    test("should fail when email is missing", async ({ request }) => {
      const response = await request.post("/api/auth/register", {
        data: {
          username: "validuser",
          email: "",
          password: "Password123!",
          confirmPassword: "Password123!",
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toBe("Email is required");
    });

    test("should fail when password is shorter than 8 characters", async ({ request }) => {
      const response = await request.post("/api/auth/register", {
        data: {
          username: "validuser",
          email: "shortpwd@example.com",
          password: "short",
          confirmPassword: "short",
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toBe("Password must be at least 8 characters");
    });

    test("should fail when passwords do not match", async ({ request }) => {
      const response = await request.post("/api/auth/register", {
        data: {
          username: "validuser",
          email: "mismatch@example.com",
          password: "Password123!",
          confirmPassword: "DifferentPassword123!",
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toBe("Passwords do not match");
    });

    test("should fail when email is already registered", async ({ request }) => {
      // Use existing seed / test email
      const response = await request.post("/api/auth/register", {
        data: {
          username: "duplicateuser",
          email: process.env.TEST_EMAIL,
          password: "Password123!",
          confirmPassword: "Password123!",
        },
      });

      expect(response.status()).toBe(409);
      const body = await response.json();
      expect(body.message).toBe("Email already registered");
    });
  });

  test.describe("POST /api/auth/login", () => {
    test("should successfully log in an existing user and return a JWT", async ({ request }) => {
      const response = await request.post("/api/auth/login", {
        data: {
          email: process.env.TEST_EMAIL,
          password: process.env.TEST_PASSWORD,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.message).toBe("Login successful");
      expect(body).toHaveProperty("token");
      expect(typeof body.token).toBe("string");
      expect(body.user.email).toBe(process.env.TEST_EMAIL?.toLowerCase());
    });

    test("should reject login when email is missing", async ({ request }) => {
      const response = await request.post("/api/auth/login", {
        data: {
          email: "",
          password: process.env.TEST_PASSWORD,
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toBe("Email is required");
    });

    test("should reject login when password is missing", async ({ request }) => {
      const response = await request.post("/api/auth/login", {
        data: {
          email: process.env.TEST_EMAIL,
          password: "",
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toBe("Password is required");
    });

    test("should reject login when password is incorrect", async ({ request }) => {
      const response = await request.post("/api/auth/login", {
        data: {
          email: process.env.TEST_EMAIL,
          password: "IncorrectPassword123!",
        },
      });

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toBe("Invalid email or password");
    });

    test("should reject login when email does not exist", async ({ request }) => {
      const response = await request.post("/api/auth/login", {
        data: {
          email: `nonexistent_${Date.now()}@example.com`,
          password: "Password123!",
        },
      });

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toBe("Invalid email or password");
    });
  });
});

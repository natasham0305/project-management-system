import { APIRequestContext } from "@playwright/test";
import fs from "fs";

// Helper to log in a user and return the JWT token and user info
export async function loginAndGetToken(
  request: APIRequestContext,
  email: string = "admin@example.com",
  password: string = "Password123!",
) {
  const response = await request.post("/api/auth/login", {
    data: { email, password },
  });

  if (!response.ok()) {
    const errorText = await response.text();
    throw new Error(`login failed for ${email}: ${response.status()} - ${errorText}`);
  }

  const body = await response.json();
  return { token: body.token, user: body.user };
}

// Read token and user info directly from the saved storageState JSON file
// (avoids an extra HTTP login call when storage states are already available)
export function getAuthFromState(role: "admin" | "manager" | "member") {
  const filePath = `tests/auth/${role}.json`;
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const token = data.sessionStorage.token;
  const user = JSON.parse(data.sessionStorage.user);

  return { token, user };
}

// Helper to format the Bearer token header
export function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}
import { APIRequestContext } from "@playwright/test";
import fs from "fs";

// Helper to log in a user and return the auth cookie and user info
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
  const setCookie = response.headers()["set-cookie"];
  const cookie = setCookie?.split(";")[0];

  return { token: cookie, user: body.user };
}

// Read the auth cookie and user info from the saved storage state.
export function getAuthFromState(role: "admin" | "manager" | "member") {
  const filePath = `tests/auth/${role}.json`;
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const authCookie = data.cookies
    .filter((cookie: { name: string }) =>
      ["project_management_token", "token"].includes(cookie.name),
    )
    .map((cookie: { name: string; value: string }) =>
      `${cookie.name}=${cookie.value}`,
    )
    .join("; ");
  const user = JSON.parse(data.sessionStorage.user);

  return { token: authCookie, user };
}

// Helper to format the cookie header
export function authHeader(cookie: string) {
  return {
    Cookie: cookie,
  };
}
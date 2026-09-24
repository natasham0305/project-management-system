import { test as setup, expect, Page } from "@playwright/test";
import fs from "fs";
import path from "path";

const authDir = path.resolve("tests/auth");

// Helper to log in a user and persist their sessionStorage to a file
async function loginAndSaveState(page: Page, email: string, password: string, stateFileName: string) {
  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/dashboard/);

  // Extract React's sessionStorage (where JWT is stored)
  const sessionStorage = await page.evaluate(() => {
    const data: Record<string, string> = {};
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      if (key) {
        data[key] = window.sessionStorage.getItem(key) || "";
      }
    }
    return data;
  });

  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Derive frontend origin safely
  const frontendOrigin = process.env.FRONTEND || "http://localhost:5173";

  // Save the full storage state with sessionStorage
  const stateData = JSON.stringify(
    {
      cookies: [],
      origins: [
        {
          origin: frontendOrigin,
          localStorage: [],
        },
      ],
      sessionStorage,
    },
    null,
    2,
  );

  const filePath = path.join(authDir, stateFileName);
  fs.writeFileSync(filePath, stateData);

  // If this is admin, also save as auth.json for backward compatibility
  if (stateFileName === "admin.json") {
    fs.writeFileSync(path.join(authDir, "auth.json"), stateData);
  }
}

setup("authenticate as admin", async ({ page }) => {
  await loginAndSaveState(page, "admin@example.com", "Password123!", "admin.json");
});

setup("authenticate as manager", async ({ page }) => {
  await loginAndSaveState(page, "manager@example.com", "Password123!", "manager.json");
});

setup("authenticate as member", async ({ page }) => {
  await loginAndSaveState(page, "member@example.com", "Password123!", "member.json");
});

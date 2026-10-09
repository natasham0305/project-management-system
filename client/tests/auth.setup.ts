import { test as setup, expect, Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import {
  TEST_EMAIL_ADMIN,
  TEST_EMAIL_MANAGER,
  TEST_EMAIL_MEMBER,
  TEST_PASSWORD,
} from "./testData/credentials";

const authDir = path.resolve("tests/auth");

// Helper to log in a user and persist their cookie session to a file
async function loginAndSaveState(
  page: Page,
  email: string,
  password: string,
  stateFileName: string,
) {
  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/dashboard/);

  const filePath = path.join(authDir, stateFileName);
  const storageState = await page.context().storageState();
  const sessionStorage = await page.evaluate(() => ({
    user: window.sessionStorage.getItem("user") || "",
  }));

  fs.mkdirSync(authDir, { recursive: true });
  fs.writeFileSync(
    filePath,
    JSON.stringify({ ...storageState, sessionStorage }, null, 2),
  );

  // If this is admin, also save as auth.json for backward compatibility
  if (stateFileName === "admin.json") {
    fs.writeFileSync(
      path.join(authDir, "auth.json"),
      JSON.stringify({ ...storageState, sessionStorage }, null, 2),
    );
  }
}

setup("authenticate as admin", async ({ page }) => {
  await loginAndSaveState(page, TEST_EMAIL_ADMIN, TEST_PASSWORD, "admin.json");
});

setup("authenticate as manager", async ({ page }) => {
  await loginAndSaveState(
    page,
    TEST_EMAIL_MANAGER,
    TEST_PASSWORD,
    "manager.json",
  );
});

setup("authenticate as member", async ({ page }) => {
  await loginAndSaveState(
    page,
    TEST_EMAIL_MEMBER,
    TEST_PASSWORD,
    "member.json",
  );
});

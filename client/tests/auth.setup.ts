import { test as setup, expect } from "@playwright/test";

const authFile = "tests/auth/auth.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");

  await page.locator("#email").fill(process.env.TEST_EMAIL!);
  await page.locator("#password").fill(process.env.TEST_PASSWORD!);

  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/dashboard/);

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

  await page.context().storageState({
    path: authFile,
  });

  const fs = await import("fs");

  fs.writeFileSync(
    authFile,
    JSON.stringify({
      cookies: [],
      origins: [
        {
          origin: "http://localhost:5173",
          localStorage: [],
        },
      ],
      sessionStorage,
    }),
  );
});

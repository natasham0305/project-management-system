import { test, expect } from "./fixtures/test";
// import { LoginPage } from "./pages/LoginPage";

//   await expect(page.locator("#email")).toBeVisible();
//   await expect(page.locator("#password")).toBeVisible();
//   await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

test("user can login with valid credentials", async ({ loginPage }) => {
  // const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);
  // await page.goto("/login");
  // await page.getByLabel("Email address").fill(process.env.TEST_EMAIL!);
  // await page.locator("#password").fill(process.env.TEST_PASSWORD!);
  // await page.getByRole("button", { name: "Sign in" }).click();
  await loginPage.isOnDashboard();
});

test("user cannot login with invalid password", async ({ loginPage }) => {
  await loginPage.open();
  await loginPage.login(process.env.TEST_EMAIL!, "invalidPass");
  await expect(loginPage.errorMessage).toBeVisible();
});

test("user cannot login with empty email", async ({ loginPage }) => {
  await loginPage.open();
  await loginPage.login("", process.env.TEST_PASSWORD!);
  await expect(loginPage.errorMessage).toBeVisible();
});

test("user cannot login with empty password", async ({ loginPage }) => {
  await loginPage.open();
  await loginPage.login(process.env.TEST_EMAIL!, "");
  await expect(loginPage.errorMessage).toBeVisible();
});

test("user cannot login with empty email and password", async ({
  loginPage,
}) => {
  await loginPage.open();
  // await loginPage.emailInput.fill("");
  // await loginPage.passwordInput.fill("");
  // await loginPage.signInButton.click();
  await loginPage.login("", "");
  await expect(loginPage.errorMessage).toBeVisible();
});

test("forgot password shows not available message", async ({ loginPage }) => {
  await loginPage.open();
  await loginPage.forgotPasswordButton.click();
  await expect(loginPage.errorMessage).toBeVisible();
});

test("user can navigate to registration page", async ({ loginPage }) => {
  await loginPage.open();
  await loginPage.registerLink.click();
  await loginPage.isOnRegister();
});

// import { test, expect } from "@playwright/test";

// test("user can open login page", async ({ page }) => {
//   await page.goto("http://localhost:5173/login");

//   await expect(page.locator("#email")).toBeVisible();
//   await expect(page.locator("#password")).toBeVisible();
//   await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
// });

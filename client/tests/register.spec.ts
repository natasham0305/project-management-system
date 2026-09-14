import { test, expect } from "./fixtures/test";
// import { LoginPage } from "./pages/LoginPage";

test("user can create an account with valid details", async ({
  registerPage,
}) => {
  await registerPage.open();

  await registerPage.register(
    "testuser123",
    `testuser_${Date.now()}@example.com`,
    "Password123!",
    "Password123!",
  );

  await expect(registerPage.successMessage).toHaveText(
    "✓Account created successfully. Redirecting to login...",
  );
});

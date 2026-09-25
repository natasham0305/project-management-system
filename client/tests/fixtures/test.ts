import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ProjectsPage } from "../pages/ProjectsPage";

type TestFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  projectsPage: ProjectsPage;
  authenticatedPage: void;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await use(registerPage);
  },
  projectsPage: async ({ page }, use) => {
    const projectsPage = new ProjectsPage(page);
    await use(projectsPage);
  },

  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();

    await loginPage.login(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);

    await loginPage.isOnDashboard();

    await use();
  },
});

export { expect } from "@playwright/test";

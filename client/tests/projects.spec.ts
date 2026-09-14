import { test, expect } from "./fixtures/test";
import { restoreSession } from "./helpers/auth";

test("authenticated user can open projects page", async ({
  page,
  projectsPage,
}) => {
  await restoreSession(page.context());

  await projectsPage.open();

  await projectsPage.isOnProjectsPage();

  await expect(projectsPage.pageTitle).toHaveText("Projects");
});

test("user can create a project", async ({ page, projectsPage }) => {
  await restoreSession(page.context());

  await projectsPage.open();

  const projectName = `Automation Project ${Date.now()}`;

  const managerOption = projectsPage.managerSelect
    .locator("option")
    .filter({ hasNotText: "Select a manager" })
    .first();

  const managerId = await managerOption.getAttribute("value");

  expect(managerId).not.toBeNull();

  await projectsPage.createProject(
    projectName,
    "Project created by Playwright",
    "High",
    "Planning",
    managerId!,
  );

  const createdProject = page
    .locator(".project-card")
    .filter({ hasText: projectName });

  await expect(createdProject).toBeVisible();
});

test("project name is required", async ({ page, projectsPage }) => {
  await restoreSession(page.context());

  await projectsPage.open();

  await projectsPage.createProject(
    "",
    "Project without a name",
    "Medium",
    "Planning",
  );

  await expect(projectsPage.errorMessage).toHaveText(
    "Project name is required",
  );
});

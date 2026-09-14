import { Locator, Page } from "@playwright/test";

export class ProjectsPage {
  private page: Page;

  projectNameInput: Locator;
  descriptionInput: Locator;
  prioritySelect: Locator;
  statusSelect: Locator;
  createProjectButton: Locator;
  projectCards: Locator;
  errorMessage: Locator;
  pageTitle: Locator;
  managerSelect: Locator;

  constructor(page: Page) {
    this.page = page;

    this.projectNameInput = this.page.locator('input[name="name"]');
    this.descriptionInput = this.page.locator('textarea[name="description"]');
    this.prioritySelect = this.page.locator('select[name="priority"]');
    this.statusSelect = this.page.locator('select[name="status"]');
    this.createProjectButton = this.page.getByRole("button", {
      name: "Create Project",
    });
    this.projectCards = this.page.locator(".project-card");
    this.errorMessage = this.page.locator(".form-error");
    this.pageTitle = this.page.getByRole("heading", {
      name: "Projects",
      level: 1,
    });
    this.managerSelect = this.page.locator("#manager_id");
  }

  async open() {
    await this.page.goto("/projects");
  }

  async createProject(
    name: string,
    description: string,
    priority: string = "Medium",
    status: string = "Planning",
    managerId?: string,
  ) {
    await this.projectNameInput.fill(name);
    if (managerId) {
      await this.managerSelect.selectOption(managerId);
    }
    await this.descriptionInput.fill(description);
    await this.prioritySelect.selectOption(priority);
    await this.statusSelect.selectOption(status);
    await this.createProjectButton.click();
  }

  async isOnProjectsPage() {
    await this.page.waitForURL(/projects/);
  }
}

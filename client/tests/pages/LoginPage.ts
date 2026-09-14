import { Locator, Page } from "@playwright/test";

export class LoginPage {
  private page: Page;

  emailInput: Locator;
  passwordInput: Locator;
  signInButton: Locator;
  forgotPasswordButton: Locator;
  registerLink: Locator;
  errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = this.page.getByLabel("Email address");
    this.passwordInput = this.page.locator("#password");
    this.signInButton = this.page.getByRole("button", { name: "Sign in" });
    this.forgotPasswordButton = this.page.getByRole("button", {
      name: "Forgot password?",
    });
    this.registerLink = this.page.getByRole("link", {
      name: "Create an account",
    });
    this.errorMessage = this.page.locator(".auth-error");
  }

  async open() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async isOnDashboard() {
    await this.page.waitForURL(/dashboard/);
  }

  async isOnRegister() {
    await this.page.waitForURL(/register/);
  }
}

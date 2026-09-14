import { Page, Locator } from "@playwright/test";

export class RegisterPage {
  private page: Page;

  usernameInput: Locator;
  emailInput: Locator;
  passwordInput: Locator;
  confirmPasswordInput: Locator;
  createAccountButton: Locator;
  signInLink: Locator;
  errorMessage: Locator;
  successMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.usernameInput = this.page.locator("#username");

    this.emailInput = this.page.locator("#register-email");

    this.passwordInput = this.page.locator("#register-password");

    this.confirmPasswordInput = this.page.locator("#confirm-password");

    this.createAccountButton = this.page.getByRole("button", {
      name: "Create account",
    });

    this.signInLink = this.page.getByRole("link", {
      name: "Sign in",
    });

    this.errorMessage = this.page.locator(".auth-error");

    this.successMessage = this.page.locator(".auth-success");
  }

  async open() {
    await this.page.goto("/register");
  }

  async register(
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);

    await this.createAccountButton.click();
  }

  async goToLogin() {
    await this.signInLink.click();
  }
}

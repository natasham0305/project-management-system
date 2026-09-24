import { BrowserContext } from "@playwright/test";
import fs from "fs";

export async function restoreSession(
  context: BrowserContext,
  role: "admin" | "manager" | "member" = "admin"
) {
  const auth = JSON.parse(fs.readFileSync(`tests/auth/${role}.json`, "utf-8"));

  await context.addInitScript((sessionStorage) => {
    for (const [key, value] of Object.entries(sessionStorage)) {
      window.sessionStorage.setItem(key, value as string);
    }
  }, auth.sessionStorage);
}

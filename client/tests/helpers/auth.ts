import { BrowserContext } from "@playwright/test";
import fs from "fs";

export async function restoreSession(context: BrowserContext) {
  const auth = JSON.parse(fs.readFileSync("tests/auth/auth.json", "utf-8"));

  await context.addInitScript((sessionStorage) => {
    for (const [key, value] of Object.entries(sessionStorage)) {
      window.sessionStorage.setItem(key, value as string);
    }
  }, auth.sessionStorage);
}

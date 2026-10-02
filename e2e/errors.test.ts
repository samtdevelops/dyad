import { expect, test } from "@playwright/test";

test("an unknown URL shows the not-found page with a 404", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading")).toHaveText("Page not found");
});

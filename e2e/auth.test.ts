import { expect, type Page, test } from "@playwright/test";

const password = "password123";

// Unique per test so tests can run in parallel against a shared database
function uniqueEmail() {
  return `e2e-${crypto.randomUUID()}@example.com`;
}

async function signUp(page: Page, name: string, email: string) {
  await page.goto("/signup");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();
}

test("redirects signed-out visitors from the dashboard to login", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL("/login");
});

test("sign up, sign out and sign back in", async ({ page }) => {
  const email = uniqueEmail();

  await signUp(page, "Test User", email);
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByRole("heading")).toHaveText("Welcome, Test User");
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/login");
  await page.goto("/dashboard");
  await expect(page).toHaveURL("/login");

  await page.getByLabel("Email").fill(email.toUpperCase());
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/dashboard");
});

test("redirects signed-in users away from login and signup", async ({
  page,
}) => {
  await signUp(page, "Test User", uniqueEmail());
  await expect(page).toHaveURL("/dashboard");

  for (const path of ["/login", "/signup"]) {
    await page.goto(path);
    await expect(page).toHaveURL("/dashboard");
  }
});

test("shows validation errors and keeps entered values", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByLabel("Password").fill("short");
  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(page.getByText("Name is required")).toBeVisible();
  await expect(page.getByText("Enter a valid email")).toBeVisible();
  await expect(
    page.getByText("Password must be at least 8 characters"),
  ).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveValue("not-an-email");
});

test("rejects a duplicate email on sign up", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, "First", email);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/login");

  await signUp(page, "Second", email);
  await expect(
    page.getByText("An account with this email already exists"),
  ).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page).toHaveURL("/signup");
});

test("shows a generic error for a wrong password", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, "Test User", email);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/login");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Invalid email or password")).toBeVisible();
  await expect(page).toHaveURL("/login");
});

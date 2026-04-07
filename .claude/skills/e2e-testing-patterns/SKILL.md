---
name: e2e-testing-patterns
description: "E2E testing patterns: Playwright best practices, reliable suites."
---

# E2E Testing Patterns

Build reliable, fast, and maintainable end-to-end test suites that provide confidence to ship code quickly and catch regressions before users do.

## When to Use This Skill

- Implementing end-to-end test automation
- Debugging flaky or unreliable tests
- Testing critical user workflows
- Setting up CI/CD test pipelines
- Testing across multiple browsers
- Validating accessibility requirements
- Testing responsive designs
- Establishing E2E testing standards

## Core Concepts

### What to Test with E2E

- Critical user journeys (login, checkout, signup)
- Complex interactions (drag-and-drop, multi-step forms)
- Cross-browser compatibility
- Real API integration
- Authentication flows

### What NOT to Test with E2E

- Unit-level logic (use unit tests)
- API contracts (use integration tests)
- Edge cases (too slow)
- Internal implementation details

### Test Philosophy

```
        /\
       /E2E\         ← Few, focused on critical paths
      /─────\
     /Integr\        ← More, test component interactions
    /────────\
   /Unit Tests\      ← Many, fast, isolated
  /────────────\
```

## Playwright Patterns

### Setup and Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["junit", { outputFile: "results.xml" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
```

### Pattern 1: Page Object Model

```typescript
// pages/LoginPage.ts
import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.errorMessage = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

// Test using Page Object
import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

test("successful login", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("user@example.com", "password123");
  await expect(page).toHaveURL("/dashboard");
});
```

### Pattern 2: Fixtures for Test Data

```typescript
import { test as base } from "@playwright/test";

type TestData = {
  testUser: { email: string; password: string; name: string };
};

export const test = base.extend<TestData>({
  testUser: async ({}, use) => {
    const user = {
      email: `test-${Date.now()}@example.com`,
      password: "Test123!@#",
      name: "Test User",
    };
    await createTestUser(user);
    await use(user);
    await deleteTestUser(user.email);
  },
});
```

### Pattern 3: Waiting Strategies

```typescript
// ❌ Bad: Fixed timeouts
await page.waitForTimeout(3000); // Flaky!

// ✅ Good: Wait for specific conditions
await page.waitForLoadState("networkidle");
await page.waitForURL("/dashboard");

// ✅ Better: Auto-waiting with assertions
await expect(page.getByText("Welcome")).toBeVisible();
await expect(page.getByRole("button", { name: "Submit" })).toBeEnabled();

// Wait for API response
const responsePromise = page.waitForResponse(
  (response) =>
    response.url().includes("/api/users") && response.status() === 200,
);
await page.getByRole("button", { name: "Load Users" }).click();
const response = await responsePromise;
```

### Pattern 4: Network Mocking and Interception

```typescript
test("displays error when API fails", async ({ page }) => {
  await page.route("**/api/users", (route) => {
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Internal Server Error" }),
    });
  });

  await page.goto("/users");
  await expect(page.getByText("Failed to load users")).toBeVisible();
});
```

### Pattern 5: Accessibility Testing

```typescript
import AxeBuilder from "@axe-core/playwright";

test("page should not have accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .exclude("#third-party-widget")
    .analyze();
  expect(results.violations).toEqual([]);
});
```

## Best Practices

1. **Use Data Attributes**: `data-testid` for stable selectors
2. **Avoid Brittle Selectors**: Don't rely on CSS classes or DOM structure
3. **Test User Behavior**: Click, type, see - not implementation details
4. **Keep Tests Independent**: Each test should run in isolation
5. **Clean Up Test Data**: Create and destroy test data in each test
6. **Use Page Objects**: Encapsulate page logic
7. **Meaningful Assertions**: Check actual user-visible behavior
8. **Optimize for Speed**: Mock when possible, parallel execution

```typescript
// ❌ Bad selectors
cy.get(".btn.btn-primary.submit-button").click();

// ✅ Good selectors
page.getByRole("button", { name: "Submit" }).click();
page.getByLabel("Email address").fill("user@example.com");
page.locator('[data-testid="email-input"]').fill("user@example.com");
```

## Common Pitfalls

- **Flaky Tests**: Use proper waits, not fixed timeouts
- **Slow Tests**: Mock external APIs, use parallel execution
- **Over-Testing**: Don't test every edge case with E2E
- **Coupled Tests**: Tests should not depend on each other
- **Poor Selectors**: Avoid CSS classes and nth-child
- **No Cleanup**: Clean up test data after each test

## Debugging Failing Tests

```typescript
// 1. Run in headed mode
// npx playwright test --headed

// 2. Run in debug mode
// npx playwright test --debug

// 3. Use trace viewer
await page.screenshot({ path: 'screenshot.png' });

// 4. Add test.step for better reporting
test('checkout flow', async ({ page }) => {
    await test.step('Add item to cart', async () => {
        await page.goto('/products');
        await page.getByRole('button', { name: 'Add to Cart' }).click();
    });

    await test.step('Proceed to checkout', async () => {
        await page.goto('/cart');
        await page.getByRole('button', { name: 'Checkout' }).click();
    });
});

// 5. Inspect page state
await page.pause();  // Pauses execution, opens inspector
```

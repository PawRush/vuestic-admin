# End-to-End Testing with Playwright

This project uses **Playwright** for end-to-end (E2E) testing.
Test files live in the `e2e/tests` folder, with configuration at the project root.

---

## Project Setup

### 1. GitHub Actions (CI)

CI is configured in: `.github/workflows/playwright.yml`

The workflow is triggered manually.
You can provide:

- **Baseline URL** – used to generate reference snapshots (default: `https://admin-demo.vuestic.dev`).
- **Target URL** – Netlify (or other) build URL to run tests against (required).

The workflow runs tests and uploads the Playwright HTML report as a GitHub Artifact, which can be downloaded and inspected locally.

### 2. Available Scripts

```bash
yarn test:e2e           # Run all tests
yarn test:e2e:ui        # Run tests with Playwright UI
yarn test:e2e:headed    # Run tests in headed browser mode
yarn test:e2e:report    # Show the HTML report
```

---

## Configuration

All configuration is stored in: `playwright.config.ts` (project root)

Here you can customize:

- Paths – where snapshots, reports, and test results are stored.
- Snapshot Ratio – the allowed percent difference for visual comparisons.
- Timeouts – global test and assertion timeouts.

If you want to store baseline screenshots in the repository, we recommend adding a `.gitattributes` file to enforce consistent handling of binary files.

---

## API Stubs and Mocks

The `e2e` project includes stubs for API requests.
These allow you to intercept, control, and replace backend requests with mocks during testing.

---

## CI Workflow Details

- Generate/Update Baseline: snapshots are created against the baseline URL.
- Run Tests: tests are executed against the target URL (e.g., a Netlify preview build).
- Artifacts: Playwright reports are uploaded as GitHub Artifacts and can be downloaded for local review.

---

## Local Usage

Step 1:
Generate baseline screenshots: `BASE_URL=https://admin-demo.vuestic.dev yarn test:e2e --update-snapshots`

Step 2:
Build and run project locally: `yarn build:ci && yarn start:ci`
// Use correct API base url in .env
To run tests locally: `yarn test:e2e`

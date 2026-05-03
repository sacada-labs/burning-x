# Agent Instructions

## Package Manager

This project uses **Bun** as its package manager. Use `bun` instead of `npm`, `yarn`, or `pnpm`.

## shadcn/ui Components

Use the latest version of Shadcn to install new components. For example, to add a button component:

```bash
bunx shadcn@latest add button
```

## Tech Stack

- **Framework**: TanStack Start (full-stack React with SSR)
- **Router**: TanStack Router (file-based routing in `src/routes/`)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style)
- **Database**: SQLite with Drizzle ORM (`better-sqlite3`)
- **Auth**: Better Auth
- **Forms**: TanStack Form with Zod validation
- **Data Fetching**: TanStack Query + `createServerFn`
- **Build Tool**: Vite 8
- **Lint/Format**: Biome

## Running the App

```bash
bun dev          # Development server on port 3000
bun build        # Production build
bun preview      # Preview production build
bun test         # Run tests (Vitest)
```

## Database Commands

```bash
bun db:generate  # Generate Drizzle migrations
bun db:migrate   # Run migrations
bun db:push      # Push schema changes
bun db:studio    # Open Drizzle Studio
```

## Code Style

- **Formatting is handled by Biome** (`biome.json` enforces tabs and double quotes). Run `bun format` to auto-format.
- Follow existing patterns in the codebase.
- Make minimal changes to achieve the goal.

---

# App Architecture & Decisions

## Core UX Philosophy

- **Logged-in only**: Every route except `/`, `/auth`, and `/about` requires authentication. Unauthenticated users are redirected to `/auth`.
- **Onboarding gate**: New users are redirected to `/onboarding` after signup to collect profile data (birth year, gender, weight, height) before accessing the app.
- **Ultra-simple workout tracking**: No workout detail pages, no "Start" buttons, no timers. Just click a row and mark it done.
- **Mobile-first PWA**: Bottom nav on mobile (Home, Plans, Schedule, History). Desktop header has the same nav links plus theme toggle and user menu.
- **No breadcrumbs on mobile**: Mobile uses a simple `< Back` link pattern. Desktop uses aligned breadcrumbs.

## Navigation Structure

| Tab | Route | Desktop | Mobile |
|-----|-------|---------|--------|
| Dashboard | `/` | Header nav | Bottom nav |
| Plans | `/plans` | Header nav | Bottom nav |
| Plan Detail | `/plans/$planId` | Hidden | Back button |
| Schedule | `/schedule` | Header nav | Bottom nav |
| History | `/history` | Header nav | Bottom nav |
| Auth | `/auth` | Hidden | Hidden |
| Settings | `/settings` | Header nav | Bottom nav |
| About | `/about` | Footer link | Hidden |

## Workout Tracking (Simplified)

- Schedule rows are **clickable divs** (not buttons) with `role="button"` for accessibility.
- Clicking a row opens an inline effort selector: `[Easy] [Moderate] [Hard] [Just Done]`.
- Clicking the same row again **closes** the selector.
- **Rest days are not clickable**.
- Completed rows can be clicked to **change effort** or **undo completion**.
- No auto-mark-as-done. No notes. No separate workout detail screen.
- Effort is optional — "Just Done" marks complete without effort.

## Plan Enrollment Flow

1. User clicks "Start This Plan" on a plan detail page.
2. **Fitness Assessment modal** opens with:
   - Training days per week selector: `[2 days] [3 days] [4 days]`
   - Checkboxes: can run 2K/5K/10K nonstop, 5K under 30min
   - Weekly mileage input
3. Assessment derives a `fitness_level` (beginner/intermediate/advanced).
4. Max **2 concurrent active plans** enforced.
5. User can **unenroll** from any active plan at any time.

## Dashboard Design

- **Next Workout** card is always at the top.
- When all workouts are complete, a **Plan Complete** celebration banner replaces the Next Workout card.
- Stats cards: **Overall Progress** (%), **Distance** (total KM run), **Calories** (estimated burned).
- **No "View Full Schedule" button** — redundant with bottom nav.
- User's name displayed below "Dashboard" heading.

## Data Display Rules

- Distance: always shown as `5K`, `3.5K`, etc. (use `toFixed(1)` for decimals).
- Duration: always shown as `25min` (not `25m`).
- Pace: calculated as `min/km` when both distance and duration exist.
- Schedule row titles are generated as `{distance}K {type} / {duration}min / {pace}` (e.g., `5K easy / 25min / 5:00`).
- Rest days show "Rest Day".

## Color System

- Uses CSS custom properties defined in `src/styles.css`:
  - `--background`, `--foreground`, `--primary`, `--primary-foreground`
  - `--muted`, `--muted-foreground`, `--secondary`, `--border`, `--accent`
- **Never hardcode Tailwind neutral colors** like `bg-gray-100` or `text-gray-500`. Always use `bg-[var(--muted)]` or `text-[var(--muted-foreground)]`.
- Success states: `text-green-600 dark:text-green-400` for icons, `text-green-700 dark:text-green-400` for text.
- Destructive states: `text-red-600 dark:text-red-400`.

## Database Schema Notes

- `user_plans` has `trainingDaysPerWeek` (default 3) and `fitnessLevel`.
- `workout_completions` stores `effortFeedback` only (easy/moderate/hard). No notes, no actual data.
- `plan_assessments` stores the pre-enrollment fitness answers.
- No DB-level foreign keys (Drizzle relations only). Handle referential integrity in code.

## Server Functions Pattern

- All data fetching uses `createServerFn` from `@tanstack/react-start`.
- `.inputValidator()` is used for input validation (not `.validator()`).
- Auth checks in loaders use `getAuthSession()` (server-side). Never use `authClient.getSession()` in loaders.
- Client components use `authClient.useSession()` for reactive session state.

## Seeding

- Training plans and workouts are seeded via `scripts/seed-plans.ts`.
- Re-seeding updates existing plans by deleting old workouts and re-inserting with auto-generated titles.
- Run with: `npx tsx scripts/seed-plans.ts`

## Auth Setup

### Google OAuth
- Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local`.
- In Google Cloud Console, create an OAuth 2.0 Client ID (Web application).
- Set the authorized redirect URI to `http://localhost:3000/api/auth/callback/google` (or your production domain).
- Better Auth handles the rest via `socialProviders.google` in `src/lib/auth.ts`.

## Docker Deployment

The app ships with a production-ready `Dockerfile`. No `docker-compose.yml` is needed — platforms like **Coolify** read the `Dockerfile` directly and manage the container lifecycle.

### How it works
- Multi-stage build: installs deps (with native module build tools), builds the app, then copies only the output to a slim production image.
- SQLite database lives at `/data/prod.db` via a Docker volume mount on `/data`.
- Healthcheck pings `http://localhost:3000` every 30s.
- Default command: `bun run .output/server/index.mjs`.

### Required environment variables (runtime)
Set these in your platform's UI (e.g., Coolify → Environment Variables):

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | Yes | Auth signing key |
| `BETTER_AUTH_URL` | Yes | Public origin of your app |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `DATABASE_URL` | No | Defaults to `/data/prod.db` |
| `PORT` | No | Defaults to `3000` |
| `VITE_POSTHOG_KEY` | No | PostHog project key (optional) |

### Volume mount
Mount a persistent volume to `/data` so the SQLite database survives container restarts and redeploys.

### First deploy / migrations
On first deploy, run migrations manually (or override the startup command temporarily):
```bash
bun run db:migrate
```
After that, the database file persists in the volume.

### Optional: auto-migrations on startup
If you want migrations to run automatically on every container start, override the command in your platform to use `scripts/docker-start.sh` instead of the default `CMD`.

## Native APK via Capacitor

The app is wrapped as a native Android APK using **Capacitor**. The APK loads the web app from your deployed backend URL (it does not bundle the full frontend — this avoids SSR/static build complexity and keeps the APK small).

### Architecture
- The APK is a thin native shell with a WebView.
- On launch, it loads the web app from the URL configured in `capacitor.config.ts`.
- All server functions, auth, and data work exactly as they do in the browser.
- The app requires an internet connection.

### Building the APK locally

```bash
# 1. Set your deployed backend URL
export CAPACITOR_SERVER_URL=https://your-domain.com

# 2. Sync Capacitor config (regenerates android/ with the URL)
bunx cap sync

# 3. Build the release APK
cd android && ./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### F-Droid compliance
- **No proprietary dependencies**: Google Play Services, Firebase, and Crashlytics are removed.
- The `android/` directory is committed to the repo so F-Droid can build from it directly.
- `android:usesCleartextTraffic="false"` enforces HTTPS.

## F-Droid Store

### Prerequisites
- Open-source license file in repo root (`LICENSE`) — ✅ MIT license included.
- No proprietary dependencies (Firebase, Play Services, etc.) — ✅ removed from Android build.
- `android/` directory committed to the repo — ✅ included.
- Fastlane metadata in `fastlane/metadata/android/en-US/` — ✅ included.

### Fastlane metadata
Store listing metadata lives in `fastlane/metadata/android/en-US/`:
- `title.txt` — app name
- `short_description.txt` — <80 chars
- `full_description.txt` — full store listing (HTML allowed)
- `images/icon.png` — app icon (512x512px recommended)
- `images/phoneScreenshots/` — at least 2 screenshots
- `changelogs/<versionCode>.txt` — per-version changelog

### Submission workflow

**Step 1 — Tag a release**
```bash
git tag v1.0.0
git push origin v1.0.0
```
This triggers the GitHub Actions APK build and attaches it to the release (for your own distribution, not for F-Droid).

**Step 2 — Fork F-Droid data repo**
Go to https://gitlab.com/fdroid/fdroiddata and fork it.

**Step 3 — Create the metadata file**
In your fork, create `metadata/dev.burningx.app.yml`. A reference copy lives in this repo at `fdroid-metadata/dev.burningx.app.yml`:

```yaml
Categories:
  - Sports & Health
License: MIT
SourceCode: https://github.com/sacada-labs/burning-x

RepoType: git
Repo: https://github.com/sacada-labs/burning-x.git

Builds:
  - versionName: '1.0.0'
    versionCode: 1
    commit: v1.0.0
    subdir: android/app
    init:
      - cd ../..
      - bun install --frozen-lockfile
      - bunx cap sync
    gradle:
      - yes
    scandelete:
      - node_modules/

AutoUpdateMode: Version
UpdateCheckMode: Tags
```

**Step 4 — Open a Merge Request**
Commit the YAML file and open an MR to `gitlab.com/fdroid/fdroiddata`.

**Step 5 — Wait for review**
F-Droid maintainers will review your MR, verify the build works on their servers, and merge it. Your app appears on f-droid.org within 24-48 hours after merge.

### How F-Droid updates work
F-Droid's bot (`fdroid checkupdates`) scans your repo for new tags daily. When it finds a new `v*` tag with an incremented `versionCode` in `android/app/build.gradle`, it automatically opens an update MR. No action needed from you.

### Important notes
- F-Droid builds from source on their own servers. They do not use your Docker image, GitHub Actions APK, or any prebuilt binaries.
- The `versionCode` in `android/app/build.gradle` must be incremented for every release, or F-Droid will skip the update.
- The `commit:` field in the metadata must match the exact git tag or commit hash.

## CI / GitHub Actions

The `.github/workflows/apk.yml` workflow builds the Android APK and attaches it to GitHub Releases. It triggers only on version tags (`v*`).

### What it does
1. Sets up Bun, JDK 21, and Android SDK
2. Writes `capacitor.config.ts` with `CAPACITOR_SERVER_URL` from repository variables
3. Runs `bunx cap sync` to populate the Android project
4. Builds the release APK with Gradle (`./gradlew assembleRelease`)
5. Attaches `burning-x-v1.0.0.apk` to the GitHub Release with auto-generated notes

### What it does NOT do
- **No Docker image build.** Coolify builds directly from the `Dockerfile` in the repo. No GHCR or container registry is needed.
- **No F-Droid build.** F-Droid has its own build servers. They clone your repo and build the APK themselves. This workflow is only for your own convenience (direct downloads from GitHub Releases).

### Required GitHub configuration
- **Repository variable**: `CAPACITOR_SERVER_URL` — your deployed backend URL (e.g. `https://burningx.yourdomain.com`)
- **Secret**: `GITHUB_TOKEN` (provided automatically)

## Build Checklist

Before committing, always:
1. `bun run build` — must pass with no errors
2. `bun format --write <changed-files>` — auto-format with Biome
3. `bun db:push` — if schema changed, push to DB
4. `npx tsx scripts/seed-plans.ts` — if seed data changed

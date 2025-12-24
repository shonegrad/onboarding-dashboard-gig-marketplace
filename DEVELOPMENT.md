# Development Rules & Operational Procedures

> **STOP! READ THIS BEFORE STARTING WORK.**
> These rules are non-negotiable. They must be followed on every session, every code change, and every deploy.

## SECTION A: Project Metadata

- **Project name**: `onboarding-dashboard-gig-marketplace`
- **Primary repo**: [https://github.com/shonegrad/onboarding-dashboard-gig-marketplace.git](https://github.com/shonegrad/onboarding-dashboard-gig-marketplace.git)
- **Default branch**: `master` (Current working feature branch: `ui-mui-rebuild`)
- **Deployment**: GitHub Pages via `gh-pages` branch
- **Live URL**: [https://shonegrad.github.io/onboarding-dashboard-gig-marketplace/](https://shonegrad.github.io/onboarding-dashboard-gig-marketplace/)
- **Local dev URL**: [http://localhost:3000](http://localhost:3000)

---

## SECTION B: Always-Run Checklist (every session)

1. [ ] **Verify repo + remote**:

   ```bash
   git status
   git remote -v
   ```

2. [ ] **Check if app is already running**:
   - Check port 3000: `lsof -i :3000`
   - If running, **reuse that instance**. Do NOT start a new one.
3. [ ] **Reuse existing browser tab**:
   - Look for the tab Open at `http://localhost:3000`. Reload it.
   - Do NOT open a new tab unless necessary.
4. [ ] **Confirm current version is correct**:
   - Check `package.json` version.
   - Check `src/version.ts` version.
   - Check UI footer/settings for matching version.
5. [ ] **Make changes**.
6. [ ] **Validate**:

   ```bash
   npm run build
   ```

7. [ ] **Commit + push + deploy** (when requested).
8. [ ] **Verify live version matches**.

---

## SECTION C: Prereqs (non-negotiable)

- This repo **must** use git from day one.
- GitHub must be connected to the user account `shonegrad`.
- Origin remote **must** point to the primary repo listed in Section A.
- GitHub Pages deployment **must** be configured using the `gh-pages` branch.
- Deployment method: The `gh-pages` npm package is used via the `npm run deploy` script.

---

## SECTION D: Port and process hygiene (no duplicates)

**Rule**: Before starting any dev server, you must check for existing processes.

1. **Check for listening ports**:

   ```bash
   # MacOS / Linux
   lsof -i :3000
   # or generally
   lsof -i -P -n | grep LISTEN
   ```

2. **If a process is found**:
   - **Reuse it**: Bring the existing terminal to the foreground.
   - **Kill it (only if stuck)**:

     ```bash
     kill <PID>
     # Force kill if needed
     kill -9 <PID>
     ```

3. **Do not start a second instance** on a different port (e.g., 3001) just because 3000 is taken. cleanliness is paramount.

---

## SECTION E: Browser hygiene (reuse tabs)

**Rule**: Minimize browser tab clutter.

- **Always check** if `http://localhost:3000` (or the Live URL) is already open.
- **Reuse the existing tab**. Refresh it (`Cmd+R` / `F5`).
- **Only open a new tab if**:
  - You are testing a specific separate environment (e.g., comparing Local vs Live).
  - The URL has changed significantly and requires a fresh start.
  - The existing tab is frozen/unresponsive.

---

## SECTION F: Versioning system (single source of truth)

**Rule**: Use SemVer MAJOR.MINOR.PATCH.

- **Primary Source**: `package.json` (`version` field).
- **Code Source**: `src/version.ts` (`APP_VERSION` constant).
- **UI Display**: The app visible prints the version in the `NavDrawer` (Sidebar) footer or Settings.

**Sync Rule**:
When updating the version, you **MUST** update both:

1. `package.json`
2. `src/version.ts`

Verification:

- Local working copy `package.json` must match `src/version.ts`.
- The deployed UI must show the version matching the git tag/commit.

---

## SECTION G: Validation rules (never deploy broken builds)

**Rule**: Never commit broken code to the deployment branch.

Before committing or deploying:

- **Validation Command**:

  ```bash
  npm run build
  ```

- If this fails, **STOP**. Fix the errors. Do not deploy.

---

## SECTION H: Commit + push + deploy workflow

Whenever a change should be published, follow this **strict order**:

1. **Update version** (if applicable):
   - Bump `package.json` and `src/version.ts`.
2. **Validate**:
   - Run `npm run build`. Ensure it passes.
3. **Git Sanity Check**:
   - `git status`: Confirm you are on the correct branch and only intended files are staged.
4. **Commit**:
   - `git commit -m "feat: description of change"`
5. **Push**:
   - `git push origin <branch>`
6. **Deploy**:
   - `npm run deploy`
   - This script runs the build again and pushes to `gh-pages`.
7. **Verify**:
   - Visit [Live URL](https://shonegrad.github.io/onboarding-dashboard-gig-marketplace/).
   - Refresh.
   - Check the version number in the UI.

**Blocking Rules**:

- If working tree is dirty -> **Block deploy**. Commit first.
- If deployment fails -> **Record error** in Troubleshooting.

---

## SECTION I: Smart additions

- **Release Tags**:

  ```bash
  git tag v0.3.0
  git push --tags
  ```

- **CHANGELOG**:
  - Maintain a `CHANGELOG.md` (or simply clean commit history) with one entry per version bump.
- **Single Deploy Command**:
  - Use `npm run deploy`.
- **Post-Deploy Verification**:
  - Load the live URL.
  - Confirm version matches.

---

## SECTION J: Troubleshooting / Known Issues

### Deployment Failures

- **Symptom**: `gh-pages` fails to push.
- **Fix**: Check internet connection. Ensure you have permissions. Ensure `build` directory exists (run `npm run build` manually).

### Port Conflicts

- **Symptom**: `EADDRINUSE: address already in use :::3000`
- **Fix**: Run `lsof -i :3000` to find the PID, then `kill <PID>`.

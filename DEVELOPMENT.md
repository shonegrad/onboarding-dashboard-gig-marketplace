# Development Rules for Agents

> File purpose: Operational rules for development, versioning, and deployment.
> These instructions are designed for humans and agents. Follow them every session.

## Project Metadata

- **Project name:** Onboarding Dashboard for Gig Marketplace
- **Primary repo:** https://github.com/shonegrad/onboarding-dashboard-gig-marketplace
- **Default branch:** master
- **Deployment:** GitHub Pages via gh-pages branch
- **Live URL:** https://shonegrad.github.io/onboarding-dashboard-gig-marketplace/
- **Local dev URL:** http://localhost:3000

---

## Always-Run Checklist (every session)

1. Verify repo + remote (`git status`, `git remote -v`)
2. Check if app is already running (ports/processes)
3. Reuse existing browser tab if available
4. Confirm current version is correct (local + UI)
5. Make changes
6. Validate (build/smoke test)
7. Commit + push + deploy (when requested)
8. Verify live version matches

---

## 0) Prereqs (non-negotiable)

- This project uses git for version control from day one.
- GitHub is connected to the correct account and the repo has a valid `origin`.
- GitHub Pages is configured and documented in this file.

### Remote sanity check

```bash
git remote -v
git branch
```

---

## 1) Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## 2) Build & Deploy

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

---

## 3) Git Workflow

```bash
# Check status
git status

# Stage and commit
git add .
git commit -m "feat: description"

# Push to origin
git push origin master

# Deploy (after pushing)
npm run deploy
```

---

## 4) Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check `npm run build` output for errors |
| 404 on GitHub Pages | Ensure `base` in `vite.config.ts` matches repo name |
| Assets not loading | Verify relative paths in production build |
| Port in use | Kill process on port 5173 or use `--port` flag |

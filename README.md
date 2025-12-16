# Onboarding Dashboard for Gig Marketplace (MUI Rebuild)

This project is a React-based dashboard for managing applicant onboarding in a gig marketplace. It has been rebuilt using **Material UI (MUI v7)** for a modern, professional aesthetic and consistent component architecture.

## 🚀 Features

*   **Applicants Management**: Fast, virtualized Data Grid for managing thousands of applicants.
*   **Pipeline Visualization**: Clear visualization of the 6-stage onboarding pipeline.
*   **Detail View**: Drawer-based detail view for quick actions and status updates.
*   **Theming**: Full support for Light and Dark modes.
*   **Responsive**: Works on desktop and mobile web.

## 🛠 Tech Stack

*   **Framework**: React + Vite + TypeScript
*   **UI Library**: Material UI (MUI) v7 + Emotion
*   **Icons**: MUI Icons (Material Icons)
*   **Data Grid**: MUI X Data Grid
*   **State Management**: React State (Context/Props)

## 📦 Installation & Local Development

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal).

3.  **Build for Production**
    ```bash
    npm run build
    ```
    Artifacts will be in `dist/`.

## 🚢 Deployment

To deploy to GitHub Pages:

```bash
npm run deploy
```

**Note**: Ensure your `git` status is clean and you have committed your changes before deploying if you use a custom deploy script.

## 📁 Project Structure

*   `src/app`: Application shell and routing logic.
*   `src/components`: Shared components (Layout, Common).
*   `src/features`: Feature-specific logic (Applicants, Analytics).
*   `src/theme`: MUI Theme configuration.
*   `src/types`: TypeScript definitions.
*   `src/utils`: Helper functions (Status mapping, date formatting).
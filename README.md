# Onboarding Dashboard for Gig Marketplace

A comprehensive dashboard designed for managing high-volume applicant onboarding in a gig economy marketplace. This application provides a dual-view interface: a robust desktop dashboard for managers to oversee the pipeline and analytics, and a mobile-view preview for applicants to track their onboarding progress.

## 🚀 Key Features

### 🖥️ Manager Dashboard (Desktop)
- **Analytics Overview:** Visualizations of applicant funnel, status distribution, and workforce metrics using Recharts.
- **Applicant Management:** Full list of applicants with advanced filtering, searching, and sorting capabilities.
- **Status Workflow:** Seamlessly move applicants through the onboarding pipeline (Applied → Go Live).
- **Activity Feed:** Real-time tracking of system events, status changes, and alerts.
- **Dark Mode:** Fully supported dark theme for low-light environments.

### 📱 Applicant View (Mobile Preview)
- **Progress Tracking:** Clear visual timeline of the onboarding journey.
- **Interactive Steps:** Simulated interface for applicants to schedule interviews, complete training, and view status updates.
- **Notifications:** Real-time feedback and instructions based on current status.

## 🛠️ Technology Stack

- **Framework:** [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) (accessible, unstyled primitives)
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Hooks
- **Package Manager:** npm

## 🚦 Onboarding Workflow

The system manages applicants through a defined 6-stage pipeline:

1. **Applied:** Initial state when an applicant submits their application.
2. **Invited to Interview:** Manager approves application; applicant is prompted to schedule.
3. **Interview Scheduled:** Slot confirmed.
4. **Invited to Training:** Post-interview approval; applicant initiates training.
5. **In Training:** Training module in progress.
6. **Go Live:** Final approval; applicant is active on the platform.
*Alternative end-states: Declined, Under Review.*

## 🏁 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shonegrad/onboarding-dashboard-gig-marketplace.git
   ```

2. Navigate to the project directory:
   ```bash
   cd onboarding-dashboard-gig-marketplace
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:
```bash
npm run dev
```
Access the app at `http://localhost:5173` (or the port shown in your terminal).

## 📁 Project Structure

```
src/
├── components/         # React components
│   ├── ui/            # Reusable UI primitives (buttons, cards, etc.)
│   ├── ManagerView.tsx # Main dashboard logic
│   └── ApplicantView.tsx # Mobile preview logic
├── data/              # Mock data generation
├── types/             # TypeScript definitions (Applicant, Status)
├── utils/             # Helper functions and constants
├── App.tsx            # Main application entry point
└── main.tsx           # React DOM root
```

## 📦 Build and Deploy

This project is configured for deployment to GitHub Pages.

**Build for production:**
```bash
npm run build
```

**Deploy to GitHub Pages:**
```bash
npm run deploy
```

For detailed development rules and operational guidelines, please refer to [DEVELOPMENT.md](./DEVELOPMENT.md).

## 📄 License & Attribution

This project is open source. See [Attributions.md](./Attributions.md) for third-party asset credits.
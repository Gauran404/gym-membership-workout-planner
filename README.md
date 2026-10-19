# Gym Membership and Workout Planner

A full-stack fitness management and workout planning application built with **Node.js, Express, MongoDB (Mongoose)** for the backend and **React (SPA)** for the frontend.

---

## 🚀 Features

- **Authentication & Security:**
  - JWT-based authentication with role authorization (`Member`, `Trainer`).
  - Account lockout after 5 consecutive failed attempts.
  - Automatic **Password Generation / Recovery** option after 3 failed login attempts.
  - Membership expiration check with instant **Renew Membership** option.
- **Workout Planning ("My Plans"):**
  - Create customized workout plans with Name, Goal, Level, and Days per week (1–7 limit validation).
  - Open existing plans and dynamically add exercises with Sets and Reps.
  - Delete plans with confirmation dialog.
- **Progress Tracking:**
  - Log daily workout sessions (Body Weight, Routine Category, Duration, Calories Burned, and Notes).
  - Aggregate statistics dashboard: Total Workouts, Total Calories Burned, and Average Weight.
  - Delete and manage workout logs with strict ownership verification.

---

## 📂 Project Architecture

```
SE LAB/
├── backend developer A/         # Express & MongoDB backend service
│   ├── config/                  # Database configuration
│   ├── controllers/             # Authentication & business logic
│   ├── middleware/              # Auth, Ownership, Query, and Validation middlewares
│   ├── models/                  # Mongoose models (User, WorkoutPlan, Progress)
│   ├── routes/                  # API routes (/api/auth, /api/workout-plans, /api/progress)
│   ├── server.js                # Server entrypoint with auto in-memory DB seeding
│   └── package.json
├── frontend developer B/        # React single page application
│   ├── public/                  # HTML templates & assets
│   ├── src/
│   │   ├── api/                 # Axios client with interceptors
│   │   ├── component/           # LoginForm, Module2Dashboard, ProgressDashboard, WorkoutPlanForm
│   │   ├── App.jsx              # Main app wrapper with navigation bar
│   │   └── index.js             # Root render entrypoint
│   └── package.json
├── start_project.bat            # One-click launch script for Windows
├── .gitignore                   # Git ignore configurations
└── README.md
```

---

## 🧪 Blackbox Test Accounts

| Role | Email | Password | Status | Test Case Reference |
| :--- | :--- | :--- | :--- | :--- |
| **Active Member** | `member@gymfit.com` | `Gym@1234` | Active | `TC_LOG_001` (Valid Login) |
| **Expired Member** | `expired@gymfit.com` | `Gym@1234` | Expired | `TC_LOG_005` (Expired Membership) |
| **Trainer** | `trainer@gym.com` | `password123` | Active | Trainer Access |

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Git](https://git-scm.com/)

### Running with One-Click Script (Windows)
Double-click `start_project.bat` in the root folder, or run:
```cmd
start_project.bat
```

### Manual Setup

1. **Backend Server (Port 5000):**
   ```bash
   cd "backend developer A"
   npm install
   npm start
   ```

2. **Frontend App (Port 3000):**
   ```bash
   cd "frontend developer B"
   npm install
   npm start
   ```

3. Open **`http://localhost:3000`** in your browser.

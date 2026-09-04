<div align="center">

  <img src="assets/logo.svg" alt="MediSpot Logo" width="96" height="96" />

  # MediSpot

  <p align="center">
    <b>Intelligent Real-Time Medicine Availability & Local Pharmacy Locator</b>
    <br />
    <i>Find medicines near you, in stock, at transparent prices — right now.</i>
  </p>

  <p align="center">
    <a href="https://medispot.pages.dev" target="_blank">
      <img src="https://img.shields.io/badge/Live%20Frontend-medispot.pages.dev-1e40af?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Live Demo" />
    </a>
    <a href="https://mini-hackathon-sliit.onrender.com/api" target="_blank">
      <img src="https://img.shields.io/badge/Production%20API-Render-10b981?style=for-the-badge&logo=render&logoColor=white" alt="API Status" />
    </a>
    <a href="https://github.com/asma-mf/mini_hackathon" target="_blank">
      <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo" />
    </a>
  </p>

</div>

---

## 📋 Project Title

**MediSpot — Intelligent Real-Time Medicine Availability, Stock Tracking & Pharmacy Locator System**

---

## ❓ The Problem

Finding a specific medicine can be difficult when users do not know which nearby pharmacies currently have it in stock. People may need to contact or visit multiple pharmacies to check availability, which can waste time, especially when the medicine is needed urgently. Pharmacies also do not have a simple shared platform where they can publish their current medicine availability and allow customers to search for medicines nearby.

---

## 💡 Proposed Solution

We developed a medicine search web application that connects users with pharmacies and helps them find medicines based on real-time availability.

- **Intelligent Medicine Search**: Users can search for a medicine by entering its name, including possible spelling mistakes, abbreviations, or partial names. An AI-powered search process identifies possible matches from the medicines registered in the system.
- **Stock & Proximity Transparency**: The application then displays pharmacies that have matching medicines, their stock status, pharmacy details, and distance from the user's location when available.
- **Pharmacist Inventory Control**: Pharmacists can register their pharmacies, add medicines, update their stock status, and remove medicines that are no longer available.
- **Direct Communication**: Users can also directly contact a pharmacy using the provided Call or WhatsApp options.

---

## 🔄 Workflow: How the System Works

```
User Workflow:
User ──► Search Medicine ──► AI Matching ──► Find Pharmacies ──► Check Stock ──► View Distance ──► Call / WhatsApp

Pharmacist Workflow:
Pharmacist ──► Register ──► Add Medicines ──► Update Stock & Price ──► Users Discover Pharmacy
```

---

## ✨ Key Features

- **User and Pharmacist role-based registration and login**
- **Pharmacist medicine management** (Add, delete, update stock & price)
- **In-stock / low-stock / out-of-stock status tracking** with quantity intelligence
- **AI-assisted medicine search** powered by LLMs
- **Support for typos, abbreviations, and partial medicine names**
- **Nearby pharmacy distance calculation** (Haversine algorithm)
- **Location selection using an interactive map** (Leaflet & OpenStreetMap)
- **Search results grouped by medicine**
- **Call pharmacy directly** with single-click telephone integration
- **Contact pharmacy through WhatsApp** with pre-formatted inquiry text
- **Distance-based result sorting** & proximity ordering
- **Optional search radius filter** (1 km, 5 km, 10 km, 25 km, or All)
- **Medicine price attribute** with budget filters (`< Rs. 250`, `< Rs. 500`, `< Rs. 1000`) and Price sorting
- **Pharmacist dashboard** for managing inventory, quantities, prices, and viewing real-time stats

---

## 👥 Team Member Details and Contributions

### Team Members Overview

| Student ID | Member Name | Role / Lead |
|:---|:---|:---|
| **IT24103128** | **Dilmith K.H.T** | **Member 2 — AI Search Lead** *(Strong Coder)* |
| **IT24101601** | **Asma M.F** | **Member 5 — App Shell, UI Kit & Integration Lead** |
| **IT24103408** | **Diluminda H.A.T.D** | **Member 1 — Auth & Accounts Lead** |
| **IT24103834** | **Lafry A.F.H** | **Member 3 — Pharmacy Inventory Lead** |
| **IT24103637** | **Binuwara M.A.L** | **Member 4 — Location & Profile Lead** |

---

### Detailed Member Responsibilities & Files Owned

#### 👤 Member 1 — Auth & Accounts Lead (IT24103408 · Diluminda H.A.T.D)
> **Goal:** *"Anyone can sign up and sign in as a patient or pharmacist."*

- **Files Owned:**
  - **Backend:** `backend/src/models/User.js`, `backend/src/middleware/auth.js`, `backend/src/controllers/authController.js`, `backend/src/routes/auth.js`, `backend/src/routes/users.js` (auth portion)
  - **Frontend:** `frontend/src/pages/AuthPage.jsx`, route guards in `frontend/src/App.jsx` (`Require` component)
- **Build Scope:** Register, login, role toggle (patient / pharmacist), pharmacist phone & WhatsApp fields, JWT signing and verification, password hashing with bcrypt. Owns the user object contract that other modules depend upon.
- **Demo Flow:** Create both account types, sign in/out, confirm `/dashboard` is strictly blocked for normal users.

---

#### 🔍 Member 2 — AI Search Lead (IT24103128 · Dilmith K.H.T — *Strong Coder*)
> **Goal:** *"Type a typo or nickname for a drug and find the nearest pharmacy that has it."*

- **Files Owned:**
  - **Backend:** `backend/src/controllers/searchController.js`, `backend/src/utils/llm.js`, `backend/src/utils/haversine.js`
  - **Frontend:** `frontend/src/pages/SearchPage.jsx`
- **Build Scope:** AI fuzzy-match pipeline, LLM hallucination guard, fallback token matching, distance sorting, stock ranking (in / low / out), price sorting, and the complete search UI (debounced input, geolocation, stock / radius / price filters, Call / WhatsApp buttons).
- **Demo Flow:** Search *"amox 250"* or *"parasitamol"* and show ranked pharmacies with distance, stock status, and price breakdown.

---

#### 💊 Member 3 — Pharmacy Inventory Lead (IT24103834 · Lafry A.F.H)
> **Goal:** *"Pharmacists can publish and update their stock."*

- **Files Owned:**
  - **Backend:** `backend/src/models/Medicine.js`, `backend/src/controllers/medicineController.js`, `backend/src/routes/medicines.js`, pharmacyId logic in `backend/src/models/User.js`
  - **Frontend:** `frontend/src/pages/DashboardPage.jsx`
- **Build Scope:** Add/delete medicines, toggle in-stock / out-of-stock, quantity updates, price attributes, duplicate-name protection, pharmacist ownership checks, and inventory sort controls.
- **Demo Flow:** Pharmacist logs in, adds Paracetamol with quantity 50 and price Rs. 150, toggles stock, and adjusts price.

---

#### 📍 Member 4 — Location & Profile Lead (IT24103637 · Binuwara M.A.L)
> **Goal:** *"Users and pharmacies can set their position on a map, and search results respect it."*

- **Files Owned:**
  - **Backend:** `backend/src/controllers/userController.js`, `backend/src/routes/users.js` (update portion)
  - **Frontend:** `frontend/src/pages/ProfilePage.jsx`, and `LocationPicker` inside `frontend/src/components/Primitives.jsx`
- **Build Scope:** Leaflet map picker (click & drag pin), saving latitude/longitude coordinates, updating phone & WhatsApp contact information, default coordinates handling.
- **Demo Flow:** Drag the pin on the map, save profile, run a medicine search, and observe distance calculation update accordingly.

---

#### 🧱 Member 5 — App Shell, UI Kit & Integration Lead (IT24101601 · Asma M.F)
> **Goal:** *"The skeleton everything else plugs into, plus deployments and keeping branches merged."*

- **Files Owned:**
  - **Backend:** `backend/src/index.js`, `backend/src/config/db.js`, `.env.example`, CORS setup
  - **Frontend:** `frontend/src/App.jsx`, `frontend/src/api.js`, `frontend/src/main.jsx`, `frontend/src/index.css`, `frontend/src/components/Icon.jsx`, shared primitives in `frontend/src/components/Primitives.jsx` (Toast, Field, TextInput, PasswordInput, SkeletonCard)
- **Build Scope:** App routing, navigation bar, global toast system, Axios JWT interceptors, design tokens, shared component kit, MongoDB connection, deployment pipelines (Cloudflare Pages + Render), and master branch integration.
- **Demo Flow:** Every member's feature operating seamlessly on the shared live deployment link.

---

### Workload Distribution Check

| Member | Domain | Scope Complexity |
|:---|:---|:---|
| **Member 1 (Auth)** | User / Pharmacist Auth & Route Protection | Medium |
| **Member 2 (Search)** | AI Search Engine, Fuzzy Matching, Geolocation UI | Heavy *(Assigned to Strong Coder)* |
| **Member 3 (Inventory)** | Pharmacy Inventory CRUD, Stock & Pricing Management | Medium |
| **Member 4 (Profile/Location)** | Interactive Maps, GPS Pinning, Profile Contact Updates | Focused & Essential |
| **Member 5 (Shell & DevOps)** | Architecture Skeleton, Design System, Deployments & Merges | Heavy & Foundational |

---

### 🛡️ The 5 Collaboration Rules That Made This Work

1. **API Contract First**: Before writing dependent code, endpoint schemas (request/response JSON) were established so team members could build against predictable contracts.
2. **Feature Branches per Member**: Individual feature branches (`feat/1-auth`, `feat/2-search`, etc.) managed independently, with Member 5 conducting clean integrations.
3. **UI Sketch as Single Design Reference**: Consistent colors, typography, spacing, and icons derived from [`ui-sketch/style.html`](file:///e:/AAA/mini_hackathon/ui-sketch/style.html) ensure visual unity.
4. **Daily Demos**: Daily syncs merged features and immediately resolved bugs.
5. **Shared Conventions**: Centralized component tokens (Sora font, `#1e40af` navy blue, `#10b981` green, card shadows) consumed uniformly across all views.

---

## 🛠️ Technologies Used

- **Frontend**: React 19 + Vite 8
- **Backend**: Node.js + Express 5 + MongoDB
- **Database**: MongoDB Atlas with Mongoose ORM
- **Authentication**: JWT (JSON Web Tokens) and bcrypt password hashing
- **Maps**: Leaflet and OpenStreetMap (CartoDB Positron tiles)
- **AI**: Claude Haiku / GPT-4o-mini / Google Gemini Flash API
- **API Communication**: RESTful API architecture with Axios HTTP client
- **Development & Tooling**: Concurrently, ESLint / Oxlint

---

## 🤖 AI Tools Used

### AI Usage Declaration

- **ChatGPT**: Used to help generate initial UI components, project structure, and debug application code.
- **Claude**: Used for conducting domain research about the medicine availability problem and architecting the backend Express.js APIs.
- **Chat-Z**: Used for generating UI layout references, component mockups, and assets.
- **Antigravity**: Used for autonomous agentic coding, codebase optimization, refactoring, and project build verification.

---

### AI Prompt Log

| AI Tool | Exact Prompt | Purpose | How Output Was Checked / Modified |
|:---|:---|:---|:---|
| **ChatGPT** | *"Help me design a simple MERN stack medicine search application with User and Pharmacist roles, JWT authentication, medicine management, and pharmacy search."* | Project architecture and feature planning | We reviewed the suggested architecture and adapted it to our hackathon requirements. |
| **Claude** | *"Generate an Express.js API for medicine search using MongoDB and Mongoose, including pharmacist medicine CRUD operations and JWT authentication."* | Backend API development | We reviewed, tested, and modified the generated API code to match our database models and requirements. |
| **Chat-Z** | *"Create a simple React and CSS interface for a medicine search application with a pharmacist dashboard and user search results."* | Frontend UI development | We tested the components and modified the layout, styling, and functionality to fit our application. |
| **Antigravity** | *"Review this MERN medicine search application code, identify bugs, and suggest simple fixes without adding unnecessary libraries or complexity."* | Debugging and code improvement | We tested the suggested fixes locally and accepted or modified them based on the actual application behavior. |

---

## 🚀 Installation and Execution Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Active MongoDB Atlas connection string or local MongoDB instance
- **Google Gemini API Key**: API key from Google AI Studio

---

### 1. Clone the Repository
```bash
git clone https://github.com/asma-mf/mini_hackathon.git
cd mini_hackathon
```

---

### 2. Backend Configuration & Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   CLIENT_ORIGIN=http://localhost:5173
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   Backend runs at: `http://localhost:5000`

---

### 3. Frontend Configuration & Setup
1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Frontend runs at: `http://localhost:5173`

---

## 🌐 Links & Deliverables

- **Git Repository**: [https://github.com/asma-mf/mini_hackathon](https://github.com/asma-mf/mini_hackathon)
- **Deployed Frontend (Cloudflare Pages)**: [https://medispot.pages.dev](https://medispot.pages.dev)
- **Deployed Backend API (Render)**: [https://mini-hackathon-sliit.onrender.com/api](https://mini-hackathon-sliit.onrender.com/api)
- **Demonstration Video Link**: [Two-Minute Demonstration Video](https://drive.google.com/drive/folders/1RsSfriihXfDUNVJ2r0Qy7ZXwLjXUeyJO?usp=drive_link)

---

<div align="center">
  <sub>MediSpot · Built with ❤️ for SLIIT Mini-Hackathon 2026</sub>
</div>
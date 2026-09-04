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
      <img src="https://img.shields.io/badge/Live%20Demo-medispot.pages.dev-1e40af?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Live Demo" />
    </a>
    <a href="https://mini-hackathon-sliit.onrender.com" target="_blank">
      <img src="https://img.shields.io/badge/API%20Status-Online-10b981?style=for-the-badge&logo=render&logoColor=white" alt="API Status" />
    </a>
    <img src="https://img.shields.io/badge/AI%20Engine-Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
  </p>

</div>

---

## 📋 Project Title

**MediSpot — Intelligent Real-Time Medicine Availability, Stock Tracking & Pharmacy Locator System**

---

## ❗ The Selected Problem

During medical emergencies and routine healthcare treatments, patients, family members, and caregivers frequently face critical hurdles when attempting to obtain prescribed medications:

1. **Severe Information Asymmetry & Stockouts**: Pharmacies experience fluctuating inventory levels due to regional supply shortages. Patients have zero visibility into which nearby pharmacies actually carry the required medicine in sufficient quantity.
2. **Exhausting Physical & Telephone Searches**: Individuals are forced to commute from pharmacy to pharmacy or spend hours making dozens of phone calls, losing crucial time during acute health crises.
3. **Complex Medical Terminology & Rigid Search Engines**: Traditional lookup engines require 100% exact keyword matches. Patients searching with phonetic spellings, brand names instead of generic names (e.g., *Panadol* vs. *Paracetamol*), or slight typographical errors often receive zero results despite stock being available nearby.
4. **Lack of Price & Quantity Transparency**: Consumers cannot compare medicine prices or verify whether a pharmacy has enough units to fulfill their complete prescription dosage prior to traveling.

---

## 💡 The Proposed Solution

**MediSpot** is a centralized, AI-driven healthcare platform designed to bridge the communication and information gap between patients and local retail pharmacies in real-time.

- **Semantic AI Search**: Powered by Google Gemini Flash, MediSpot intelligently understands messy natural language, brand-to-generic mappings, dosage notations, and common spelling errors to match patient inquiries against actual live pharmacy inventories.
- **Dynamic Quantity & Low-Stock Intelligence**: Users specify the quantity of tablets or bottles they require. If a pharmacy has stock but fewer units than requested, MediSpot marks it as **"Low Stock"** with the exact remaining quantity shown.
- **Price Transparency & Total Cost Calculation**: Every medicine listing contains verified unit pricing (in LKR / Rs.), allowing patients to view both individual unit rates and total projected costs for their requested prescription size.
- **Proximity & Availability Ranking**: Integrates geolocation (Haversine distance calculation and interactive Leaflet map pins) to surface and prioritize pharmacies that are both closest and currently in stock.
- **Direct Contact Integrations**: Patients can immediately call or initiate a pre-filled WhatsApp chat with the dispensing pharmacist to reserve their medicine before traveling.
- **Decentralized Pharmacy Portal**: Pharmacists can manage their inventory in seconds with real-time stock toggles, quantity counters, inline price adjustments, and sorting capabilities.

---

## ✨ Main Features

### 1. 🔍 AI-Powered Semantic Medicine Search
- Natural language query interpretation powered by Google Gemini.
- Accurately resolves brand names, generic formulations, dosages, and common typos (e.g., *"amox 250"*, *"ventolin inhaler"*, *"paracetamol 500"*).
- Features an automatic local fallback mechanism to ensure 100% search uptime even during API quota constraints.

### 2. 📦 Quantity & Smart Stock Status Detection
- Users can adjust their required medicine quantity via an intuitive counter.
- **Three-Tier Stock Status**:
  - 🟢 **In Stock**: Available quantity meets or exceeds the user's requested dosage.
  - 🟡 **Low Stock**: Available, but fewer units remain than the requested amount.
  - 🔴 **Out of Stock**: Depleted inventory.
- Real-time stock prioritization ensures available medicines are always shown first.

### 3. 💰 Transparent Pricing & Total Estimation
- Pharmacists set and update live unit prices (`Rs.`).
- Patients see unit prices and automatic total cost calculations based on their requested quantity.
- Filter by maximum price ceilings (`< Rs. 250`, `< Rs. 500`, `< Rs. 1000`, or `Any`).
- Sort results by **Price: Low to High** or **Price: High to Low**.

### 4. 📍 Geolocation & Distance Filtering
- Automatic browser GPS coordinate detection with privacy permission handling.
- Distance calculations computed using the Haversine formula.
- Quick proximity radius filters (`1 km`, `5 km`, `10 km`, `25 km`, `All`).
- Interactive Leaflet & OpenStreetMap drag-and-drop location picker for pharmacies and users.

### 5. 📞 Instant One-Click Communication
- Direct **Click-to-Call** phone integration.
- Direct **WhatsApp Messaging** with pre-formatted inquiry text to reserve medicines immediately.

### 6. 🏬 Pharmacist Inventory Management Dashboard
- Fast medicine onboarding with initial quantity, price, and name.
- 1-click In Stock / Out of Stock toggle switches.
- Inline quantity stepper controls (`+` / `-`).
- Inline editable price fields with instant background synchronization.
- Pharmacist inventory sorting (by Name, Price Low-High, Price High-Low, and Stock Count).

### 7. 🔐 Role-Based Authentication
- Secure JWT-based authentication for **Consumers** and **Pharmacists**.
- Pharmacist registration captures pharmacy name, license ID, phone number, WhatsApp contact, and precise physical map coordinates.

---

## 🛠️ Technologies Used

### Frontend
- **React 19**: Modern component-driven single page application.
- **React Router DOM (v7)**: Client-side routing with role-based route guards.
- **Vite**: High-performance frontend build pipeline.
- **Vanilla CSS Design System**: Custom tokens, responsive layouts, glassmorphism, and micro-animations without bloated UI libraries.
- **Leaflet & CartoDB Positron**: Lightweight, privacy-friendly interactive mapping.
- **Axios**: HTTP client with request interceptors for token injection and error management.

### Backend
- **Node.js & Express.js**: High-throughput RESTful API architecture.
- **MongoDB Atlas & Mongoose**: Cloud document database with geo-indexing and relational schema models.
- **JWT (JSON Web Tokens) & bcryptjs**: Stateless session authorization and cryptographic password hashing.
- **CORS & Security Middleware**: Origin verification and header hardening.

### Deployment & Infrastructure
- **Frontend Hosting**: Cloudflare Pages (`https://medispot.pages.dev`)
- **Backend Hosting**: Render Cloud Web Services (`https://mini-hackathon-sliit.onrender.com`)
- **Database**: MongoDB Atlas Cloud Cluster

---

## 🤖 AI Tools Used

- **Google Gemini 2.5 Flash / 1.5 Flash API**:
  - Integrated directly into the backend search pipeline (`/api/search`).
  - Analyzes raw search strings, extracts active ingredients, resolves alternate brand names and strengths, and matches them to pharmacy inventories.
- **Google Antigravity Agentic AI Assistant**:
  - Utilized for pair programming, full-stack architecture design, rapid debugging, code optimization, and deployment orchestration.

---

## 👥 Team Member Details and Contributions

| Member Name | Role | Primary Contributions |
|:---|:---|:---|
| **Fathima Asma** | Full-Stack Developer | • Backend API design and Express route development<br/>• MongoDB database schemas (`User`, `Medicine`)<br/>• Google Gemini AI search integration & fallback logic<br/>• Stock status calculation and price sorting backend logic |
| **Thisal Dilmith** | Frontend & DevOps Engineer | • Frontend React architecture and component library<br/>• UI/UX design system, animations, and responsive styling<br/>• Leaflet interactive map and geolocation integration<br/>• Cloudflare Pages and Render deployment pipelines |

---

## 🚀 Installation and Execution Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Active MongoDB Atlas connection string or local MongoDB instance
- **Google Gemini API Key**: Free tier or standard key from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/asma-mf/mini_hackathon.git
cd mini_hackathon
```

---

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   CLIENT_ORIGIN=http://localhost:5173
   ```
4. Start the backend development server:
   ```bash
   npm start
   ```
   The backend API will be running at `http://localhost:5000`.

---

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend Vite development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

### 4. Running Production Builds
To test the production build locally:
```bash
# In frontend directory
npm run build
npm run preview
```

---

## 🌐 Deployed Application Link

- **Live Web Application**: [https://medispot.pages.dev](https://medispot.pages.dev)
- **Production Backend API**: [https://mini-hackathon-sliit.onrender.com](https://mini-hackathon-sliit.onrender.com)

---

## 🎥 Demonstration Video Link

- **Demonstration Video**: [https://youtu.be/dummy-medispot-demo](https://youtu.be/dummy-medispot-demo)  
  *(Note: This is currently a placeholder URL as requested and will be updated with the final presentation recording).*

---

<div align="center">
  <sub>Built with ❤️ for the SLIIT Mini-Hackathon 2026.</sub>
</div>
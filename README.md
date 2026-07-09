# 💧 PureLoop — React Application

<div align="center">
  <p><strong>Refresh. Rinse. Repeat.</strong></p>
  <p>A modern, high-fidelity laundry booking application built with React, Vite, and Tailwind CSS.</p>

  <a href="https://purelooop-app-v2.vercel.app/" target="_blank">View Live App</a>
  <span> | </span>
  <a href="https://pureloop-case-study.vercel.app/" target="_blank">View UX Case Study</a>
</div>

---

## ✨ Features

- **Strict 8px Grid System**: The entire UI is built on a mathematical 1.25 Major Third typography scale and an unyielding 8px spatial grid for perfect vertical rhythm.
- **Firebase Authentication**: Full user authentication flow including Sign Up, Login, and secure session management.
- **Dynamic State Management**: Centralized React state handling global user details, addresses, and active orders.
- **Interactive Micro-Animations**: Smooth physics-based hover states and transitions to ensure a premium, app-like feel.
- **Accessible Design**: Built following strict WCAG AA contrast ratios with semantic HTML and comprehensive `:focus-visible` states.

## 🛠 Tech Stack

- **Frontend Core**: React 18 (TypeScript), Vite
- **Styling**: Tailwind CSS, PostCSS, Lucide React (Icons)
- **Backend & Auth**: Firebase Authentication & Firestore
- **Routing**: React Router DOM (v6)

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd laundry-app-prototype
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY="your_api_key"
   VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"
   VITE_FIREBASE_PROJECT_ID="your_project_id"
   VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
   VITE_FIREBASE_APP_ID="your_app_id"
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

## 📐 Design System

This app utilizes a robust, CSS-variable driven design system. All Master Tokens are located in `src/index.css`.
- **Primary Action**: `#007367` (Ensures 4.5:1 Contrast Ratio)
- **Backgrounds**: `slate-50` (`#F8FAFC`) to pure white cards.
- **Typography Base**: `Inter`, 16px baseline.

---
*Built as the Version 2 technical execution of the PureLoop UX concept.*

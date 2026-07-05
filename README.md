# Creative UI Template 🚀

A production-ready React starter template preconfigured for high-end creative interfaces and WebGL design.

## Features

- **React & TypeScript**: Stable modular framework setup.
- **Tailwind CSS v4**: Built-in support for Tailwind v4 utilizing the Vite compiler plugin (`@tailwindcss/vite`).
- **Shadcn UI**: Configured with `components.json` using the `radix-nova` style.
- **React Three Fiber (R3F)**: Render loops and canvas controls ready to go for 3D interactions.
- **Framer Motion & GSAP**: Animations libraries pre-configured.
- **Playwright**: Complete E2E testing environment configured and testing scripts added.

---

## Getting Started

### 1. Duplicate to Start a New Project
Whenever you want to start a new project from this template:
1. Copy the folder to your new directory name.
2. Open the directory.
3. Run `npm install` to link modules.

### 2. Available Scripts
Inside your project directory:

- **`npm run dev`**: Starts the Vite local development server.
- **`npm run build`**: Compiles production bundles.
- **`npm run test:e2e`**: Runs the Playwright E2E test suite in headless mode.
- **`npm run lint`**: Runs oxlint for incredibly fast TypeScript and TSX analysis.

---

## Directory Structure
- `src/components/ThreeCanvas.tsx`: Ready-to-go Three.js viewer component.
- `src/App.tsx`: Main layout utilizing grid structures, custom headers, and responsiveness.
- `src/index.css`: Preconfigured CSS theme containing layout system tokens.
- `tests/app.spec.ts`: Clean default E2E tests.

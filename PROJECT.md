# Project: Laundry App Prototype Overhaul

## Architecture
This is a single-page client-side web application (vanilla HTML/CSS/JS) styled as an iPhone mobile application mockup.
- **index.html**: Defines structural sections for all screens (Splash, Onboarding, Login, Signup, OTP Verify, Home, Provider Profile, Booking Details, Payment, Tracking).
- **style.css**: Defines variables, layout constraints, device mockups, UI elements, dark/light theme, custom loader keyframes, and transitions.
- **script.js**: Handles UI screen navigation (`window.navigate`), theme toggle, itemized load calculator, address editing, Supabase Auth APIs, and booking flow coordination.

## Code Layout
- `index.html`: Contains all screen markup, including standard layouts and components.
- `style.css`: Contains CSS rules for device mockup and app screens.
- `script.js`: Contains JavaScript application state, helper functions, and event listeners.
- `tests/test_interactions.js`: Test runner or verification script using a lightweight browser automation library or direct DOM testing (e.g., node script or custom JS test harness run in the browser or terminal).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | E2E Testing Track | Design and implement the E2E verification test suite (Tiers 1-4). Create `TEST_INFRA.md` and `TEST_READY.md`. | None | PLANNED |
| 2 | Interactive Wiring | Wire navbar, profile, bell, address link, service toggles; add 2-3 providers. | None | PLANNED |
| 3 | Supabase Authentication | Build Login, Signup, OTP screens; integrate Supabase client for OTP emails. | None | PLANNED |
| 4 | Booking & Custom Loader | Implement itemized clothing list, special instructions, and premium custom loader. | M2 | PLANNED |
| 5 | Payment & COD | Add COD payment options, success screen, and transition to booking confirmed. | M4 | PLANNED |
| 6 | E2E Validation & Hardening | Final verification of all test cases, adversarial testing, code layout checks. | M1, M3, M5 | PLANNED |

## Interface Contracts
### Client ↔ Supabase Backend
- Signup: `supabase.auth.signUp({ email, password })` -> triggers verification OTP email.
- Signin: `supabase.auth.signInWithOtp({ email })` or `supabase.auth.signInWithPassword({ email, password })`.
- OTP Verification: `supabase.auth.verifyOtp({ email, token, type: 'signup' })`.

### Routing/Navigation
- `navigate(screenId)`: Swaps active `.app-screen` element.
- `updateQty(change)`: Modifies load weights and calculates pricing.

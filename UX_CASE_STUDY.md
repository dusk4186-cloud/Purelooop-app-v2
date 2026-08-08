# Design Evolution Log: V1 Concept vs V2 High-Fidelity Prototype

This document outlines the systematic evolution of the PureLoop design system, transitioning from the static V1 Figma blueprint to the interactive, accessible, and mathematically rigorous V2 High-Fidelity environment.

## 1. Typography Evolution

In V1, typography scaled arbitrarily based on visual intuition. In V2, the entire typographic scale was rebuilt using a strict **1.25 Major Third mathematical ratio**, anchored to a 16px baseline. This ensures that every text element locks perfectly into the global 8px responsive grid.

| Element | V1 (Static Figma) | V2 (High-Fidelity Prototype) | Evolution Rationale |
| :--- | :--- | :--- | :--- |
| **Font Family** | Inter | Geist Variable / Inter | Upgraded to variable fonts for fluid rendering and better optical legibility. |
| **Titles / H1** | 32px (Bold) | 32px | Scaled from 24px * 1.25 = 30px, rounding beautifully to a crisp 32px boundary to lock into the 8px grid. |
| **Headers / H2** | 18px (Semi-bold) | 24px | Scaled exactly to 24px to lock perfectly into a multiple of 8, establishing clear page hierarchy. |
| **Subheadings / H3**| N/A | 20px | 16px * 1.25 = 20px. Bridges the gap between body copy and major headers. |
| **Labels / Inputs** | 16px (Regular) | 13px | Optically rounds from 12.8px to a sharp 13px. Frees up horizontal space on mobile forms. |
| **Body Copy** | 14px (Regular) | 16px | Elevated to 16px to form a perfect 8px grid match and improve baseline WCAG readability. |
| **Buttons / CTA** | 24px (Semi-bold) | 16px | Shrunk from an oversized 24px down to 16px. Touch targets are now expanded via padding rather than oversized text. |
| **Line Height** | Auto / 120-140% | Strict Multipliers | Headings (1.1x–1.2x), Subheadings (1.3x), Body (1.5x), Labels (1.4x–1.6x). |

---

## 2. Color System & Accessibility Evolution

In V1, colors were utilized based purely on aesthetics. In V2, the palette was refactored into a semantic system to support dynamic light/dark modes and strict WCAG AA contrast standards.

| Component / Hue | V1 (Static Figma) | V2 (High-Fidelity Prototype) | Evolution Rationale |
| :--- | :--- | :--- | :--- |
| **Primary CTA** | `#00E7D2` (Bright Teal) | `#007367` (Deep Teal) | The V1 bright teal failed WCAG contrast checks against white text. V2 darkened the CTA to `#007367`, guaranteeing a minimum **4.5:1 WCAG AA** contrast ratio for accessibility. *(Note: The V1 bright `#00E7D2` is retained specifically for Dark Mode).* |
| **Backgrounds** | Light neutral off-white / pink | `#F8FAFC` & `#F1F5F9` | Shifted to slate-tinted off-whites. This provides better depth and shadow rendering for the new "glassmorphism" and elevated card components. |
| **Body Text** | `#080808` (Near Black) | `#0F172A` (Slate-900) | Softened the absolute black to a deep slate. This reduces eye strain on digital screens while maintaining high contrast. |
| **Secondary Text**| `#747474` (Neutral Gray) | `#64748B` (Slate-500) | Tinted the grays with blue/slate to harmonize with the teal action colors, creating a more unified aesthetic. |
| **Interactive States**| None | Dynamic Interaction Design | V1 buttons were static vectors. V2 introduces physics-based micro-animations (scale down on press, slight brightness on hover) and universally enforces focus rings for keyboard accessibility. |

## 3. Structural & Layout Shifts

- **From Ad-hoc to 8px Grid**: V1 utilized varying margins and paddings. V2 strictly maps all layout spacing tokens (8px, 16px, 24px, 32px) to the **8px grid system**, creating vertical rhythm and mathematical harmony.
- **Component States**: Error banners, empty states, and disabled states (faded buttons, grayed-out fields) were engineered in V2 to gracefully handle negative user paths that didn't exist in the happy-path V1 prototype.

## 4. Multi-Pile Booking & Add-ons Evolution

In the latest V2 updates, the rigid flat-cart structure was dismantled in favor of an advanced **Contextual Multi-Service Booking Model**.

| Feature | Evolution Rationale |
| :--- | :--- |
| **Mutually Exclusive Service Tabs** | In V1, users could accidentally mix Wash & Fold (kg) with Dry Clean (pieces) in a confusing way. V2 segregates services into strict Tabs. Items added in the Wash tab stay there, preventing invalid pricing states. |
| **Contextual Badges** | To reduce user anxiety when switching tabs, a dynamic notification badge persists on tabs containing items (e.g., `Wash & Fold (5)`), visually reassuring users their progress isn't lost. |
| **Add-On Modifiers vs. Clutter** | Instead of bloating the item grid with detergent and softener choices per-item, V2 introduces a sleek "Wash Preferences" card globally at Checkout. |
| **Buffer Hold Pricing (Strategy A)** | Rather than asking users to pay cash differences at the door for weight variances, V2 explicitly authorizes a 15% temporary buffer hold to seamlessly capture final costs at billing. |

## 5. Order History & Tracking UX

The tracking experience was completely overhauled to handle both active live-tracking and historical receipt management within a unified dashboard.

| Feature | Evolution Rationale |
| :--- | :--- |
| **Unified Tracking Dashboard** | Instead of a dead-end screen when no active orders exist, the Tracking Screen was transformed into a "My Orders" dashboard with an elegant segmented control (`Active Orders` vs `Order History`). |
| **Live Multi-Service Tracking** | The tracking timeline nodes are now dynamically generated based on the specific services booked. (e.g., An order with Wash & Fold + Ironing generates unique "Washing" and "Steam Ironing" checkpoints, while a Dry Clean order generates a unique "Dry Cleaning" step). |
| **Clickable Receipts** | Past orders in the history tab are not just static lists; clicking an order summons a bottom-sheet modal rendering a full Receipt Breakdown, transparently showing platform fees, taxes, and service splits. |
| **Reorder Convenience** | The past order receipt modal prominently features a "Reorder from [Provider]" CTA, dramatically reducing friction for returning customers. |

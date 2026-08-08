# E2E Test Runner Infrastructure (TEST_INFRA)

This document describes the design, architecture, and operation of the E2E verification test suite for the Laundry App Prototype.

## Architecture & Design Decisions

### 1. Offline-Safe Node.js Emulation
To run reliably in Windows PowerShell without requiring external package downloads or internet access (CODE_ONLY network restrictions), we built a zero-dependency mock browser DOM environment in Node.js.
- **HTML Parser**: Reads `index.html` and parses it into a node tree of custom `MockElement` objects. It correctly processes tags, void tags (like `<img>`, `<input>`, `<br>`), IDs, classes, and other custom attributes.
- **Mock DOM Environment**: Emulates key browser elements and APIs including:
  - `document` and `window` objects (mapped to Node.js `global`).
  - `document.createElement(tagName)` for dynamic element generation.
  - Element traversal and queries via `getElementById`, `querySelector`, and `querySelectorAll` (supporting tag names, IDs, and class lists).
  - Event model supporting `addEventListener`, `dispatchEvent`, `click()`, and execution of inline `onclick` event attributes (safely bound to the simulated environment scope).
  - `classList` manipulation (`add`, `remove`, `contains`) synchronized with the element's class attribute.
  - `dataset` Proxy which automatically routes property writes (like `element.dataset.id`) to `data-*` attributes.
  - `innerHTML` setter that dynamically compiles and appends children to elements.

### 2. Fake Timer Management
The frontend prototype uses `setTimeout` for initial screen transitions and restart animations. To prevent tests from being slow or non-deterministic, the test runner mocks `setTimeout` and `clearTimeout`. It registers pending timers and provides a `global.runAllTimeouts()` helper to fast-forward execution instantly.

### 3. Isolation & State Reset
Before running each test case, the DOM is completely reconstructed, the global scope is cleaned of transient navigation functions, `script.js` is re-evaluated, and `DOMContentLoaded` listeners are invoked. This ensures absolute test isolation with no state pollution.

## Execution Command

Run the test suite from the root of the project using Node.js:
```powershell
node tests/test_interactions.js
```

## Exit Codes Verification
The test runner is integrated with standard CI/CD and process constraints:
- **Exit Code `0`**: Returned when all tests pass successfully.
- **Exit Code `1`**: Returned when any test case fails. Since Features 3 (Supabase Auth) and 5 (Cash on Delivery) are currently unimplemented in the prototype, the suite will exit with code `1`, which is correct and expected at this stage.

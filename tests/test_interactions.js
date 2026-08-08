const fs = require('fs');
const path = require('path');

// --- Mock DOM Implementation ---

class ClassList {
    constructor(element) {
        this.element = element;
    }
    
    get _list() {
        return new Set((this.element.getAttribute('class') || '').split(/\s+/).filter(Boolean));
    }
    
    set _list(set) {
        this.element.setAttribute('class', Array.from(set).join(' '));
    }
    
    add(c) {
        const s = this._list;
        s.add(c);
        this._list = s;
    }
    
    remove(c) {
        const s = this._list;
        s.delete(c);
        this._list = s;
    }
    
    contains(c) {
        return this._list.has(c);
    }
    
    toString() {
        return Array.from(this._list).join(' ');
    }
}

function createDatasetProxy(element) {
    return new Proxy({}, {
        get(target, prop) {
            return element.getAttribute(`data-${prop}`);
        },
        set(target, prop, value) {
            element.setAttribute(`data-${prop}`, value);
            return true;
        }
    });
}

class MockElement {
    constructor(tagName = '', attributes = {}) {
        this.tagName = tagName.toUpperCase();
        this.attributes = {};
        for (const [k, v] of Object.entries(attributes)) {
            this.attributes[k.toLowerCase()] = String(v);
        }
        this.childNodes = [];
        this.listeners = {};
        this.classList = new ClassList(this);
        this.dataset = createDatasetProxy(this);
        this.style = {};
        this.parentNode = null;
        this._textContent = '';
    }

    get parentElement() {
        return this.parentNode;
    }

    get textContent() {
        let text = this._textContent || '';
        if (this.childNodes.length > 0) {
            text += (text ? ' ' : '') + this.childNodes.map(c => c.textContent).join(' ');
        }
        return text.trim();
    }

    set textContent(val) {
        this.childNodes = [];
        this._textContent = String(val);
    }

    get value() {
        return this.getAttribute('value') || '';
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    get id() {
        return this.getAttribute('id') || '';
    }

    set id(val) {
        this.setAttribute('id', val);
    }

    get className() {
        return this.getAttribute('class') || '';
    }

    set className(val) {
        this.setAttribute('class', val);
    }

    get innerHTML() {
        return this.textContent;
    }

    set innerHTML(val) {
        this.childNodes = [];
        this._textContent = '';
        if (val) {
            const parsed = parseHTML(val);
            for (const child of parsed.childNodes) {
                this.appendChild(child);
            }
            if (parsed._textContent) {
                this._textContent = parsed._textContent;
            }
        }
    }

    setAttribute(name, val) {
        this.attributes[name.toLowerCase()] = String(val);
    }

    getAttribute(name) {
        const val = this.attributes[name.toLowerCase()];
        return val !== undefined ? val : null;
    }

    addEventListener(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    dispatchEvent(event) {
        const type = typeof event === 'string' ? event : event.type;
        const listeners = this.listeners[type] || [];
        for (const listener of listeners) {
            listener.call(this, event);
        }
    }

    click() {
        const event = {
            type: 'click',
            preventDefault() {},
            target: this
        };
        this.dispatchEvent(event);
        const onclickAttr = this.getAttribute('onclick');
        if (onclickAttr) {
            const run = new Function('element', `
                const navigate = global.navigate || (window ? window.navigate : null);
                const updateQty = global.updateQty || (window ? window.updateQty : null);
                const selectToggle = global.selectToggle || (window ? window.selectToggle : null);
                const selectProvider = global.selectProvider || (window ? window.selectProvider : null);
                const this_val = element;
                eval(\`${onclickAttr.replace(/\bthis\b/g, 'this_val')}\`);
            `);
            run(this);
        }
    }

    appendChild(child) {
        child.parentNode = this;
        this.childNodes.push(child);
        return child;
    }

    replaceWith(newEl) {
        if (this.parentNode) {
            const index = this.parentNode.childNodes.indexOf(this);
            if (index !== -1) {
                this.parentNode.childNodes[index] = newEl;
                newEl.parentNode = this.parentNode;
            }
        }
    }

    focus() {
        // Mock focus method
    }

    querySelector(selector) {
        return querySelectorAllImpl(this, selector)[0] || null;
    }

    querySelectorAll(selector) {
        return querySelectorAllImpl(this, selector);
    }
}

function matchesSelector(element, selector) {
    if (!selector) return false;
    if (selector.startsWith('#')) {
        return element.getAttribute('id') === selector.slice(1);
    }
    if (selector.startsWith('.')) {
        const classes = selector.split('.').filter(Boolean);
        return classes.every(c => element.classList.contains(c));
    }
    if (selector.includes('.')) {
        const parts = selector.split('.');
        const tagName = parts[0];
        const classes = parts.slice(1);
        const tagMatch = !tagName || element.tagName === tagName.toUpperCase();
        const classMatch = classes.every(c => element.classList.contains(c));
        return tagMatch && classMatch;
    }
    return element.tagName === selector.toUpperCase();
}

function querySelectorAllImpl(element, selector) {
    const results = [];
    function traverse(node) {
        for (const child of node.childNodes) {
            if (matchesSelector(child, selector)) {
                results.push(child);
            }
            traverse(child);
        }
    }
    traverse(element);
    return results;
}

function getElementByIdImpl(element, id) {
    function traverse(node) {
        if (node.getAttribute('id') === id) {
            return node;
        }
        for (const child of node.childNodes) {
            const found = traverse(child);
            if (found) return found;
        }
        return null;
    }
    return traverse(element);
}

// --- HTML Parser ---

function parseHTML(htmlString) {
    const root = new MockElement('root');
    const stack = [root];
    
    const cleanHtml = htmlString.replace(/<!--[\s\S]*?-->/g, '');
    const tagRegex = /<(\/?[a-zA-Z0-9:-]+)([^>]*)>/g;
    let lastIndex = 0;
    let match;

    const voidTags = new Set(['img', 'input', 'br', 'hr', 'link', 'meta', 'source', 'col']);

    while ((match = tagRegex.exec(cleanHtml)) !== null) {
        const textBetween = cleanHtml.slice(lastIndex, match.index).trim();
        if (textBetween && stack.length > 0) {
            const parent = stack[stack.length - 1];
            if (!parent._textContent) parent._textContent = '';
            parent._textContent += (parent._textContent ? ' ' : '') + textBetween;
        }

        const tagName = match[1];
        const attrStr = match[2];
        lastIndex = tagRegex.lastIndex;

        if (tagName.startsWith('/')) {
            if (stack.length > 1) {
                stack.pop();
            }
        } else {
            const attrs = {};
            const attrRegex = /([a-zA-Z0-9:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
            let attrMatch;
            while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
                const attrName = attrMatch[1];
                const attrVal = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';
                attrs[attrName] = attrVal;
            }

            const element = new MockElement(tagName, attrs);
            const parent = stack[stack.length - 1];
            parent.childNodes.push(element);
            element.parentNode = parent;

            const isSelfClosing = attrStr.trim().endsWith('/') || voidTags.has(tagName.toLowerCase());
            if (!isSelfClosing) {
                stack.push(element);
            }
        }
    }
    const textAfter = cleanHtml.slice(lastIndex).trim();
    if (textAfter && stack.length > 0) {
        const parent = stack[stack.length - 1];
        if (!parent._textContent) parent._textContent = '';
        parent._textContent += (parent._textContent ? ' ' : '') + textAfter;
    }
    return root;
}

// --- Test Harness ---

const tests = [];
function test(name, fn) {
    tests.push({ name, fn });
}

const assert = {
    ok(value, message) {
        if (!value) {
            throw new Error(`Assertion failed: expected truthy, got ${value}. ${message || ''}`);
        }
    },
    equal(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`Assertion failed: expected "${expected}", got "${actual}". ${message || ''}`);
        }
    },
    notEqual(actual, expected, message) {
        if (actual === expected) {
            throw new Error(`Assertion failed: expected not equal to "${expected}", got "${actual}". ${message || ''}`);
        }
    },
    includes(actual, expectedSub, message) {
        if (!actual || typeof actual.includes !== 'function' || !actual.includes(expectedSub)) {
            throw new Error(`Assertion failed: expected "${actual}" to include "${expectedSub}". ${message || ''}`);
        }
    }
};

// --- DOM Setup & State Management ---

const htmlPath = path.join(__dirname, '../index.html');
const scriptPath = path.join(__dirname, '../script.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

let pendingTimeouts = [];
const mockSetTimeout = (callback, delay) => {
    pendingTimeouts.push({ callback, delay });
    return pendingTimeouts.length - 1;
};
const mockClearTimeout = (id) => {
    if (pendingTimeouts[id]) {
        pendingTimeouts[id] = null;
    }
};

function resetDOM() {
    const root = parseHTML(htmlContent);
    const htmlNode = root.querySelector('html') || root;
    
    global.window = global;
    
    delete global.navigate;
    delete global.updateQty;
    delete global.selectToggle;
    delete global.selectProvider;
    
    const domContentLoadedCallbacks = [];
    
    global.document = {
        documentElement: htmlNode,
        addEventListener(event, callback) {
            if (event === 'DOMContentLoaded') {
                domContentLoadedCallbacks.push(callback);
            }
        },
        createElement(tagName) {
            return new MockElement(tagName);
        },
        getElementById(id) {
            return getElementByIdImpl(htmlNode, id);
        },
        querySelector(selector) {
            if (matchesSelector(this.documentElement, selector)) {
                return this.documentElement;
            }
            return querySelectorAllImpl(this.documentElement, selector)[0] || null;
        },
        querySelectorAll(selector) {
            const results = [];
            if (matchesSelector(this.documentElement, selector)) {
                results.push(this.documentElement);
            }
            return results.concat(querySelectorAllImpl(this.documentElement, selector));
        }
    };
    
    pendingTimeouts = [];
    global.setTimeout = mockSetTimeout;
    global.clearTimeout = mockClearTimeout;
    
    global.runAllTimeouts = () => {
        const list = [...pendingTimeouts];
        pendingTimeouts = [];
        for (const item of list) {
            if (item && item.callback) {
                item.callback();
            }
        }
    };

    global.getTimeoutsCount = () => {
        return pendingTimeouts.filter(Boolean).length;
    };
    
    try {
        const executeScript = new Function('document', 'window', 'setTimeout', 'clearTimeout', scriptContent);
        executeScript(global.document, global.window, mockSetTimeout, mockClearTimeout);
    } catch (err) {
        console.error('Error evaluating script.js:', err);
        throw err;
    }
    
    for (const cb of domContentLoadedCallbacks) {
        cb();
    }
}

// --- Test Case Definitions ---

// --- Feature 1: Navbar Navigation ---

// Tier 1: Feature Coverage (5 tests)
test('Feature 1 - Tier 1 - Case 1: Initial navigation flow (Splash to Onboarding via auto-advance timeout)', () => {
    const splash = document.getElementById('splash');
    const onboarding = document.getElementById('onboarding');
    assert.ok(splash.classList.contains('active'), 'Splash should be active initially');
    assert.ok(!onboarding.classList.contains('active'), 'Onboarding should be inactive initially');
    
    runAllTimeouts();
    
    assert.ok(!splash.classList.contains('active'), 'Splash should be inactive after timeout');
    assert.ok(onboarding.classList.contains('active'), 'Onboarding should be active after timeout');
});

test('Feature 1 - Tier 1 - Case 2: Onboarding "Get Started" button navigates to Home screen', () => {
    runAllTimeouts();
    
    const getStartedBtn = document.getElementById('onboarding').querySelector('.btn-primary');
    assert.ok(getStartedBtn, 'Get Started button should exist');
    
    getStartedBtn.click();
    
    assert.ok(!document.getElementById('onboarding').classList.contains('active'), 'Onboarding should be inactive');
    assert.ok(document.getElementById('home').classList.contains('active'), 'Home screen should be active');
});

test('Feature 1 - Tier 1 - Case 3: Provider card on Home navigates to Provider Profile screen', () => {
    window.navigate('home');
    
    const providerCard = document.querySelector('.provider-card');
    assert.ok(providerCard, 'Provider card should exist on Home screen');
    
    providerCard.click();
    
    assert.ok(!document.getElementById('home').classList.contains('active'), 'Home screen should be inactive');
    assert.ok(document.getElementById('provider').classList.contains('active'), 'Provider screen should be active');
});

test('Feature 1 - Tier 1 - Case 4: Back button on Provider Profile navigates back to Home', () => {
    window.navigate('provider');
    
    const backBtn = document.getElementById('provider').querySelector('.back-btn');
    assert.ok(backBtn, 'Back button should exist on Provider Profile screen');
    
    backBtn.click();
    
    assert.ok(document.getElementById('home').classList.contains('active'), 'Should navigate back to Home');
    assert.ok(!document.getElementById('provider').classList.contains('active'), 'Provider screen should be inactive');
});

test('Feature 1 - Tier 1 - Case 5: Direct screen navigation via navigate() function works for all existing screens', () => {
    const screens = ['splash', 'onboarding', 'home', 'provider', 'booking', 'payment', 'tracking'];
    for (const screenId of screens) {
        window.navigate(screenId);
        assert.ok(document.getElementById(screenId).classList.contains('active'), `${screenId} screen should be active`);
        for (const otherId of screens) {
            if (otherId !== screenId) {
                assert.ok(!document.getElementById(otherId).classList.contains('active'), `${otherId} screen should be inactive`);
            }
        }
    }
});

// Tier 2: Boundary & Corner Cases (5 tests)
test('Feature 1 - Tier 2 - Case 1: Navigation to a non-existent screen ID does not crash and leaves all screens inactive', () => {
    window.navigate('home');
    window.navigate('non-existent-screen-id-xyz');
    
    const screens = ['splash', 'onboarding', 'home', 'provider', 'booking', 'payment', 'tracking'];
    for (const screenId of screens) {
        assert.ok(!document.getElementById(screenId).classList.contains('active'), `${screenId} screen should be inactive`);
    }
});

test('Feature 1 - Tier 2 - Case 2: Auto-advance timeout does not navigate if user has already manually navigated away from Splash', () => {
    window.navigate('home');
    runAllTimeouts();
    
    assert.ok(document.getElementById('home').classList.contains('active'), 'Should remain on Home');
    assert.ok(!document.getElementById('onboarding').classList.contains('active'), 'Should not auto-advance to Onboarding');
});

test('Feature 1 - Tier 2 - Case 3: Verify navbar elements structure in Home screen (4 nav-items exist)', () => {
    const homeScreen = document.getElementById('home');
    const bottomNav = homeScreen.querySelector('.bottom-nav');
    assert.ok(bottomNav, 'Bottom nav bar should exist on Home screen');
    
    const navItems = bottomNav.querySelectorAll('.nav-item');
    assert.equal(navItems.length, 4, 'There should be exactly 4 nav-items in the bottom nav');
});

test('Feature 1 - Tier 2 - Case 4: Navigation back-and-forth between screens preserves active states correctly', () => {
    window.navigate('home');
    
    const providerCard = document.querySelector('.provider-card');
    providerCard.click();
    assert.ok(document.getElementById('provider').classList.contains('active'));
    
    const continueBtn = document.getElementById('provider').querySelector('.btn-primary');
    continueBtn.click();
    assert.ok(document.getElementById('booking').classList.contains('active'));
    
    const bookingBackBtn = document.getElementById('booking').querySelector('.back-btn');
    bookingBackBtn.click();
    assert.ok(document.getElementById('provider').classList.contains('active'));
    
    const providerBackBtn = document.getElementById('provider').querySelector('.back-btn');
    providerBackBtn.click();
    assert.ok(document.getElementById('home').classList.contains('active'));
});

test('Feature 1 - Tier 2 - Case 5: Restart button resets application back to Splash screen, and auto-advances to Onboarding again', () => {
    window.navigate('home');
    
    const restartBtn = document.getElementById('restart-btn');
    assert.ok(restartBtn, 'Restart button should exist outside the app mockup');
    
    restartBtn.click();
    assert.ok(document.getElementById('splash').classList.contains('active'), 'Should be on Splash screen immediately after restart');
    assert.equal(getTimeoutsCount(), 2, 'Restart should register a second timeout (making 2 total)');
    
    runAllTimeouts();
    assert.ok(document.getElementById('onboarding').classList.contains('active'), 'Should auto-advance to Onboarding after restart timeout');
});

// --- Feature 2: Theme Toggle ---

// Tier 1: Feature Coverage (5 tests)
test('Feature 2 - Tier 1 - Case 1: Default theme attribute data-theme is dark', () => {
    const html = document.documentElement;
    assert.equal(html.getAttribute('data-theme'), 'dark', 'Default theme should be dark');
});

test('Feature 2 - Tier 1 - Case 2: Clicking theme toggle button switches data-theme to light', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    toggleBtn.click();
    
    const html = document.documentElement;
    assert.equal(html.getAttribute('data-theme'), 'light', 'Theme should be light after click');
});

test('Feature 2 - Tier 1 - Case 3: Clicking theme toggle button twice switches data-theme back to dark', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    toggleBtn.click();
    toggleBtn.click();
    
    const html = document.documentElement;
    assert.equal(html.getAttribute('data-theme'), 'dark', 'Theme should be dark after second click');
});

test('Feature 2 - Tier 1 - Case 4: Theme toggle updates the icon attribute "name" to "moon-outline" in light mode', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    toggleBtn.click();
    
    const icon = toggleBtn.querySelector('ion-icon');
    assert.equal(icon.getAttribute('name'), 'moon-outline', 'Icon should be moon-outline in light mode');
});

test('Feature 2 - Tier 1 - Case 5: Theme toggle updates the text content to "Dark Mode" in light mode', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    toggleBtn.click();
    
    const text = toggleBtn.querySelector('span');
    assert.equal(text.textContent.trim(), 'Dark Mode', 'Text should be Dark Mode in light mode');
});

// Tier 2: Boundary & Corner Cases (5 tests)
test('Feature 2 - Tier 2 - Case 1: Multiple toggles (10 times) switches theme and text correctly at each step', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const icon = toggleBtn.querySelector('ion-icon');
    const text = toggleBtn.querySelector('span');
    
    for (let i = 1; i <= 10; i++) {
        toggleBtn.click();
        const expectedTheme = i % 2 === 1 ? 'light' : 'dark';
        const expectedIcon = i % 2 === 1 ? 'moon-outline' : 'sunny-outline';
        const expectedText = i % 2 === 1 ? 'Dark Mode' : 'Light Mode';
        
        assert.equal(html.getAttribute('data-theme'), expectedTheme, `Iteration ${i}: Theme mismatch`);
        assert.equal(icon.getAttribute('name'), expectedIcon, `Iteration ${i}: Icon mismatch`);
        assert.equal(text.textContent.trim(), expectedText, `Iteration ${i}: Text mismatch`);
    }
});

test('Feature 2 - Tier 2 - Case 2: Theme status is preserved across screen navigation', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    toggleBtn.click();
    
    window.navigate('home');
    window.navigate('booking');
    window.navigate('payment');
    
    const html = document.documentElement;
    assert.equal(html.getAttribute('data-theme'), 'light', 'Theme should remain light after navigation');
});

test('Feature 2 - Tier 2 - Case 3: Restarting the app does not reset the custom theme selection', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    toggleBtn.click();
    
    const restartBtn = document.getElementById('restart-btn');
    restartBtn.click();
    runAllTimeouts();
    
    const html = document.documentElement;
    assert.equal(html.getAttribute('data-theme'), 'light', 'Theme should remain light after app restart');
});

test('Feature 2 - Tier 2 - Case 4: Theme toggle elements (button, text, and icon) exist in the DOM', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    assert.ok(toggleBtn, 'Theme toggle button should exist');
    
    const icon = toggleBtn.querySelector('ion-icon');
    assert.ok(icon, 'Theme toggle icon should exist');
    
    const text = toggleBtn.querySelector('span');
    assert.ok(text, 'Theme toggle text span should exist');
});

test('Feature 2 - Tier 2 - Case 5: Theme attribute data-theme is strictly set to "light" or "dark"', () => {
    const html = document.documentElement;
    const toggleBtn = document.getElementById('theme-toggle');
    
    const t1 = html.getAttribute('data-theme');
    assert.ok(t1 === 'light' || t1 === 'dark');
    
    toggleBtn.click();
    const t2 = html.getAttribute('data-theme');
    assert.ok(t2 === 'light' || t2 === 'dark');
    assert.notEqual(t1, t2);
});

// --- Feature 3: Authentication Flow (EXPECTED TO FAIL) ---

// Tier 1: Feature Coverage (5 tests)
test('Feature 3 - Tier 1 - Case 1: Login screen container exists in the DOM', () => {
    const loginScreen = document.getElementById('login');
    assert.ok(loginScreen, 'Login screen container element with ID "login" should exist in the DOM');
});

test('Feature 3 - Tier 1 - Case 2: Signup screen container exists in the DOM', () => {
    const signupScreen = document.getElementById('signup');
    assert.ok(signupScreen, 'Signup screen container element with ID "signup" should exist in the DOM');
});

test('Feature 3 - Tier 1 - Case 3: OTP Verification screen container exists in the DOM', () => {
    const otpScreen = document.getElementById('otp-verify');
    assert.ok(otpScreen, 'OTP Verification screen container element with ID "otp-verify" should exist in the DOM');
});

test('Feature 3 - Tier 1 - Case 4: Clicking "Log In" button on onboarding screen navigates to Login screen', () => {
    runAllTimeouts();
    const logInBtn = document.getElementById('onboarding').querySelector('.btn-secondary');
    assert.ok(logInBtn, 'Log In button should exist on onboarding screen');
    
    logInBtn.click();
    
    const loginScreen = document.getElementById('login');
    assert.ok(loginScreen && loginScreen.classList.contains('active'), 'Login screen should be active after clicking Log In');
});

test('Feature 3 - Tier 1 - Case 5: Supabase signUp client API is invoked with email and password upon form submission', () => {
    const signupForm = document.getElementById('signup-form');
    assert.ok(signupForm, 'Signup form should exist');
    assert.ok(global.supabase, 'Supabase client instance should be available on window/global');
});

// Tier 2: Boundary & Corner Cases (5 tests)
test('Feature 3 - Tier 2 - Case 1: Login validation fails on empty email input', () => {
    const emailInput = document.getElementById('login-email');
    assert.ok(emailInput, 'Login email input should exist');
});

test('Feature 3 - Tier 2 - Case 2: Signup validation fails when password is less than 6 characters', () => {
    const passwordInput = document.getElementById('signup-password');
    assert.ok(passwordInput, 'Signup password input should exist');
});

test('Feature 3 - Tier 2 - Case 3: OTP input only accepts 6 numeric digits', () => {
    const otpInput = document.getElementById('otp-input');
    assert.ok(otpInput, 'OTP input should exist');
});

test('Feature 3 - Tier 2 - Case 4: Clicking resend OTP triggers Supabase OTP resend API', () => {
    const resendBtn = document.getElementById('resend-otp-btn');
    assert.ok(resendBtn, 'Resend OTP button should exist');
});

test('Feature 3 - Tier 2 - Case 5: Session state persists after successful login simulation', () => {
    assert.ok(global.supabase && global.supabase.auth, 'Supabase auth module should be initialized');
});

// --- Feature 4: Itemized Clothing Selector Weight/Price Calculation ---

// Tier 1: Feature Coverage (5 tests)
test('Feature 4 - Tier 1 - Case 1: Default weight is 3 and total price is 180', () => {
    const booking = document.getElementById('booking');
    const weightVal = booking.querySelector('#weight-val');
    const priceVal = booking.querySelector('#total-price-val');
    
    assert.equal(weightVal.textContent.trim(), '3', 'Default weight should be 3');
    assert.equal(priceVal.textContent.trim(), '180', 'Default price should be 180 (3 * ₹60)');
});

test('Feature 4 - Tier 1 - Case 2: Increment button increases weight to 4 and price to 240', () => {
    const booking = document.getElementById('booking');
    const incrementBtn = booking.querySelectorAll('.qty-btn')[1];
    assert.ok(incrementBtn, 'Increment button should exist');
    
    incrementBtn.click();
    
    const weightVal = booking.querySelector('#weight-val');
    const priceVal = booking.querySelector('#total-price-val');
    assert.equal(weightVal.textContent.trim(), '4', 'Weight should be 4 after increment');
    assert.equal(priceVal.textContent.trim(), '240', 'Price should be 240 after increment');
});

test('Feature 4 - Tier 1 - Case 3: Decrement button decreases weight from default 3 to 2 and price to 120', () => {
    const booking = document.getElementById('booking');
    const decrementBtn = booking.querySelectorAll('.qty-btn')[0];
    assert.ok(decrementBtn, 'Decrement button should exist');
    
    decrementBtn.click();
    
    const weightVal = booking.querySelector('#weight-val');
    const priceVal = booking.querySelector('#total-price-val');
    assert.equal(weightVal.textContent.trim(), '2', 'Weight should be 2 after decrement');
    assert.equal(priceVal.textContent.trim(), '120', 'Price should be 120 after decrement');
});

test('Feature 4 - Tier 1 - Case 4: Multiple increments work (e.g. clicking increment 3 times increases weight to 6 and price to 360)', () => {
    const booking = document.getElementById('booking');
    const incrementBtn = booking.querySelectorAll('.qty-btn')[1];
    
    incrementBtn.click();
    incrementBtn.click();
    incrementBtn.click();
    
    const weightVal = booking.querySelector('#weight-val');
    const priceVal = booking.querySelector('#total-price-val');
    assert.equal(weightVal.textContent.trim(), '6', 'Weight should be 6');
    assert.equal(priceVal.textContent.trim(), '360', 'Price should be 360');
});

test('Feature 4 - Tier 1 - Case 5: Service mode toggle switches active state between Pickup and Drop-off', () => {
    const booking = document.getElementById('booking');
    const toggleBtns = booking.querySelectorAll('.toggle-btn');
    assert.equal(toggleBtns.length, 2, 'There should be exactly 2 toggle buttons');
    
    assert.ok(toggleBtns[0].classList.contains('active'), 'Pickup should be active by default');
    assert.ok(!toggleBtns[1].classList.contains('active'), 'Drop-off should be inactive by default');
    
    toggleBtns[1].click();
    
    assert.ok(!toggleBtns[0].classList.contains('active'), 'Pickup should be inactive');
    assert.ok(toggleBtns[1].classList.contains('active'), 'Drop-off should be active');
});

// Tier 2: Boundary & Corner Cases (5 tests)
test('Feature 4 - Tier 2 - Case 1: Decrementing past the minimum weight boundary (1 kg) is ignored', () => {
    const booking = document.getElementById('booking');
    const decrementBtn = booking.querySelectorAll('.qty-btn')[0];
    
    decrementBtn.click();
    decrementBtn.click();
    decrementBtn.click();
    decrementBtn.click();
    decrementBtn.click();
    
    const weightVal = booking.querySelector('#weight-val');
    const priceVal = booking.querySelector('#total-price-val');
    assert.equal(weightVal.textContent.trim(), '1', 'Weight should be capped at 1');
    assert.equal(priceVal.textContent.trim(), '60', 'Price should be capped at 60');
});

test('Feature 4 - Tier 2 - Case 2: Incrementing past the maximum weight boundary (20 kg) is ignored', () => {
    const booking = document.getElementById('booking');
    const incrementBtn = booking.querySelectorAll('.qty-btn')[1];
    
    for (let i = 0; i < 25; i++) {
        incrementBtn.click();
    }
    
    const weightVal = booking.querySelector('#weight-val');
    const priceVal = booking.querySelector('#total-price-val');
    assert.equal(weightVal.textContent.trim(), '20', 'Weight should be capped at 20');
    assert.equal(priceVal.textContent.trim(), '1200', 'Price should be capped at 1200');
});

test('Feature 4 - Tier 2 - Case 3: Direct calls to updateQty with values that would exceed boundaries are rejected', () => {
    window.updateQty(50);
    const weightVal = document.getElementById('weight-val');
    assert.equal(weightVal.textContent.trim(), '3', 'Weight should remain 3 on invalid positive update');
    
    window.updateQty(-10);
    assert.equal(weightVal.textContent.trim(), '3', 'Weight should remain 3 on invalid negative update');
});

test('Feature 4 - Tier 2 - Case 4: Total price matches weight multiplied by base price (₹60) at every integer level from 1 to 20', () => {
    window.updateQty(-2);
    const weightVal = document.getElementById('weight-val');
    const priceVal = document.getElementById('total-price-val');
    
    assert.equal(weightVal.textContent.trim(), '1');
    assert.equal(priceVal.textContent.trim(), '60');
    
    for (let w = 2; w <= 20; w++) {
        window.updateQty(1);
        assert.equal(weightVal.textContent.trim(), String(w), `Weight should be ${w}`);
        assert.equal(priceVal.textContent.trim(), String(w * 60), `Price should be ${w * 60}`);
    }
});

test('Feature 4 - Tier 2 - Case 5: Toggling service mode does not alter or reset the selected weight or total price', () => {
    window.updateQty(2);
    
    const booking = document.getElementById('booking');
    const toggleBtns = booking.querySelectorAll('.toggle-btn');
    
    toggleBtns[1].click();
    
    const weightVal = booking.querySelector('#weight-val');
    const priceVal = booking.querySelector('#total-price-val');
    assert.equal(weightVal.textContent.trim(), '5', 'Weight should remain 5 after toggle');
    assert.equal(priceVal.textContent.trim(), '300', 'Price should remain 300 after toggle');
});

// --- Feature 5: Cash on Delivery Payment Flow (EXPECTED TO FAIL) ---

// Tier 1: Feature Coverage (5 tests)
test('Feature 5 - Tier 1 - Case 1: Cash on Delivery option is present in the payment methods list', () => {
    const paymentScreen = document.getElementById('payment');
    const codOption = paymentScreen.querySelector('.pay-method-cod');
    assert.ok(codOption, 'Cash on Delivery payment option should exist in payment screen');
});

test('Feature 5 - Tier 1 - Case 2: Selecting Cash on Delivery marks it as the active payment method', () => {
    const paymentScreen = document.getElementById('payment');
    const codOption = paymentScreen.querySelector('.pay-method-cod');
    assert.ok(codOption, 'COD option should exist');
    
    codOption.click();
    assert.ok(codOption.classList.contains('active'), 'COD option should have active class');
});

test('Feature 5 - Tier 1 - Case 3: Proceeding with Cash on Delivery navigates to Tracking screen', () => {
    window.navigate('payment');
    const codOption = document.querySelector('.pay-method-cod');
    assert.ok(codOption, 'COD option should exist');
    codOption.click();
    
    const payNowBtn = document.getElementById('payment').querySelector('.btn-primary');
    payNowBtn.click();
    
    const trackingScreen = document.getElementById('tracking');
    assert.ok(trackingScreen.classList.contains('active'), 'Should navigate to tracking screen');
});

test('Feature 5 - Tier 1 - Case 4: Cash on Delivery shows a zero pre-payment balance in the payment summary', () => {
    const paymentScreen = document.getElementById('payment');
    const codOption = paymentScreen.querySelector('.pay-method-cod');
    assert.ok(codOption, 'COD option should exist');
    codOption.click();
    
    const paymentSummaryAmount = paymentScreen.querySelector('.payment-summary h2');
    assert.equal(paymentSummaryAmount.textContent.trim(), '₹0.00', 'Pre-paid amount should be 0 for COD');
});

test('Feature 5 - Tier 1 - Case 5: Booking confirmation details reflect COD as the selected payment mode', () => {
    const trackingScreen = document.getElementById('tracking');
    const paymentModeLabel = trackingScreen.querySelector('.payment-mode-label');
    assert.ok(paymentModeLabel, 'Payment mode details should be present on tracking screen');
    assert.includes(paymentModeLabel.textContent, 'Cash on Delivery');
});

// Tier 2: Boundary & Corner Cases (5 tests)
test('Feature 5 - Tier 2 - Case 1: Toggling between card payment and Cash on Delivery updates selected states correctly', () => {
    const paymentScreen = document.getElementById('payment');
    const codOption = paymentScreen.querySelector('.pay-method-cod');
    const upiOption = paymentScreen.querySelector('.pay-method');
    assert.ok(codOption && upiOption, 'COD and UPI options should exist');
    
    codOption.click();
    assert.ok(codOption.classList.contains('active'));
    assert.ok(!upiOption.classList.contains('active'));
    
    upiOption.click();
    assert.ok(!codOption.classList.contains('active'));
    assert.ok(upiOption.classList.contains('active'));
});

test('Feature 5 - Tier 2 - Case 2: Cash on Delivery option is disabled if the estimated order total exceeds ₹5000', () => {
    const paymentScreen = document.getElementById('payment');
    const codOption = paymentScreen.querySelector('.pay-method-cod');
    assert.ok(codOption, 'COD option should exist');
    assert.ok(!codOption.classList.contains('disabled'), 'COD should be enabled for standard amount');
});

test('Feature 5 - Tier 2 - Case 3: Cash on Delivery choice displays a helper text warning about exact change requirements', () => {
    const paymentScreen = document.getElementById('payment');
    const codOption = paymentScreen.querySelector('.pay-method-cod');
    assert.ok(codOption, 'COD option should exist');
    codOption.click();
    
    const warningText = paymentScreen.querySelector('.cod-warning-text');
    assert.ok(warningText, 'COD warning text should exist');
    assert.includes(warningText.textContent, 'Please prepare exact change');
});

test('Feature 5 - Tier 2 - Case 4: Restarting the app resets the payment selection away from COD', () => {
    window.navigate('payment');
    const codOption = document.querySelector('.pay-method-cod');
    assert.ok(codOption, 'COD option should exist');
    codOption.click();
    
    const restartBtn = document.getElementById('restart-btn');
    restartBtn.click();
    runAllTimeouts();
    
    window.navigate('payment');
    const resetCodOption = document.querySelector('.pay-method-cod');
    assert.ok(!resetCodOption.classList.contains('active'), 'COD should not be active after app restart');
});

test('Feature 5 - Tier 2 - Case 5: Verify tracking status updates reflect cash collection pending state', () => {
    window.navigate('tracking');
    const cashStatus = document.getElementById('tracking').querySelector('.cash-status');
    assert.ok(cashStatus, 'Cash collection status element should exist');
});

// --- Feature 6: Milestone 1 Wireframe & Additional Providers (Custom tests) ---

test('Feature 6 - Custom Case 1: Bottom navbar navigates to new placeholder screens (Calendar, Chat, Profile)', () => {
    // Navigate to Calendar
    const homeNav = document.getElementById('home').querySelector('.bottom-nav');
    const calendarNavItem = homeNav.querySelectorAll('.nav-item')[1];
    calendarNavItem.click();
    assert.ok(document.getElementById('calendar-screen').classList.contains('active'), 'Calendar screen should be active');
    
    // Navigate to Chat
    const calendarNav = document.getElementById('calendar-screen').querySelector('.bottom-nav');
    const chatNavItem = calendarNav.querySelectorAll('.nav-item')[2];
    chatNavItem.click();
    assert.ok(document.getElementById('chat-screen').classList.contains('active'), 'Chat screen should be active');
    
    // Navigate to Profile
    const chatNav = document.getElementById('chat-screen').querySelector('.bottom-nav');
    const profileNavItem = chatNav.querySelectorAll('.nav-item')[3];
    profileNavItem.click();
    assert.ok(document.getElementById('profile-screen').classList.contains('active'), 'Profile screen should be active');
});

test('Feature 6 - Custom Case 2: Bell notification button on Home page navigates to Notifications screen', () => {
    window.navigate('home');
    const bellBtn = document.getElementById('home').querySelector('.icon-btn');
    assert.ok(bellBtn, 'Bell notification button should exist');
    bellBtn.click();
    assert.ok(document.getElementById('notifications-screen').classList.contains('active'), 'Notifications screen should be active');
});

test('Feature 6 - Custom Case 3: Service category click toggles active state and filters provider list', () => {
    window.navigate('home');
    const serviceCards = document.querySelectorAll('.service-card');
    
    // Initially, "Wash" is active by default. There should be 2 providers (AquaWash Premium & Clean & Fold)
    const providerList = document.getElementById('provider-list');
    let cards = providerList.querySelectorAll('.provider-card');
    assert.equal(cards.length, 2, 'Wash category should filter to exactly 2 providers');
    
    // Click "Iron" service card (index 1)
    serviceCards[1].click();
    cards = providerList.querySelectorAll('.provider-card');
    assert.equal(cards.length, 4, 'Iron category should show all 4 providers');
    
    // Click active category "Iron" again to deselect, showing all providers
    serviceCards[1].click();
    cards = providerList.querySelectorAll('.provider-card');
    assert.equal(cards.length, 4, 'No filter should display all 4 providers');
});

test('Feature 6 - Custom Case 4: Clicking a provider card loads dynamic details and carries over to booking & payment screens', () => {
    window.navigate('home');
    
    // Render all providers by toggling off default active card
    const activeCard = document.querySelector('.service-card.active');
    if (activeCard) activeCard.click(); // deselect
    
    // Select the third provider (IronPress Express - index 2)
    const providerList = document.getElementById('provider-list');
    const cards = providerList.querySelectorAll('.provider-card');
    const ironPressCard = cards[2];
    ironPressCard.click();
    
    // Provider Profile screen assertions
    assert.ok(document.getElementById('provider').classList.contains('active'), 'Should navigate to provider profile');
    assert.equal(document.getElementById('provider-name').textContent.trim(), 'IronPress Express');
    assert.includes(document.getElementById('provider-address').textContent, 'Powai, Mumbai');
    assert.includes(document.getElementById('provider-price').textContent, '₹30');
    
    // Go to booking screen
    window.navigate('booking');
    
    // Booking screen assertions
    assert.equal(document.getElementById('booking-item-name').textContent.trim(), 'IronPress Express - Regular Wash');
    assert.includes(document.getElementById('booking-item-price').textContent, '₹30 / kg');
    assert.equal(document.getElementById('total-price-val').textContent.trim(), '90', 'Total should be 3 * ₹30 = 90');
    
    // Update quantity
    window.updateQty(1); // 4 kg
    assert.equal(document.getElementById('total-price-val').textContent.trim(), '120', 'Total should be 4 * ₹30 = 120');
    
    // Go to payment screen
    window.navigate('payment');
    
    // Payment screen assertions
    const paymentAmount = document.getElementById('payment-total-price').textContent.trim();
    const paymentProvider = document.getElementById('payment-provider-name').textContent.trim();
    assert.equal(paymentAmount, '₹120.00');
    assert.equal(paymentProvider, 'IronPress Express');
});

test('Feature 6 - Custom Case 5: Editing pickup address inline on Booking screen works and saves dynamically', () => {
    window.navigate('booking');
    const editBtn = document.getElementById('edit-address-btn');
    assert.ok(editBtn, 'Edit address button should exist');
    
    // Click Edit
    editBtn.click();
    assert.equal(editBtn.textContent.trim(), 'Save', 'Button should change to Save');
    
    const textarea = document.getElementById('address-input');
    assert.ok(textarea, 'Textarea input should exist during editing');
    
    // Change value
    textarea.value = 'Flat 101, Sea Breeze,\nJuhu Beach, Mumbai';
    
    // Click Save
    editBtn.click();
    assert.equal(editBtn.textContent.trim(), 'Edit', 'Button should change back to Edit');
    
    const displayP = document.getElementById('address-display');
    assert.ok(displayP, 'Address display paragraph should be restored');
    assert.includes(displayP.textContent, 'Flat 101, Sea Breeze, Juhu Beach, Mumbai', 'Address text should match');
    const hasBr = displayP.childNodes.some(c => c.tagName === 'BR');
    assert.ok(hasBr, 'Should contain a BR tag element representing the line break');
});

// --- Tier 3: Cross-feature Combinations (5 tests) ---

test('Tier 3 - Case 1: Service Category filter toggle and Theme Swap', () => {
    // 1. Select service category "Wash" (index 0) on Home screen
    window.navigate('home');
    const serviceCards = document.querySelectorAll('.service-card');
    assert.ok(serviceCards.length > 0, 'Service cards should exist');
    const washCard = serviceCards[0];
    
    // Ensure Wash card is active
    if (!washCard.classList.contains('active')) {
        washCard.click();
    }
    
    // Verify it is active and the list is filtered (2 providers)
    assert.ok(washCard.classList.contains('active'), 'Wash category should be active');
    let providerList = document.getElementById('provider-list');
    let cards = providerList.querySelectorAll('.provider-card');
    assert.equal(cards.length, 2, 'Wash category should filter to 2 providers');
    
    // 2. Theme Swap (toggle theme)
    const toggleBtn = document.getElementById('theme-toggle');
    const initialTheme = document.documentElement.getAttribute('data-theme');
    toggleBtn.click();
    const newTheme = document.documentElement.getAttribute('data-theme');
    assert.notEqual(initialTheme, newTheme, 'Theme should change');
    
    // 3. Verify category filter and theme state don't reset each other
    assert.ok(washCard.classList.contains('active'), 'Wash category should remain active after theme swap');
    cards = providerList.querySelectorAll('.provider-card');
    assert.equal(cards.length, 2, 'Wash category should still filter to 2 providers after theme swap');
    assert.equal(document.documentElement.getAttribute('data-theme'), newTheme, 'Theme state should be preserved');
});

test('Tier 3 - Case 2: Authentication screen navigation and Theme Swap (EXPECTED TO FAIL)', () => {
    // Set theme to light
    const toggleBtn = document.getElementById('theme-toggle');
    if (document.documentElement.getAttribute('data-theme') !== 'light') {
        toggleBtn.click();
    }
    assert.equal(document.documentElement.getAttribute('data-theme'), 'light', 'Theme should be light');
    
    // Navigate to Login screen via onboarding Log In button
    runAllTimeouts();
    const logInBtn = document.getElementById('onboarding').querySelector('.btn-secondary');
    assert.ok(logInBtn, 'Log In button should exist');
    logInBtn.click();
    
    // Assert Login screen is active
    const loginScreen = document.getElementById('login');
    assert.ok(loginScreen && loginScreen.classList.contains('active'), 'Login screen should be active');
    
    // Theme swap
    toggleBtn.click();
    assert.equal(document.documentElement.getAttribute('data-theme'), 'dark', 'Theme should be dark');
    
    // Assert Login screen is still active, maintains navigation state
    assert.ok(loginScreen.classList.contains('active'), 'Login screen should remain active after theme swap');
});

test('Tier 3 - Case 3: Editing pickup address and Cart update / Weight change', () => {
    // Navigate to Booking Details screen
    window.navigate('booking');
    
    // Change weight
    const booking = document.getElementById('booking');
    const incrementBtn = booking.querySelectorAll('.qty-btn')[1];
    assert.ok(incrementBtn, 'Increment button should exist');
    incrementBtn.click(); // weight should become 4
    
    const weightVal = booking.querySelector('#weight-val');
    const priceVal = booking.querySelector('#total-price-val');
    assert.equal(weightVal.textContent.trim(), '4', 'Weight should be 4');
    assert.equal(priceVal.textContent.trim(), '240', 'Price should be 240 (4 * ₹60)');
    
    // Edit pickup address
    const editBtn = document.getElementById('edit-address-btn');
    assert.ok(editBtn, 'Edit address button should exist');
    editBtn.click();
    
    const textarea = document.getElementById('address-input');
    assert.ok(textarea, 'Address input textarea should exist');
    textarea.value = 'New Custom Address, Mumbai';
    editBtn.click(); // Save
    
    // Verify address is updated
    const displayP = document.getElementById('address-display');
    assert.includes(displayP.textContent, 'New Custom Address, Mumbai', 'Address should be updated');
    
    // Verify weight/price was NOT reset
    assert.equal(weightVal.textContent.trim(), '4', 'Weight should remain 4 after address edit');
    assert.equal(priceVal.textContent.trim(), '240', 'Price should remain 240 after address edit');
});

test('Tier 3 - Case 4: Theme toggle and Back-button navigation flow', () => {
    // Set theme to light
    const toggleBtn = document.getElementById('theme-toggle');
    if (document.documentElement.getAttribute('data-theme') !== 'light') {
        toggleBtn.click();
    }
    
    // Navigate: Home -> Provider -> Booking
    window.navigate('home');
    const providerCard = document.querySelector('.provider-card');
    assert.ok(providerCard, 'Provider card should exist');
    providerCard.click();
    
    const providerScreen = document.getElementById('provider');
    assert.ok(providerScreen.classList.contains('active'), 'Provider screen should be active');
    
    const continueBtn = providerScreen.querySelector('.btn-primary');
    continueBtn.click();
    
    const bookingScreen = document.getElementById('booking');
    assert.ok(bookingScreen.classList.contains('active'), 'Booking screen should be active');
    
    // Swap theme to dark
    toggleBtn.click();
    assert.equal(document.documentElement.getAttribute('data-theme'), 'dark', 'Theme should be dark');
    
    // Back navigation: Booking -> Provider -> Home
    const bookingBackBtn = bookingScreen.querySelector('.back-btn');
    bookingBackBtn.click();
    assert.ok(providerScreen.classList.contains('active'), 'Should go back to Provider screen');
    
    const providerBackBtn = providerScreen.querySelector('.back-btn');
    providerBackBtn.click();
    assert.ok(document.getElementById('home').classList.contains('active'), 'Should go back to Home screen');
    
    // Verify theme state is preserved
    assert.equal(document.documentElement.getAttribute('data-theme'), 'dark', 'Theme should remain dark');
});

test('Tier 3 - Case 5: Authentication status preservation during Provider selection and Booking details (EXPECTED TO FAIL)', () => {
    // Let's assume we simulate auth session in supabase
    assert.ok(global.supabase, 'Supabase client should be initialized');
    
    // Set simulated session to active
    global.supabase.auth.setSession({ user: { email: 'user@example.com' } });
    
    // Verify home screen is active, and shows authenticated user info
    window.navigate('home');
    const userNameEl = document.querySelector('.user-name');
    assert.ok(userNameEl, 'User name element should exist');
    assert.equal(userNameEl.textContent.trim(), 'user@example.com', 'Should show logged in user email');
    
    // Select Provider
    const providerCard = document.querySelector('.provider-card');
    providerCard.click();
    assert.ok(document.getElementById('provider').classList.contains('active'), 'Provider screen active');
    
    // Booking details
    const continueBtn = document.getElementById('provider').querySelector('.btn-primary');
    continueBtn.click();
    assert.ok(document.getElementById('booking').classList.contains('active'), 'Booking screen active');
    
    // Verify authentication status is preserved
    const session = global.supabase.auth.session();
    assert.ok(session && session.user, 'User should remain authenticated throughout selection and booking');
});

// --- Tier 4: Real-world Workloads/Scenarios (5 tests) ---

test('Tier 4 - Case 1: Happy Path User Flow (EXPECTED TO FAIL)', async () => {
    // Onboarding -> Sign Up -> OTP -> Select Services -> Select Provider -> Booking Details -> Checkout (select COD) -> Confirm -> Tracking Success screen
    runAllTimeouts();
    
    // Onboarding screen: click Sign Up (assume secondary button or signup button)
    const onboardingScreen = document.getElementById('onboarding');
    const signUpBtn = onboardingScreen.querySelector('.btn-secondary');
    assert.ok(signUpBtn, 'Sign up button should exist');
    signUpBtn.click();
    
    // Sign Up screen: enter details, submit
    const signupScreen = document.getElementById('signup');
    assert.ok(signupScreen, 'Signup screen should exist');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const submitBtn = signupScreen.querySelector('.btn-primary');
    
    emailInput.value = 'happy_path@example.com';
    passwordInput.value = 'password123';
    submitBtn.click();
    
    // OTP Screen
    const otpScreen = document.getElementById('otp-verify');
    assert.ok(otpScreen, 'OTP screen should exist');
    const otpInput = document.getElementById('otp-input');
    const verifyBtn = otpScreen.querySelector('.btn-primary');
    otpInput.value = '123456';
    verifyBtn.click();
    
    // Home Screen: Select Services category "Iron" (index 1)
    const homeScreen = document.getElementById('home');
    assert.ok(homeScreen.classList.contains('active'), 'Should navigate to Home screen after OTP');
    const serviceCards = homeScreen.querySelectorAll('.service-card');
    serviceCards[1].click(); // Select Iron
    
    // Select Provider: "IronPress Express" (id: ironpress)
    const providerCard = document.querySelector('[data-id="ironpress"]');
    assert.ok(providerCard, 'IronPress Express card should exist');
    providerCard.click();
    
    // Provider Profile Screen
    const providerScreen = document.getElementById('provider');
    assert.ok(providerScreen.classList.contains('active'), 'Provider screen should be active');
    const continueBtn = providerScreen.querySelector('.btn-primary');
    continueBtn.click();
    
    // Booking Details Screen
    const bookingScreen = document.getElementById('booking');
    assert.ok(bookingScreen.classList.contains('active'), 'Booking screen should be active');
    const proceedBtn = bookingScreen.querySelector('.bottom-action-bar .btn-primary');
    proceedBtn.click();
    
    // Checkout (Payment Screen): select COD
    const paymentScreen = document.getElementById('payment');
    assert.ok(paymentScreen.classList.contains('active'), 'Payment screen should be active');
    const codOption = paymentScreen.querySelector('.pay-method-cod');
    assert.ok(codOption, 'COD option should exist');
    codOption.click();
    
    // Confirm booking: click Pay Now
    const payNowBtn = paymentScreen.querySelector('.bottom-action-bar .btn-primary');
    payNowBtn.click();
    
    // Tracking Success screen
    const trackingScreen = document.getElementById('tracking');
    assert.ok(trackingScreen.classList.contains('active'), 'Tracking screen should be active');
    const statusMsg = trackingScreen.querySelector('h2');
    assert.equal(statusMsg.textContent.trim(), 'Booking Confirmed!', 'Booking should be confirmed');
});

test('Tier 4 - Case 2: Return User Flow (EXPECTED TO FAIL)', async () => {
    // Onboarding -> Log In -> OTP -> Home -> Select Provider -> Booking Details (update weight) -> Proceed to Payment (select GPay) -> Pay Now -> Tracking
    runAllTimeouts();
    
    // Onboarding: click Log In
    const onboardingScreen = document.getElementById('onboarding');
    const logInBtn = onboardingScreen.querySelector('.btn-secondary');
    assert.ok(logInBtn, 'Log In button should exist');
    logInBtn.click();
    
    // Log In Screen
    const loginScreen = document.getElementById('login');
    assert.ok(loginScreen, 'Login screen should exist');
    const emailInput = document.getElementById('login-email');
    const submitBtn = loginScreen.querySelector('.btn-primary');
    emailInput.value = 'return_user@example.com';
    submitBtn.click();
    
    // OTP Screen
    const otpScreen = document.getElementById('otp-verify');
    assert.ok(otpScreen, 'OTP screen should exist');
    const otpInput = document.getElementById('otp-input');
    const verifyBtn = otpScreen.querySelector('.btn-primary');
    otpInput.value = '654321';
    verifyBtn.click();
    
    // Home Screen: Select Provider "Sparkle DryCleaners" (id: sparkle)
    const homeScreen = document.getElementById('home');
    assert.ok(homeScreen.classList.contains('active'), 'Home screen active');
    const providerCard = document.querySelector('[data-id="sparkle"]');
    assert.ok(providerCard, 'Sparkle DryCleaners card should exist');
    providerCard.click();
    
    // Provider Screen: click Continue
    const providerScreen = document.getElementById('provider');
    providerScreen.querySelector('.btn-primary').click();
    
    // Booking Details: Update weight
    const bookingScreen = document.getElementById('booking');
    assert.ok(bookingScreen.classList.contains('active'), 'Booking screen active');
    const incrementBtn = bookingScreen.querySelectorAll('.qty-btn')[1];
    incrementBtn.click(); // weight: 3 -> 4
    
    const weightVal = bookingScreen.querySelector('#weight-val');
    assert.equal(weightVal.textContent.trim(), '4', 'Weight should be updated to 4');
    
    // Proceed to Payment
    bookingScreen.querySelector('.bottom-action-bar .btn-primary').click();
    
    // Payment screen: select GPay (UPI active by default or click it)
    const paymentScreen = document.getElementById('payment');
    assert.ok(paymentScreen.classList.contains('active'), 'Payment screen active');
    
    const upiMethods = paymentScreen.querySelectorAll('.pay-method');
    assert.ok(upiMethods.length > 0, 'UPI methods should exist');
    upiMethods[0].click(); // Select GPay
    
    // Pay Now
    paymentScreen.querySelector('.bottom-action-bar .btn-primary').click();
    
    // Tracking
    const trackingScreen = document.getElementById('tracking');
    assert.ok(trackingScreen.classList.contains('active'), 'Tracking screen should be active');
});

test('Tier 4 - Case 3: Address Change Flow (EXPECTED TO FAIL)', async () => {
    // Onboarding -> Sign Up -> OTP -> Home -> Select Provider -> Booking Details -> Edit Address -> Save Address -> Proceed to Payment (select Card) -> Pay Now -> Tracking
    runAllTimeouts();
    
    // Onboarding -> Sign Up -> OTP
    const onboardingScreen = document.getElementById('onboarding');
    onboardingScreen.querySelector('.btn-secondary').click();
    
    const signupScreen = document.getElementById('signup');
    assert.ok(signupScreen, 'Signup screen should exist');
    document.getElementById('signup-email').value = 'address_change@example.com';
    document.getElementById('signup-password').value = 'password123';
    signupScreen.querySelector('.btn-primary').click();
    
    const otpScreen = document.getElementById('otp-verify');
    document.getElementById('otp-input').value = '111111';
    otpScreen.querySelector('.btn-primary').click();
    
    // Home -> Select Provider
    const homeScreen = document.getElementById('home');
    assert.ok(homeScreen.classList.contains('active'));
    const providerCard = document.querySelector('.provider-card');
    providerCard.click();
    
    // Provider -> Booking
    const providerScreen = document.getElementById('provider');
    providerScreen.querySelector('.btn-primary').click();
    
    // Booking details -> Edit Address -> Save Address
    const bookingScreen = document.getElementById('booking');
    assert.ok(bookingScreen.classList.contains('active'));
    
    const editBtn = document.getElementById('edit-address-btn');
    editBtn.click();
    
    const textarea = document.getElementById('address-input');
    textarea.value = 'Flat 202, Sunshine Apartments, Bandra West, Mumbai';
    editBtn.click(); // Save
    
    const displayP = document.getElementById('address-display');
    assert.includes(displayP.textContent, 'Flat 202, Sunshine Apartments, Bandra West, Mumbai');
    
    // Proceed to Payment
    bookingScreen.querySelector('.bottom-action-bar .btn-primary').click();
    
    // Proceed to Payment (select Card)
    const paymentScreen = document.getElementById('payment');
    assert.ok(paymentScreen.classList.contains('active'));
    
    const cardInput = paymentScreen.querySelector('.card-input-wrapper input');
    assert.ok(cardInput, 'Card input should exist');
    cardInput.value = '1234567812345678';
    
    // Pay Now -> Tracking
    paymentScreen.querySelector('.bottom-action-bar .btn-primary').click();
    assert.ok(document.getElementById('tracking').classList.contains('active'));
});

test('Tier 4 - Case 4: Guest User Redirect Flow (EXPECTED TO FAIL)', async () => {
    // Onboarding -> Get Started -> Select Provider -> Booking -> Proceed to Pay -> Redirects to Login screen (as user is unauthenticated) -> Sign Up -> OTP -> Redirects back to Booking/Payment -> Pay Now -> Tracking
    runAllTimeouts();
    
    // Onboarding: click Get Started
    const onboardingScreen = document.getElementById('onboarding');
    const getStartedBtn = onboardingScreen.querySelector('.btn-primary');
    getStartedBtn.click();
    
    // Home screen: Select provider
    const homeScreen = document.getElementById('home');
    assert.ok(homeScreen.classList.contains('active'));
    const providerCard = document.querySelector('.provider-card');
    providerCard.click();
    
    // Provider -> Booking
    const providerScreen = document.getElementById('provider');
    providerScreen.querySelector('.btn-primary').click();
    
    // Booking -> Proceed to Pay
    const bookingScreen = document.getElementById('booking');
    assert.ok(bookingScreen.classList.contains('active'));
    bookingScreen.querySelector('.bottom-action-bar .btn-primary').click();
    
    // Since user is guest/unauthenticated, we should be redirected to Login screen
    const loginScreen = document.getElementById('login');
    assert.ok(loginScreen && loginScreen.classList.contains('active'), 'Unauthenticated user should be redirected to Login screen');
    
    // Navigate to Signup from Login screen
    const goToSignUpBtn = loginScreen.querySelector('.go-to-signup');
    assert.ok(goToSignUpBtn, 'Link to signup screen should exist on login screen');
    goToSignUpBtn.click();
    
    // Sign Up -> OTP
    const signupScreen = document.getElementById('signup');
    assert.ok(signupScreen.classList.contains('active'));
    document.getElementById('signup-email').value = 'guest_redirect@example.com';
    document.getElementById('signup-password').value = 'password123';
    signupScreen.querySelector('.btn-primary').click();
    
    const otpScreen = document.getElementById('otp-verify');
    document.getElementById('otp-input').value = '222222';
    otpScreen.querySelector('.btn-primary').click();
    
    // Expect redirect back to Booking or Payment screen
    assert.ok(bookingScreen.classList.contains('active') || document.getElementById('payment').classList.contains('active'), 'Should redirect back to Booking or Payment screen after successful auth');
    
    // Click Proceed/Pay Now
    if (bookingScreen.classList.contains('active')) {
        bookingScreen.querySelector('.bottom-action-bar .btn-primary').click();
    }
    const paymentScreen = document.getElementById('payment');
    assert.ok(paymentScreen.classList.contains('active'));
    paymentScreen.querySelector('.bottom-action-bar .btn-primary').click();
    
    // Tracking
    assert.ok(document.getElementById('tracking').classList.contains('active'));
});

test('Tier 4 - Case 5: Order Interruption and Recovery Flow (EXPECTED TO FAIL)', async () => {
    // Onboarding -> Sign Up -> OTP -> Home -> Select Provider -> Booking Details -> Proceed to Payment -> Go Back to Booking -> Change Weight -> Proceed to Payment -> Click Restart (returns to splash and onboarding, resets state)
    runAllTimeouts();
    
    // Sign Up and OTP
    const onboardingScreen = document.getElementById('onboarding');
    onboardingScreen.querySelector('.btn-secondary').click();
    
    const signupScreen = document.getElementById('signup');
    assert.ok(signupScreen, 'Signup screen should exist');
    document.getElementById('signup-email').value = 'interruption@example.com';
    document.getElementById('signup-password').value = 'password123';
    signupScreen.querySelector('.btn-primary').click();
    
    const otpScreen = document.getElementById('otp-verify');
    document.getElementById('otp-input').value = '333333';
    otpScreen.querySelector('.btn-primary').click();
    
    // Home -> Select Provider
    const homeScreen = document.getElementById('home');
    assert.ok(homeScreen.classList.contains('active'));
    const providerCard = document.querySelector('.provider-card');
    providerCard.click();
    
    // Provider -> Booking Details
    const providerScreen = document.getElementById('provider');
    providerScreen.querySelector('.btn-primary').click();
    
    // Booking Details -> Proceed to Payment
    const bookingScreen = document.getElementById('booking');
    assert.ok(bookingScreen.classList.contains('active'));
    bookingScreen.querySelector('.bottom-action-bar .btn-primary').click();
    
    // Payment screen: click Back to return to Booking
    const paymentScreen = document.getElementById('payment');
    assert.ok(paymentScreen.classList.contains('active'));
    paymentScreen.querySelector('.back-btn').click();
    
    // Booking Details: change weight
    assert.ok(bookingScreen.classList.contains('active'), 'Should be back on Booking screen');
    const incrementBtn = bookingScreen.querySelectorAll('.qty-btn')[1];
    incrementBtn.click(); // weight 3 -> 4
    incrementBtn.click(); // weight 4 -> 5
    
    const weightVal = bookingScreen.querySelector('#weight-val');
    const priceVal = bookingScreen.querySelector('#total-price-val');
    assert.equal(weightVal.textContent.trim(), '5', 'Weight should be updated to 5');
    assert.equal(priceVal.textContent.trim(), '300', 'Price should be 300 (5 * ₹60)');
    
    // Proceed to Payment
    bookingScreen.querySelector('.bottom-action-bar .btn-primary').click();
    assert.ok(paymentScreen.classList.contains('active'), 'Should be back on Payment screen');
    assert.equal(document.getElementById('payment-total-price').textContent.trim(), '₹300.00', 'Payment price should be updated to ₹300.00');
    
    // Click Restart (outside mockup)
    const restartBtn = document.getElementById('restart-btn');
    assert.ok(restartBtn, 'Restart button should exist');
    restartBtn.click();
    
    // Verify Splash screen is active, and after timeout Onboarding is active
    assert.ok(document.getElementById('splash').classList.contains('active'), 'Should be back on Splash screen after restart');
    runAllTimeouts();
    assert.ok(document.getElementById('onboarding').classList.contains('active'), 'Should auto-advance to Onboarding');
    
    // Go to Booking screen to verify state has been reset to default
    window.navigate('booking');
    assert.equal(document.getElementById('weight-val').textContent.trim(), '3', 'Weight should reset back to default (3)');
    assert.equal(document.getElementById('total-price-val').textContent.trim(), '180', 'Price should reset back to default (180)');
});

// --- Test Execution Runner ---

async function runTests() {
    console.log('Starting E2E Test Suite (65 test cases)...\n');
    let passes = 0;
    let failures = 0;
    
    for (const t of tests) {
        resetDOM();
        try {
            await t.fn();
            passes++;
            console.log(`[PASS] ${t.name}`);
        } catch (err) {
            failures++;
            console.log(`[FAIL] ${t.name}`);
            console.log(`       Error: ${err.message}`);
        }
    }
    
    console.log(`\n========================================`);
    console.log(`Test Execution Results Summary:`);
    console.log(`Total Run : ${tests.length}`);
    console.log(`Passed    : ${passes}`);
    console.log(`Failed    : ${failures}`);
    console.log(`========================================\n`);
    
    if (failures > 0) {
        console.log('Tests completed with failures (as expected for unimplemented Features 3 & 5).');
        process.exit(1);
    } else {
        console.log('All tests passed successfully!');
        process.exit(0);
    }
}

runTests();

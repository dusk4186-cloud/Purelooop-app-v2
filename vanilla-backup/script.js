// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Theme Toggle Logic ---
    const htmlEl = document.documentElement;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('ion-icon');
    const themeText = themeToggleBtn.querySelector('span');

    let currentTheme = 'dark';

    themeToggleBtn.addEventListener('click', () => {
        if (currentTheme === 'dark') {
            htmlEl.setAttribute('data-theme', 'light');
            themeIcon.setAttribute('name', 'moon-outline');
            themeText.textContent = 'Dark Mode';
            currentTheme = 'light';
        } else {
            htmlEl.setAttribute('data-theme', 'dark');
            themeIcon.setAttribute('name', 'sunny-outline');
            themeText.textContent = 'Light Mode';
            currentTheme = 'dark';
        }
    });

    // --- Restart Logic ---
    document.getElementById('restart-btn').addEventListener('click', () => {
        navigate('splash');
        setTimeout(() => {
            navigate('onboarding');
        }, 2500); // Simulate loading time
    });

    // --- Navigation Logic ---
    window.navigate = function(screenId) {
        // Hide all screens
        document.querySelectorAll('.app-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('active');
        }
    };

    // Auto-advance Splash to Onboarding on initial load
    setTimeout(() => {
        if(document.getElementById('splash').classList.contains('active')) {
            navigate('onboarding');
        }
    }, 2500);


    // --- Booking Screen Logic (Itemized Weight & Pricing) ---
    let items = {
        shirts: { qty: 0, weight: 0.2 },
        trousers: { qty: 0, weight: 0.6 },
        bedsheets: { qty: 0, weight: 1.0 }
    };
    let currentPricePerKg = 60; // Initial default base price
    const totalWeightEl = document.getElementById('total-weight-calc');
    const totalPriceEl = document.getElementById('total-price-val');
    
    window.updateItemQty = function(item, change) {
        let newQty = items[item].qty + change;
        if (newQty >= 0 && newQty <= 50) {
            items[item].qty = newQty;
            const qtyEl = document.getElementById('qty-' + item);
            if (qtyEl) qtyEl.textContent = newQty;
            
            // Calculate total weight
            let totalWeight = 0;
            for (const key in items) {
                totalWeight += items[key].qty * items[key].weight;
            }
            if (totalWeightEl) totalWeightEl.textContent = totalWeight.toFixed(1);
            
            // Calculate total price
            const total = Math.round(totalWeight * currentPricePerKg);
            if (totalPriceEl) totalPriceEl.textContent = total;
            
            // Sync with payment screen
            const paymentTotalEl = document.getElementById('payment-total-price');
            if (paymentTotalEl) {
                paymentTotalEl.textContent = `₹${total}.00`;
            }
        }
    };

    // Toggle Button Logic (Pickup / Drop-off)
    window.selectToggle = function(element) {
        const parent = element.parentElement;
        parent.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
    };
    
    // Select Payment Method
    window.selectPayMethod = function(element) {
        const parent = element.parentElement;
        parent.querySelectorAll('.pay-method').forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
    };

    // --- Validation, Toasts, and Interactions ---
    window.validateLogin = function() {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const btn = document.getElementById('login-btn');
        if (email && pass) { btn.removeAttribute('disabled'); }
        else { btn.setAttribute('disabled', 'true'); }
    };
    
    window.validateSignup = function() {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const pass = document.getElementById('signup-password').value;
        const btn = document.getElementById('signup-btn');
        if (name && email && pass) { btn.removeAttribute('disabled'); }
        else { btn.setAttribute('disabled', 'true'); }
    };

    window.togglePassword = function(inputId, iconEl) {
        const input = document.getElementById(inputId);
        if (input.type === 'password') {
            input.type = 'text';
            iconEl.setAttribute('name', 'eye-off-outline');
        } else {
            input.type = 'password';
            iconEl.setAttribute('name', 'eye-outline');
        }
    };
    
    window.showToast = function(msg) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.style.background = 'var(--text-primary)';
        toast.style.color = 'var(--bg-main)';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '24px';
        toast.style.fontSize = '14px';
        toast.style.fontWeight = '600';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        toast.textContent = msg;
        
        container.appendChild(toast);
        
        setTimeout(() => { toast.style.opacity = '1'; }, 10);
        setTimeout(() => { 
            toast.style.opacity = '0'; 
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    };
    
    let otpTimerInterval;
    function startOtpTimer() {
        clearInterval(otpTimerInterval);
        let timeLeft = 60;
        const timerEl = document.getElementById('otp-timer-text');
        if (!timerEl) return;
        timerEl.textContent = "01:00";
        otpTimerInterval = setInterval(() => {
            timeLeft--;
            let mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            let secs = (timeLeft % 60).toString().padStart(2, '0');
            timerEl.textContent = `${mins}:${secs}`;
            if (timeLeft <= 0) {
                clearInterval(otpTimerInterval);
                timerEl.textContent = "00:00 (Resend OTP)";
                timerEl.style.cursor = 'pointer';
            }
        }, 1000);
    }

    // --- Authentication Flow ---
    window.simulateLogin = function() {
        showToast("Login successful!");
        navigate('home');
    };
    window.simulateSignup = function() {
        showToast("OTP sent to your email!");
        navigate('otp');
        startOtpTimer();
    };
    window.verifyOtp = function() {
        clearInterval(otpTimerInterval);
        showToast("Account verified successfully!");
        navigate('home');
    };

    // --- Milestone 1: Interactive Wiring & Additional Providers ---

    // Providers Data
    const providersData = [
        {
            id: "aquawash",
            name: "AquaWash Premium",
            shortLocation: "Andheri West, Mumbai",
            fullLocation: "Lokhandwala Complex, Andheri West, Mumbai",
            rating: "4.8",
            price: 60,
            services: ["Wash", "Iron"],
            icon: "water-outline",
            about: "We provide eco-friendly, premium washing services using organic detergents. Perfect for daily wear and sensitive fabrics."
        },
        {
            id: "sparkle",
            name: "Sparkle DryCleaners",
            shortLocation: "Bandra East, Mumbai",
            fullLocation: "Linking Road, Bandra East, Mumbai",
            rating: "4.6",
            price: 80,
            services: ["Dry Clean", "Iron"],
            icon: "color-wand-outline",
            about: "Professional dry cleaning services for your premium wear, suits, and delicate fabrics. High-tech equipment used."
        },
        {
            id: "ironpress",
            name: "IronPress Express",
            shortLocation: "Powai, Mumbai",
            fullLocation: "Hiranandani Gardens, Powai, Mumbai",
            rating: "4.7",
            price: 30,
            services: ["Iron"],
            icon: "shirt-outline",
            about: "Super fast steam ironing services at affordable rates. Wrinkle-free clothes delivered in 24 hours."
        },
        {
            id: "cleanfold",
            name: "Clean & Fold",
            shortLocation: "Juhu, Mumbai",
            fullLocation: "Juhu Tara Road, Juhu, Mumbai",
            rating: "4.5",
            price: 50,
            services: ["Wash", "Iron", "Dry Clean"],
            icon: "sparkles-outline",
            about: "Complete laundry solution including washing, drying, folding, and ironing. High quality cleaning standards."
        }
    ];

    let selectedProvider = providersData[0]; // Default selected provider

    // Dynamic Provider Detail Selector & Carryover
    window.selectProvider = function(providerId) {
        const provider = providersData.find(p => p.id === providerId);
        if (!provider) return;
        
        selectedProvider = provider;
        
        // Update provider profile screen
        const nameEl = document.getElementById('provider-name');
        if (nameEl) nameEl.textContent = provider.name;
        
        const addressEl = document.getElementById('provider-address');
        if (addressEl) {
            addressEl.innerHTML = `<ion-icon name="location-outline"></ion-icon> ${provider.fullLocation}`;
        }
        
        const ratingEl = document.getElementById('provider-rating');
        if (ratingEl) {
            ratingEl.innerHTML = `<ion-icon name="star"></ion-icon> ${provider.rating}`;
        }
        
        const priceEl = document.getElementById('provider-price');
        if (priceEl) {
            priceEl.textContent = `₹${provider.price}`;
        }
        
        const aboutEl = document.getElementById('provider-about');
        if (aboutEl) {
            aboutEl.textContent = provider.about;
        }
        
        const heroIconEl = document.getElementById('provider-hero-icon');
        if (heroIconEl) {
            heroIconEl.innerHTML = `<ion-icon name="${provider.icon}"></ion-icon>`;
        }
        
        // Carry selection data over to booking screen
        currentPricePerKg = provider.price;
        
        const bookingItemNameEl = document.getElementById('booking-item-name');
        if (bookingItemNameEl) {
            bookingItemNameEl.textContent = `${provider.name} - Regular Wash`;
        }
        
        const bookingItemPriceEl = document.getElementById('booking-item-price');
        if (bookingItemPriceEl) {
            bookingItemPriceEl.textContent = `₹${currentPricePerKg} / kg`;
        }
        
        // Re-calculate booking total
        const total = weight * currentPricePerKg;
        if (totalPriceEl) {
            totalPriceEl.textContent = total;
        }
        
        // Carry selection data over to payment screen
        const paymentTotalEl = document.getElementById('payment-total-price');
        if (paymentTotalEl) {
            paymentTotalEl.textContent = `₹${total}.00`;
        }
        const paymentProviderEl = document.getElementById('payment-provider-name');
        if (paymentProviderEl) {
            paymentProviderEl.textContent = provider.name;
        }
        
        // Route to the provider page
        navigate('provider');
    };

    // Render Providers list on home screen
    function renderProviders(filterService = null, searchQuery = '') {
        const providerListContainer = document.getElementById('provider-list');
        if (!providerListContainer) return;
        
        providerListContainer.innerHTML = '';
        
        let filtered = providersData;
        
        if (filterService) {
            filtered = filtered.filter(p => p.services.includes(filterService));
        }
        
        if (searchQuery) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
            
        if (filtered.length === 0) {
            providerListContainer.innerHTML = `
                <div style="text-align: center; padding: 24px; color: var(--text-secondary);">
                    <p>No providers available for this selection.</p>
                </div>
            `;
            return;
        }
        
        filtered.forEach(provider => {
            const card = document.createElement('div');
            card.className = 'provider-card';
            card.dataset.id = provider.id;
            
            card.innerHTML = `
                <div class="provider-image">
                    <ion-icon name="${provider.icon}"></ion-icon>
                </div>
                <div class="provider-info">
                    <h4>${provider.name}</h4>
                    <p class="address">${provider.shortLocation}</p>
                    <div class="provider-meta">
                        <span class="rating"><ion-icon name="star"></ion-icon> ${provider.rating}</span>
                        <span class="price">₹${provider.price}/kg</span>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => {
                selectProvider(provider.id);
            });
            
            providerListContainer.appendChild(card);
        });
    }

    // Category Selector and Filtering Wiring
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            const isActive = card.classList.contains('active');
            
            // Deactivate all service cards
            serviceCards.forEach(c => c.classList.remove('active'));
            
            let activeService = null;
            if (!isActive) {
                // Toggle active on clicked card
                card.classList.add('active');
                activeService = card.querySelector('span').textContent.trim();
                showToast(`Filtering by ${activeService}`);
            }
            
            // Render providers matching the selected service (or all if none active)
            const searchVal = document.getElementById('search-input') ? document.getElementById('search-input').value : '';
            renderProviders(activeService, searchVal);
        });
    });

    // Search Filtering Wiring
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value;
            let activeService = null;
            const activeCard = document.querySelector('.service-card.active');
            if (activeCard) activeService = activeCard.querySelector('span').textContent.trim();
            renderProviders(activeService, val);
        });
    }

    // Wire Address Edit and Save functionality
    const editAddressBtn = document.getElementById('edit-address-btn');
    if (editAddressBtn) {
        editAddressBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const addressContainer = document.querySelector('.address-text');
            if (!addressContainer) return;

            if (editAddressBtn.textContent === 'Edit') {
                // Switch to edit mode
                editAddressBtn.textContent = 'Save';
                const addressDisplay = addressContainer.querySelector('p');
                if (addressDisplay) {
                    const currentAddress = addressDisplay.innerHTML.replace(/<br\s*\/?>/gi, '\n');
                    const textarea = document.createElement('textarea');
                    textarea.id = 'address-input';
                    textarea.value = currentAddress;
                    textarea.style.width = '100%';
                    textarea.style.height = '60px';
                    textarea.style.background = 'var(--bg-elevated)';
                    textarea.style.color = 'var(--text-primary)';
                    textarea.style.border = '1px solid var(--border-color)';
                    textarea.style.borderRadius = '8px';
                    textarea.style.padding = '8px';
                    textarea.style.fontSize = '12px';
                    textarea.style.fontFamily = 'inherit';
                    textarea.style.resize = 'none';
                    textarea.style.outline = 'none';
                    
                    addressDisplay.replaceWith(textarea);
                    textarea.focus();
                }
            } else {
                // Switch to view mode (Save)
                const textarea = addressContainer.querySelector('textarea');
                if (textarea) {
                    const newAddress = textarea.value.trim().replace(/\n/g, '<br>');
                    const p = document.createElement('p');
                    p.id = 'address-display';
                    p.innerHTML = newAddress || 'No address specified';
                    
                    textarea.replaceWith(p);
                }
                editAddressBtn.textContent = 'Edit';
            }
        });
    }

    // Initial load: render providers filtered by the default active service (Wash)
    let initialService = null;
    const allServiceCards = document.querySelectorAll('.service-card');
    allServiceCards.forEach(card => {
        if (card.classList.contains('active')) {
            const span = card.querySelector('span');
            if (span) initialService = span.textContent.trim();
        }
    });
    renderProviders(initialService);

});

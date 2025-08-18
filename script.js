document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.form-step');
    const sidebarSteps = document.querySelectorAll('.sidebar .step');
    const prevBtn = document.querySelector('.btn-prev');
    const nextBtn = document.querySelector('.btn-next');
    const confirmBtn = document.querySelector('.btn-confirm');
    const form = document.getElementById('multiStepForm');
    const navButtons = document.querySelector('.navigation-buttons');

    let currentStep = 1;
    let selectedPlan = null;
    let billingCycle = 'monthly'; // 'monthly' or 'yearly'
    let addons = [];

    const planPrices = {
        Arcade: { monthly: 9, yearly: 90 },
        Advanced: { monthly: 12, yearly: 120 },
        Pro: { monthly: 15, yearly: 150 }
    };

    const addonPrices = {
        'Online service': { monthly: 1, yearly: 10 },
        'Larger storage': { monthly: 2, yearly: 20 },
        'Customizable profile': { monthly: 2, yearly: 20 }
    };

    const updateStepVisibility = () => {
        steps.forEach(step => {
            step.classList.toggle('active', parseInt(step.dataset.step) === currentStep);
        });

        sidebarSteps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === currentStep);
        });

        prevBtn.style.display = currentStep > 1 && currentStep < 5 ? 'block' : 'none';
        nextBtn.style.display = currentStep < 4 ? 'block' : 'none';
        confirmBtn.style.display = currentStep === 4 ? 'block' : 'none';

        if (currentStep === 5) {
            navButtons.style.display = 'none';
        }
    };

    const validateStep1 = () => {
        let isValid = true;
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');

        if (!nameInput.value.trim()) {
            showError(nameInput, 'This field is required');
            isValid = false;
        } else {
            clearError(nameInput);
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim()) {
            showError(emailInput, 'This field is required');
            isValid = false;
        } else if (!emailRegex.test(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email');
             isValid = false;
        } else {
            clearError(emailInput);
        }

        if (!phoneInput.value.trim()) {
            showError(phoneInput, 'This field is required');
            isValid = false;
        } else {
            clearError(phoneInput);
        }
        
        return isValid;
    };

    const showError = (input, message) => {
        const formGroup = input.parentElement;
        formGroup.querySelector('label').classList.add('error');
        const errorMsg = formGroup.querySelector('.error-message');
        errorMsg.textContent = message;
        input.classList.add('error');
    };

    const clearError = (input) => {
        const formGroup = input.parentElement;
        formGroup.querySelector('label').classList.remove('error');
        input.classList.remove('error');
    };

    const validateStep2 = () => {
        if (!selectedPlan) {
            alert('Please select a plan.');
            return false;
        }
        return true;
    };

    const updateSummary = () => {
        const planName = selectedPlan;
        const planPrice = planPrices[planName][billingCycle];
        const cycleAbbr = billingCycle === 'monthly' ? 'mo' : 'yr';
        
        document.getElementById('summary-plan').innerHTML = `
            <div>
                <h3>${planName} (${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)})</h3>
                <a href="#" id="change-plan-link">Change</a>
            </div>
            <p>$${planPrice}/${cycleAbbr}</p>
        `;

        const summaryAddons = document.getElementById('summary-addons');
        summaryAddons.innerHTML = '';
        let total = planPrice;
        
        addons.forEach(addonName => {
            const addonPrice = addonPrices[addonName][billingCycle];
            total += addonPrice;
            summaryAddons.innerHTML += `
                <div class="summary-addon-item">
                    <p>${addonName}</p>
                    <span>+$${addonPrice}/${cycleAbbr}</span>
                </div>
            `;
        });
        
        document.getElementById('summary-billing-cycle').textContent = billingCycle === 'monthly' ? 'month' : 'year';
        document.getElementById('summary-total-price').textContent = `$${total}/${cycleAbbr}`;
        
        document.getElementById('change-plan-link').addEventListener('click', (e) => {
            e.preventDefault();
            currentStep = 2;
            updateStepVisibility();
        });
    };
    
    // Event Listeners
    nextBtn.addEventListener('click', () => {
        let isValid = false;
        if (currentStep === 1) isValid = validateStep1();
        if (currentStep === 2) isValid = validateStep2();
        if (currentStep === 3) isValid = true;
        
        if (isValid) {
            currentStep++;
            if(currentStep === 4) updateSummary();
            updateStepVisibility();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStepVisibility();
        }
    });
    
    confirmBtn.addEventListener('click', () => {
        currentStep++;
        updateStepVisibility();
    });

    // Step 2: Plan Selection Logic
    document.querySelectorAll('.plan-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedPlan = card.dataset.plan;
        });
    });

    const billingToggle = document.getElementById('billingToggle');
    billingToggle.addEventListener('change', () => {
        billingCycle = billingToggle.checked ? 'yearly' : 'monthly';
        document.querySelector('.monthly').classList.toggle('active', !billingToggle.checked);
        document.querySelector('.yearly').classList.toggle('active', billingToggle.checked);
        
        // Update prices display
        document.querySelectorAll('.yearly-promo').forEach(promo => {
            promo.style.display = billingToggle.checked ? 'block' : 'none';
        });

        document.querySelectorAll('.plan-card').forEach(card => {
            const plan = card.dataset.plan;
            const price = planPrices[plan][billingCycle];
            const cycle = billingCycle === 'monthly' ? 'mo' : 'yr';
            card.querySelector('.plan-price').textContent = `$${price}/${cycle}`;
        });
        
        document.querySelectorAll('.addon-card').forEach(card => {
            const addon = card.dataset.addon;
            const price = addonPrices[addon][billingCycle];
            const cycle = billingCycle === 'monthly' ? 'mo' : 'yr';
            card.querySelector('.addon-price').textContent = `+$${price}/${cycle}`;
        });
    });

    // Step 3: Add-on Selection Logic
    document.querySelectorAll('.addon-card').forEach(card => {
        card.addEventListener('click', () => {
            const checkbox = card.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            card.classList.toggle('selected', checkbox.checked);
            
            const addonName = card.dataset.addon;
            if (checkbox.checked) {
                if (!addons.includes(addonName)) addons.push(addonName);
            } else {
                addons = addons.filter(item => item !== addonName);
            }
        });
    });

    // Initialize first step
    updateStepVisibility();
});
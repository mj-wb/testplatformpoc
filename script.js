document.addEventListener('DOMContentLoaded', function() {
    // Form toggle functionality
    const shopperToggle = document.getElementById('shopper-toggle');
    const retailerToggle = document.getElementById('retailer-toggle');
    const shopperForm = document.getElementById('shopper-form');
    const retailerForm = document.getElementById('retailer-form');
    
    shopperToggle.addEventListener('click', function() {
        shopperToggle.classList.add('active');
        retailerToggle.classList.remove('active');
        shopperForm.classList.add('active');
        retailerForm.classList.remove('active');
        document.getElementById('scanner-section').classList.remove('active');
        document.getElementById('qr-code-section').style.display = 'none';
    });
    
    retailerToggle.addEventListener('click', function() {
        retailerToggle.classList.add('active');
        shopperToggle.classList.remove('active');
        retailerForm.classList.add('active');
        shopperForm.classList.remove('active');
        document.getElementById('scanner-section').classList.remove('active');
        document.getElementById('qr-code-section').style.display = 'none';
    });
    
    // Set up Size Guide modal
    const sizeGuideModal = document.createElement('div');
    sizeGuideModal.id = 'size-guide-modal';
    sizeGuideModal.className = 'modal';
    sizeGuideModal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Size Guide</h2>
            <div class="size-guide-tabs">
                <button class="tab-button active" data-tab="womens">Women's</button>
                <button class="tab-button" data-tab="mens">Men's</button>
                <button class="tab-button" data-tab="footwear">Footwear</button>
            </div>
            <div class="tab-content active" id="womens-content">
                <img src="images/womens-size-guide.jpg" alt="Women's Size Guide">
                <p>Note: This is a placeholder image. Actual size guide should be provided by the client.</p>
            </div>
            <div class="tab-content" id="mens-content">
                <img src="images/mens-size-guide.jpg" alt="Men's Size Guide">
                <p>Note: This is a placeholder image. Actual size guide should be provided by the client.</p>
            </div>
            <div class="tab-content" id="footwear-content">
                <img src="images/footwear-size-guide.jpg" alt="Footwear Size Guide">
                <p>Note: This is a placeholder image. Actual size guide should be provided by the client.</p>
            </div>
        </div>
    `;
    document.body.appendChild(sizeGuideModal);
    
    // Size Guide functionality
    document.getElementById('open-size-guide')?.addEventListener('click', function(e) {
        e.preventDefault();
        sizeGuideModal.style.display = 'block';
    });
    
    // Close modal button
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Size guide tab functionality
    const tabButtons = document.querySelectorAll('.size-guide-tabs .tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            const tabName = this.getAttribute('data-tab');
            document.getElementById(`${tabName}-content`).classList.add('active');
        });
    });
    
    // Department change handler - show/hide dresses field
    document.getElementById('shopping-department')?.addEventListener('change', function() {
        const dressesGroup = document.getElementById('dresses-group');
        if (dressesGroup) {
            if (this.value === 'Womenswear' || this.value === 'All') {
                dressesGroup.style.display = 'block';
                document.getElementById('dresses-size').required = true;
            } else {
                dressesGroup.style.display = 'none';
                document.getElementById('dresses-size').required = false;
            }
        }
    });
    
    // Color picker functionality
    const colorOptions = document.querySelectorAll('.color-option');
    const selectedColors = new Set();
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            const colorValue = this.getAttribute('data-color');
            
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                selectedColors.delete(colorValue);
            } else {
                this.classList.add('selected');
                selectedColors.add(colorValue);
            }
        });
    });
    
    // Shopper form submission
    const shopperFormEl = document.getElementById('shopper-form');
    const shopperConfirmation = document.getElementById('shopper-confirmation');
    
    shopperFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!userProfile) {
            alert('Please log in to submit your profile.');
            return;
        }
        
        // Collect form data
        const shopperData = {
            type: 'shopper',
            name: document.getElementById('shopper-name').value,
            email: document.getElementById('shopper-email').value,
            department: document.getElementById('shopping-department').value,
            styleWords: document.getElementById('style-words').value,
            fitPreference: document.getElementById('fit-preference').value,
            topsSize: document.getElementById('tops-size').value,
            bottomsSize: document.getElementById('bottoms-size').value,
            outerwearSize: document.getElementById('outerwear-size').value,
            dressesSize: document.getElementById('dresses-size').value,
            footwearSize: document.getElementById('footwear-size').value,
            budgetRange: document.getElementById('budget-range').value,
            colorPreferences: Array.from(selectedColors),
            proportionalPrefs: Array.from(
                document.querySelectorAll('input[name="proportional-prefs"]:checked')
            ).map(checkbox => checkbox.value),
            shoppingValues: Array.from(
                document.querySelectorAll('input[name="shopping-values"]:checked')
            ).map(checkbox => checkbox.value),
            feedback: document.getElementById('shopper-feedback').value
        };
        
        // Save to localStorage (in a real app, this would go to a database)
        localStorage.setItem(`onestop_profile_${userProfile.id}`, JSON.stringify(shopperData));
        
        // Send form data to Make.com webhook for Google Sheets storage
        fetch('YOUR_SHOPPER_WEBHOOK_URL', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(shopperData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => console.log('Success:', data))
        .catch(error => console.error('Error sending data to webhook:', error));
        
        // Show confirmation message
        shopperConfirmation.style.display = 'block';
        
        // Generate QR code after short delay
        setTimeout(() => {
            shopperFormEl.reset();
            shopperConfirmation.style.display = 'none';
            
            // Call QR code generation - this function is defined in qrcode.js
            if (typeof generateShopperQR === 'function') {
                generateShopperQR();
            }
        }, 2000);
    });
    
    // Retailer form submission
    const retailerFormEl = document.getElementById('retailer-form');
    const retailerConfirmation = document.getElementById('retailer-confirmation');
    
    retailerFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!userProfile) {
            alert('Please log in to submit your profile.');
            return;
        }
        
        // Collect form data
        const retailerData = {
            type: 'retailer',
            storeName: document.getElementById('store-name').value,
            contactPerson: document.getElementById('contact-person').value,
            contactEmail: document.getElementById('contact-email').value,
            location: document.getElementById('store-location').value,
            storeType: document.getElementById('store-type').value,
            storeSize: document.getElementById('store-size').value,
            feedback: document.getElementById('retailer-feedback').value
        };
        
        // Save to localStorage (in a real app, this would go to a database)
        localStorage.setItem(`onestop_profile_${userProfile.id}`, JSON.stringify(retailerData));
        
        // Send form data to Make.com webhook for Google Sheets storage
        fetch('YOUR_RETAILER_WEBHOOK_URL', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(retailerData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => console.log('Success:', data))
        .catch(error => console.error('Error sending data to webhook:', error));
        
        // Show confirmation message
        retailerConfirmation.style.display = 'block';
        
        // Generate QR code after short delay
        setTimeout(() => {
            retailerFormEl.reset();
            retailerConfirmation.style.display = 'none';
            
            // Call QR code generation - this function is defined in qrcode.js
            if (typeof generateRetailerQR === 'function') {
                generateRetailerQR();
            }
        }, 2000);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});

// Function to prefill shopper form - called from auth.js
function prefillShopperForm(profileData) {
    if (!profileData) return;
    
    // Set form values
    document.getElementById('shopper-name').value = profileData.name || '';
    document.getElementById('shopper-email').value = profileData.email || '';
    
    const departmentSelect = document.getElementById('shopping-department');
    if (departmentSelect && profileData.department) {
        departmentSelect.value = profileData.department;
        
        // Trigger change event for conditional fields
        const event = new Event('change');
        departmentSelect.dispatchEvent(event);
    }
    
    document.getElementById('style-words').value = profileData.styleWords || '';
    
    const fitSelect = document.getElementById('fit-preference');
    if (fitSelect && profileData.fitPreference) {
        fitSelect.value = profileData.fitPreference;
    }
    
    document.getElementById('tops-size').value = profileData.topsSize || '';
    document.getElementById('bottoms-size').value = profileData.bottomsSize || '';
    document.getElementById('outerwear-size').value = profileData.outerwearSize || '';
    document.getElementById('dresses-size').value = profileData.dressesSize || '';
    document.getElementById('footwear-size').value = profileData.footwearSize || '';
    
    document.getElementById('budget-range').value = profileData.budgetRange || '';
    document.getElementById('shopper-feedback').value = profileData.feedback || '';
    
    // Set checkboxes for shopping values
    if (Array.isArray(profileData.shoppingValues)) {
        profileData.shoppingValues.forEach(value => {
            const checkbox = document.querySelector(`input[name="shopping-values"][value="${value}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Set checkboxes for proportional preferences
    if (Array.isArray(profileData.proportionalPrefs)) {
        profileData.proportionalPrefs.forEach(value => {
            const checkbox = document.querySelector(`input[name="proportional-prefs"][value="${value}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Set color preferences
    if (Array.isArray(profileData.colorPreferences)) {
        profileData.colorPreferences.forEach(color => {
            const colorOption = document.querySelector(`.color-option[data-color="${color}"]`);
            if (colorOption) colorOption.classList.add('selected');
        });
    }
}

// Function to prefill retailer form - called from auth.js
function prefillRetailerForm(profileData) {
    if (!profileData) return;
    
    document.getElementById('store-name').value = profileData.storeName || '';
    document.getElementById('contact-person').value = profileData.contactPerson || '';
    document.getElementById('contact-email').value = profileData.contactEmail || '';
    document.getElementById('store-location').value = profileData.location || '';
    
    const storeTypeSelect = document.getElementById('store-type');
    if (storeTypeSelect && profileData.storeType) {
        storeTypeSelect.value = profileData.storeType;
    }
    
    document.getElementById('store-size').value = profileData.storeSize || '';
    document.getElementById('retailer-feedback').value = profileData.feedback || '';
} 
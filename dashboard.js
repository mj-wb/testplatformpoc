document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard functionality after auth is initialized
    const authCheckInterval = setInterval(() => {
        if (window.userProfile) {
            clearInterval(authCheckInterval);
            initDashboard();
        }
    }, 1000);

    // Handle tab switching
    const tabButtons = document.querySelectorAll('.dashboard-tabs .tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and its corresponding content
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Initialize store QR code and scanner
    document.getElementById('start-retailer-scanner')?.addEventListener('click', startRetailerScanner);
    document.getElementById('stop-retailer-scanner')?.addEventListener('click', stopRetailerScanner);
    document.getElementById('download-store-qr')?.addEventListener('click', downloadStoreQR);
    
    // Close modal
    document.querySelector('.close-modal')?.addEventListener('click', function() {
        document.getElementById('shopper-profile-modal').style.display = 'none';
    });
});

// Initialize dashboard after login
function initDashboard() {
    // Set store name in header
    const storeProfile = getStoreProfile();
    if (storeProfile) {
        document.getElementById('store-name-header').textContent = storeProfile.storeName;
    }
    
    // Generate store QR code
    generateRetailerDashboardQR();
    
    // Load current check-ins
    loadCurrentCheckIns();
    
    // Update dashboard visibility
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Set up refresh interval for check-ins (every 60 seconds)
    setInterval(loadCurrentCheckIns, 60000);
}

// Get store profile from localStorage
function getStoreProfile() {
    if (!userProfile) return null;
    
    const profileData = localStorage.getItem(`onestop_profile_${userProfile.id}`);
    if (!profileData) return null;
    
    try {
        return JSON.parse(profileData);
    } catch (e) {
        console.error('Error parsing profile data:', e);
        return null;
    }
}

// Generate store QR code for dashboard
function generateRetailerDashboardQR() {
    const storeProfile = getStoreProfile();
    if (!storeProfile || !window.QRCode) return;
    
    const qrContainer = document.getElementById('store-qr-container');
    if (!qrContainer) return;
    
    // Clear previous QR code
    qrContainer.innerHTML = '';
    
    // Create store data for QR
    const storeData = {
        type: 'store',
        id: userProfile.id,
        name: storeProfile.storeName,
        timestamp: new Date().toISOString()
    };
    
    // Generate QR code
    QRCode.toCanvas(
        qrContainer.appendChild(document.createElement('canvas')),
        JSON.stringify(storeData),
        {
            width: 300,
            color: {
                dark: '#333333',
                light: '#ffffff'
            }
        },
        function(error) {
            if (error) console.error(error);
        }
    );
}

// Load current check-ins from localStorage (in a real app, this would be from a database)
function loadCurrentCheckIns() {
    if (!userProfile) return;
    
    const checkInsRaw = localStorage.getItem('onestop_checkins') || '[]';
    let checkIns = [];
    
    try {
        checkIns = JSON.parse(checkInsRaw);
    } catch (e) {
        console.error('Error parsing check-ins:', e);
        return;
    }
    
    // Filter check-ins for this store and within the last 24 hours
    const storeCheckIns = checkIns.filter(checkIn => {
        const checkInTime = new Date(checkIn.timestamp);
        const timeElapsed = Date.now() - checkInTime.getTime();
        const isRecent = timeElapsed < 24 * 60 * 60 * 1000; // 24 hours
        
        return checkIn.storeId === userProfile.id && isRecent;
    });
    
    // Update the shoppers list
    const shoppersListEl = document.getElementById('shoppers-list');
    
    if (storeCheckIns.length === 0) {
        shoppersListEl.innerHTML = `
            <div class="empty-state">
                <p>No shoppers currently checked in.</p>
                <p>You can scan a shopper's QR code or they can scan your store's QR code to check in.</p>
            </div>
        `;
        return;
    }
    
    // Clear the list and add each shopper
    shoppersListEl.innerHTML = '';
    
    storeCheckIns.forEach(checkIn => {
        // In a real app, you would fetch the shopper profile
        // For demo, we'll use mock data or check localStorage
        const shopperProfile = getShopperProfile(checkIn.userId) || {
            name: 'Anonymous Shopper',
            department: 'Unknown',
            fitPreference: 'Various',
            styleWords: 'No style info'
        };
        
        const checkInTime = new Date(checkIn.timestamp);
        const timeStr = checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const shopperCard = document.createElement('div');
        shopperCard.className = 'shopper-card';
        shopperCard.setAttribute('data-user-id', checkIn.userId);
        
        shopperCard.innerHTML = `
            <h3>${shopperProfile.name || 'Shopper'}</h3>
            <div class="shopper-time">Checked in at ${timeStr}</div>
            <div class="shopper-details">
                <span class="detail-tag">${shopperProfile.department || 'Unknown'}</span>
                <span class="detail-tag">${shopperProfile.fitPreference || 'Various'}</span>
            </div>
        `;
        
        // Add click handler to show profile modal
        shopperCard.addEventListener('click', function() {
            showShopperProfile(checkIn.userId);
        });
        
        shoppersListEl.appendChild(shopperCard);
    });
}

// Get shopper profile from localStorage
function getShopperProfile(userId) {
    if (!userId) return null;
    
    const profileData = localStorage.getItem(`onestop_profile_${userId}`);
    if (!profileData) return null;
    
    try {
        return JSON.parse(profileData);
    } catch (e) {
        console.error('Error parsing profile data:', e);
        return null;
    }
}

// Show shopper profile modal
function showShopperProfile(userId) {
    const shopperProfile = getShopperProfile(userId);
    if (!shopperProfile) {
        alert('Shopper profile not found.');
        return;
    }
    
    const profileContentEl = document.getElementById('profile-content');
    
    // Create formatted profile display
    profileContentEl.innerHTML = `
        <div class="profile-section">
            <h3>Personal Info</h3>
            <div class="profile-row">
                <div class="profile-label">Name</div>
                <div class="profile-value">${shopperProfile.name || 'N/A'}</div>
            </div>
            <div class="profile-row">
                <div class="profile-label">Email</div>
                <div class="profile-value">${shopperProfile.email || 'N/A'}</div>
            </div>
            <div class="profile-row">
                <div class="profile-label">Department</div>
                <div class="profile-value">${shopperProfile.department || 'N/A'}</div>
            </div>
            <div class="profile-row">
                <div class="profile-label">Style</div>
                <div class="profile-value">${shopperProfile.styleWords || 'N/A'}</div>
            </div>
        </div>
        
        <div class="profile-section">
            <h3>Sizing Information</h3>
            <div class="profile-row">
                <div class="profile-label">Tops</div>
                <div class="profile-value">${shopperProfile.topsSize || 'N/A'}</div>
            </div>
            <div class="profile-row">
                <div class="profile-label">Bottoms</div>
                <div class="profile-value">${shopperProfile.bottomsSize || 'N/A'}</div>
            </div>
            <div class="profile-row">
                <div class="profile-label">Outerwear</div>
                <div class="profile-value">${shopperProfile.outerwearSize || 'N/A'}</div>
            </div>
            <div class="profile-row">
                <div class="profile-label">Footwear</div>
                <div class="profile-value">${shopperProfile.footwearSize || 'N/A'}</div>
            </div>
            <div class="profile-row">
                <div class="profile-label">Fit Preference</div>
                <div class="profile-value">${shopperProfile.fitPreference || 'N/A'}</div>
            </div>
        </div>
        
        <div class="profile-section">
            <h3>Shopping Preferences</h3>
            <div class="profile-row">
                <div class="profile-label">Budget Range</div>
                <div class="profile-value">${shopperProfile.budgetRange || 'N/A'}</div>
            </div>
            <div class="profile-row">
                <div class="profile-label">Values</div>
                <div class="profile-value">${Array.isArray(shopperProfile.shoppingValues) ? shopperProfile.shoppingValues.join(', ') : 'None specified'}</div>
            </div>
            <div class="profile-row">
                <div class="profile-label">Feedback</div>
                <div class="profile-value">${shopperProfile.feedback || 'No feedback provided'}</div>
            </div>
        </div>
    `;
    
    // Show the modal
    document.getElementById('shopper-profile-modal').style.display = 'block';
}

// Retailer scanner functionality
let retailerScanner;

function startRetailerScanner() {
    const scannerFrame = document.getElementById('retailer-scanner-frame');
    if (!scannerFrame || !window.Html5Qrcode) return;
    
    document.getElementById('start-retailer-scanner').style.display = 'none';
    document.getElementById('stop-retailer-scanner').style.display = 'block';
    
    retailerScanner = new Html5Qrcode('retailer-scanner-frame');
    retailerScanner.start(
        { facingMode: 'environment' },
        {
            fps: 10,
            qrbox: 250
        },
        onRetailerScanSuccess,
        onRetailerScanFailure
    );
}

function onRetailerScanSuccess(decodedText) {
    // Stop the scanner
    stopRetailerScanner();
    
    try {
        // Parse the QR code data
        const scanData = JSON.parse(decodedText);
        
        if (scanData.type === 'shopper') {
            // Process shopper check-in
            processShopperCheckIn(scanData);
        } else {
            alert('Invalid QR code. Please scan a shopper QR code.');
        }
    } catch (e) {
        console.error('Error parsing QR data:', e);
        alert('Invalid QR code format.');
    }
}

function onRetailerScanFailure(error) {
    // Usually just log errors
    console.log('QR scan error:', error);
}

function stopRetailerScanner() {
    if (retailerScanner) {
        retailerScanner.stop().catch(err => console.error('Scanner stop error:', err));
        retailerScanner = null;
    }
    
    document.getElementById('start-retailer-scanner').style.display = 'block';
    document.getElementById('stop-retailer-scanner').style.display = 'none';
}

function processShopperCheckIn(shopperData) {
    if (!userProfile) return;
    
    const storeProfile = getStoreProfile();
    if (!storeProfile) return;
    
    // Store check-in in localStorage
    const checkIns = JSON.parse(localStorage.getItem('onestop_checkins') || '[]');
    checkIns.push({
        storeId: userProfile.id,
        storeName: storeProfile.storeName,
        timestamp: new Date().toISOString(),
        userId: shopperData.id
    });
    localStorage.setItem('onestop_checkins', JSON.stringify(checkIns));
    
    // Show confirmation
    document.getElementById('scan-result').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('scan-result').classList.add('hidden');
        
        // Refresh check-ins list
        loadCurrentCheckIns();
        
        // Switch to check-ins tab
        document.querySelector('.tab-button[data-tab="checkins"]').click();
    }, 2000);
}

function downloadStoreQR() {
    const canvas = document.querySelector('#store-qr-container canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'onestop-store-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
} 
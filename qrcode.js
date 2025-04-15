// QR Code Generation and Scanning
document.addEventListener('DOMContentLoaded', function() {
    // Add QR code library
    const qrScript = document.createElement('script');
    qrScript.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.min.js';
    document.head.appendChild(qrScript);
    
    // Add QR scanner library
    const qrScannerScript = document.createElement('script');
    qrScannerScript.src = 'https://cdn.jsdelivr.net/npm/html5-qrcode@2.2.0/dist/html5-qrcode.min.js';
    document.head.appendChild(qrScannerScript);
    
    qrScript.onload = function() {
        // Set up QR code generation when profile is submitted
        const shopperFormEl = document.getElementById('shopper-form');
        const retailerFormEl = document.getElementById('retailer-form');
        
        if (shopperFormEl) {
            const originalSubmitHandler = shopperFormEl.onsubmit;
            shopperFormEl.onsubmit = function(e) {
                if (originalSubmitHandler) {
                    originalSubmitHandler(e);
                }
                
                // After successful submission, generate QR code
                setTimeout(() => {
                    generateShopperQR();
                }, 1000);
            };
        }
        
        if (retailerFormEl) {
            const originalRetailerSubmitHandler = retailerFormEl.onsubmit;
            retailerFormEl.onsubmit = function(e) {
                if (originalRetailerSubmitHandler) {
                    originalRetailerSubmitHandler(e);
                }
                
                // After successful submission, generate store QR code
                setTimeout(() => {
                    generateRetailerQR();
                }, 1000);
            };
        }
        
        // QR download button
        document.getElementById('download-qr')?.addEventListener('click', downloadQR);
        
        // View check-in button
        document.getElementById('view-check-in')?.addEventListener('click', showScannerSection);
    };
    
    qrScannerScript.onload = function() {
        // Set up QR scanner functionality
        const startScannerBtn = document.getElementById('start-scanner');
        const stopScannerBtn = document.getElementById('stop-scanner');
        
        if (startScannerBtn) {
            startScannerBtn.addEventListener('click', startScanner);
        }
        
        if (stopScannerBtn) {
            stopScannerBtn.addEventListener('click', stopScanner);
        }
    };
});

// Generate unique shopper QR code
function generateShopperQR() {
    if (!window.QRCode || !userProfile) return;
    
    const qrContainer = document.getElementById('qr-code-container');
    if (!qrContainer) return;
    
    // Clear previous QR code
    qrContainer.innerHTML = '';
    
    // Create shopper data for QR
    const shopperData = {
        type: 'shopper',
        id: userProfile.id,
        timestamp: new Date().toISOString()
    };
    
    // Generate QR code
    QRCode.toCanvas(
        qrContainer.appendChild(document.createElement('canvas')),
        JSON.stringify(shopperData),
        {
            width: 200,
            color: {
                dark: '#333333',
                light: '#ffffff'
            }
        },
        function(error) {
            if (error) console.error(error);
            document.getElementById('qr-code-section').style.display = 'block';
        }
    );
}

// Generate unique retailer store QR code
function generateRetailerQR() {
    if (!window.QRCode || !userProfile) return;
    
    const qrContainer = document.getElementById('qr-code-container');
    if (!qrContainer) return;
    
    // Clear previous QR code
    qrContainer.innerHTML = '';
    
    // Get store name
    const storeName = document.getElementById('store-name').value;
    
    // Create store data for QR
    const storeData = {
        type: 'store',
        id: userProfile.id,
        name: storeName,
        timestamp: new Date().toISOString()
    };
    
    // Generate QR code
    QRCode.toCanvas(
        qrContainer.appendChild(document.createElement('canvas')),
        JSON.stringify(storeData),
        {
            width: 200,
            color: {
                dark: '#333333',
                light: '#ffffff'
            }
        },
        function(error) {
            if (error) console.error(error);
            document.getElementById('qr-code-section').style.display = 'block';
        }
    );
}

// Download QR code as image
function downloadQR() {
    const canvas = document.querySelector('#qr-code-container canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'onestop-qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Show scanner section
function showScannerSection() {
    document.getElementById('shopper-form').classList.remove('active');
    document.getElementById('retailer-form').classList.remove('active');
    document.getElementById('scanner-section').classList.add('active');
    
    // Update toggle buttons
    document.getElementById('shopper-toggle').classList.remove('active');
    document.getElementById('retailer-toggle').classList.remove('active');
}

// Start QR scanner
let html5QrScanner;

function startScanner() {
    const scannerFrame = document.getElementById('scanner-frame');
    if (!scannerFrame || !window.Html5Qrcode) return;
    
    document.getElementById('start-scanner').style.display = 'none';
    document.getElementById('stop-scanner').style.display = 'block';
    
    html5QrScanner = new Html5Qrcode('scanner-frame');
    html5QrScanner.start(
        { facingMode: 'environment' },
        {
            fps: 10,
            qrbox: 250
        },
        onScanSuccess,
        onScanFailure
    );
}

// Handle successful scan
function onScanSuccess(decodedText) {
    // Stop the scanner
    stopScanner();
    
    try {
        // Parse the QR code data
        const scanData = JSON.parse(decodedText);
        
        if (scanData.type === 'store') {
            // Process store check-in
            processCheckIn(scanData);
        } else {
            alert('Invalid QR code. Please scan a store QR code.');
        }
    } catch (e) {
        console.error('Error parsing QR data:', e);
        alert('Invalid QR code format.');
    }
}

// Handle scan failure
function onScanFailure(error) {
    // Handle scan failures - usually just ignore unless persistent
    console.log('QR scan error:', error);
}

// Stop QR scanner
function stopScanner() {
    if (html5QrScanner) {
        html5QrScanner.stop().catch(err => console.error('Scanner stop error:', err));
        html5QrScanner = null;
    }
    
    document.getElementById('start-scanner').style.display = 'block';
    document.getElementById('stop-scanner').style.display = 'none';
}

// Process store check-in
function processCheckIn(storeData) {
    // In a real app, you would send this to your backend
    console.log('Checking in to store:', storeData);
    
    // Update the UI to show check-in confirmation
    document.getElementById('store-name-display').textContent = storeData.name;
    document.getElementById('check-in-result').style.display = 'block';
    
    // Store check-in in local storage for demo
    const checkIns = JSON.parse(localStorage.getItem('onestop_checkins') || '[]');
    checkIns.push({
        storeId: storeData.id,
        storeName: storeData.name,
        timestamp: new Date().toISOString(),
        userId: userProfile?.id
    });
    localStorage.setItem('onestop_checkins', JSON.stringify(checkIns));
} 
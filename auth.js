// Initialize Clerk with your publishable key
const clerkPublishableKey = 'pk_test_Y2F1c2FsLW1hc3RpZmYtOTguY2xlcmsuYWNjb3VudHMuZGV2JA';
let userProfile = null;

// Simplified Clerk initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log("Document ready, checking for Clerk...");
    
    // Wait longer for Clerk to initialize
    const waitForClerk = () => {
        return new Promise((resolve, reject) => {
            if (window.Clerk) {
                resolve(window.Clerk);
                return;
            }
            
            // Wait for Clerk to load
            let attempts = 0;
            const check = setInterval(() => {
                attempts++;
                console.log(`Waiting for Clerk... Attempt ${attempts}`);
                
                if (window.Clerk) {
                    clearInterval(check);
                    console.log("Clerk found!");
                    resolve(window.Clerk);
                } else if (attempts > 50) { // Try for 25 seconds
                    clearInterval(check);
                    reject(new Error("Clerk failed to load after 25 seconds"));
                }
            }, 500);
        });
    };
    
    // Try to initialize
    waitForClerk()
        .then(clerk => {
            // Only try to mount components when we're sure Clerk is fully loaded
            setTimeout(() => {
                try {
                    console.log("Mounting sign-in component...");
                    const signInDiv = document.getElementById('clerk-sign-in');
                    if (signInDiv) {
                        clerk.mountSignIn(signInDiv);
                    }
                    
                    // Set up listener after mounting
                    clerk.addListener(({ user }) => {
                        console.log("Auth state changed:", user ? "signed in" : "signed out");
                        if (user) {
                            handleSignedIn(user);
                        } else {
                            handleSignedOut();
                        }
                    });
                    
                    // Handle sign out
                    document.getElementById('sign-out-btn')?.addEventListener('click', () => {
                        clerk.signOut();
                    });
                } catch (e) {
                    console.error("Error mounting Clerk components:", e);
                }
            }, 1000); // Give a little extra time after Clerk is found
        })
        .catch(error => {
            console.error(error);
        });
});

// Handle signed in state
function handleSignedIn(user) {
    userProfile = user;
    
    // Update UI
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    // Update user name in header
    const userName = document.getElementById('user-name');
    if (userName) {
        userName.textContent = `Welcome, ${user.firstName || 'there'}!`;
    }
    
    // Check if user has completed profile
    checkProfileStatus(user.id);
}

// Handle signed out state
function handleSignedOut() {
    userProfile = null;
    
    // Update UI
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

// Check if user has completed profile, redirect if needed
async function checkProfileStatus(userId) {
    // This would typically check your database
    // For demo, we'll just check localStorage
    const profileData = localStorage.getItem(`onestop_profile_${userId}`);
    
    if (!profileData) {
        // Show the profile form (already visible)
    } else {
        // Could redirect to dashboard if profile exists
        const profileJson = JSON.parse(profileData);
        
        // Pre-fill the form with existing data
        if (profileJson.type === 'shopper') {
            prefillShopperForm(profileJson);
        } else if (profileJson.type === 'retailer') {
            prefillRetailerForm(profileJson);
        }
    }
}

// Initialize Clerk when DOM is ready 
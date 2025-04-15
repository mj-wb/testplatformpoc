// Initialize Clerk with your publishable key
const clerkPublishableKey = 'pk_test_Y2F1c2FsLW1hc3RpZmYtOTguY2xlcmsuYWNjb3VudHMuZGV2JA';
let userProfile = null;

// Simplified Clerk initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log("Document ready, checking for Clerk...");
    
    // Create an interval to check for Clerk until it's available
    const clerkCheck = setInterval(function() {
        console.log("Checking for Clerk...");
        if (window.Clerk) {
            console.log("Clerk found!");
            clearInterval(clerkCheck);
            
            // Once Clerk is available
            const signInDiv = document.getElementById('clerk-sign-in');
            if (signInDiv) {
                console.log("Mounting sign-in component...");
                window.Clerk.mountSignIn(signInDiv);
            }
            
            // Set up user state change listener
            window.Clerk.addListener(({ user }) => {
                console.log("Auth state changed:", user ? "signed in" : "signed out");
                if (user) {
                    // User is signed in
                    handleSignedIn(user);
                } else {
                    // User is signed out
                    handleSignedOut();
                }
            });
            
            // Handle sign out
            document.getElementById('sign-out-btn')?.addEventListener('click', () => {
                window.Clerk.signOut();
            });
        }
    }, 500); // Check every 500ms
    
    // Safety timeout after 10 seconds
    setTimeout(() => {
        clearInterval(clerkCheck);
        console.error("Clerk failed to load after 10 seconds");
    }, 10000);
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
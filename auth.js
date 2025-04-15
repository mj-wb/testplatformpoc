// Initialize Clerk with your publishable key
const clerkPublishableKey = 'pk_test_REPLACE_WITH_ACTUAL_KEY';
let userProfile = null;

// Initialize Clerk
async function initializeClerk() {
    const Clerk = window.Clerk;
    
    try {
        await Clerk.load({
            publishableKey: clerkPublishableKey
        });

        // Mount sign-in component
        const signInDiv = document.getElementById('clerk-sign-in');
        if (signInDiv) {
            Clerk.mountSignIn(signInDiv);
        }

        // Add auth state change listener
        Clerk.addListener(({ user }) => {
            if (user) {
                // User is signed in
                handleSignedIn(user);
            } else {
                // User is signed out
                handleSignedOut();
            }
        });

        // Handle sign out button
        document.getElementById('sign-out-btn')?.addEventListener('click', () => {
            Clerk.signOut();
        });

    } catch (error) {
        console.error('Error initializing Clerk:', error);
    }
}

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
document.addEventListener('DOMContentLoaded', initializeClerk); 
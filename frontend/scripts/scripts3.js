// ============================
// Load user from localStorage instantly
// ============================
function getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function showUser(user) {
    if (document.getElementById('userName')) {
        document.getElementById('userName').textContent = user.name || user.username || 'Unknown';
    }
    if (document.getElementById('userEmail')) {
        document.getElementById('userEmail').textContent = user.email || 'No email available';
    }
}

function showGuest() {
    if (document.getElementById('userName')) {
        document.getElementById('userName').textContent = 'Guest';
    }
    if (document.getElementById('userEmail')) {
        document.getElementById('userEmail').textContent = 'Not logged in';
    }
}

// ============================
// Redirect guest users from protected pages
// ============================
function redirectIfGuest() {
    if (window.location.pathname.includes("account.html")) {
        // User not logged in → redirect to signup/login page
        window.location.href = "signup10.html";
    } else {
        showGuest();
    }
}

// ============================
// Fetch user from backend (cookie-based)
// ============================
async function fetchUserData() {
    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include', // ✅ include session cookie
            headers: { 'Content-Type': 'application/json' }
        });

        // Ensure JSON parsing
        const data = await response.json();

        if (response.ok && data.user) {
            // ✅ Save to localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            // ✅ Update DOM
            showUser(data.user);
        } else {
            console.warn('User not authenticated.');
            localStorage.removeItem('user');
            redirectIfGuest();
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('user');
        redirectIfGuest();
    }
}

// ============================
// Logout
// ============================
async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        localStorage.removeItem('user');
        showGuest();
        window.location.href = '/'; // redirect to home after logout
    } catch (err) {
        console.error("Error logging out:", err);
    }
}

// ============================
// On page load
// ============================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Show cached user instantly
    const storedUser = getStoredUser();
    if (storedUser) {
        showUser(storedUser);
    } else {
        redirectIfGuest();
    }

    // 2. Verify with backend
    fetchUserData();
});

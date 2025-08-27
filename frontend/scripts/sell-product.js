// ===============================
// ✅ Check login via LocalStorage + API
// ===============================
async function checkLogin() {
    try {
        // 1. Quick check: localStorage
        const localUser = localStorage.getItem('user');
        if (localUser) {
            console.log("User found in localStorage:", JSON.parse(localUser));
        }

        // 2. Server validation (ensures cookie session is still valid)
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();

        if (!data.user) {
            // If API says no user, clear localStorage too
            localStorage.removeItem('user');
            alert("You must log in first.");
            window.location.href = "signup10.html";
        } else {
            // ✅ Keep localStorage in sync with backend
            localStorage.setItem('user', JSON.stringify(data.user));
            console.log("Login confirmed:", data.user);
        }
    } catch (err) {
        console.error("Login check failed:", err);
        localStorage.removeItem('user');
        window.location.href = "signup10.html";
    }
}

// Call login check on page load
checkLogin();

// ===============================
// ✅ Handle form submission
// ===============================
document.getElementById('sell-product-Form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(this);
    formData.set('sellerPhone', document.getElementById('phone').value); // Include phone number

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            body: formData,
            credentials: 'include' // ✅ include cookies for authentication
        });

        const data = await response.json();

        if (data.success) {
            alert('🎉 Product posted successfully!');
            window.location.href = '/products2.html';
        } else {
            alert('❌ Error posting product: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('⚠️ An unexpected error occurred!');
    }
});

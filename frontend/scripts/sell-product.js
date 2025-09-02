// ===============================
// ✅ Check login via LocalStorage + API
// ===============================
async function checkLogin() {
    try {
        const localUser = localStorage.getItem('user');
        if (localUser) console.log("User found in localStorage:", JSON.parse(localUser));

        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();

        if (!data.user) {
            localStorage.removeItem('user');
            alert("You must log in first.");
            window.location.href = "signup10.html";
        } else {
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
    event.preventDefault();

    const formData = new FormData();
    formData.set('name', document.getElementById('name').value);
    formData.set('description', document.getElementById('description').value);
    formData.set('category', document.getElementById('category').value);
    formData.set('price', document.getElementById('price').value);
    formData.set('sellerPhone', document.getElementById('phone').value);

    const fileInput = document.getElementById('productImage');
    if (!fileInput || fileInput.files.length === 0) {
        alert('Please select a product image.');
        return;
    }

    // ✅ Set the file correctly with key 'image' to match multer
    formData.set('image', fileInput.files[0]);

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('🎉 Product posted successfully!');
            window.location.href = '/products2.html';
        } else {
            alert('❌ Error posting product: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('⚠️ An unexpected error occurred!');
    }
});

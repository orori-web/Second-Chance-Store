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
            showToast("You must log in first.", "error");
            setTimeout(() => window.location.href = "signup10.html", 1500);
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
// ✅ Toast Notification Helper
// ===============================
function showToast(message, type = "info", persistent = false) {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.style.position = "fixed";
        container.style.top = "20px";
        container.style.right = "20px";
        container.style.zIndex = "9999";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.background =
        type === "success" ? "green" :
        type === "error" ? "red" :
        "rgba(0,0,0,0.8)";
    toast.style.color = "#fff";
    toast.style.padding = "10px 20px";
    toast.style.marginTop = "10px";
    toast.style.borderRadius = "5px";
    toast.style.fontSize = "14px";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";

    container.appendChild(toast);

    // Fade in
    requestAnimationFrame(() => { toast.style.opacity = "1"; });

    if (!persistent) {
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.addEventListener("transitionend", () => toast.remove());
        }, 3000);
    }

    return toast; // return element so we can remove manually
}

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
        showToast('Please select a product image.', 'error');
        return;
    }

    formData.set('image', fileInput.files[0]);

    // ✅ Show "Please wait..." toast while posting
    const waitToast = showToast("⏳ Please wait… Posting your product", "info", true);

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const data = await response.json();

        // Remove wait toast
        waitToast.remove();

        if (response.ok && data.success) {
            showToast('🎉 Product posted successfully!', 'success');
            setTimeout(() => window.location.href = '/index1.html', 1500);
        } else {
            showToast('❌ Error posting product: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        waitToast.remove();
        showToast('⚠️ An unexpected error occurred!', 'error');
    }
});

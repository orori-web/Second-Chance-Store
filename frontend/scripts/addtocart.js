// ============================
// Add to Cart Logic
// ============================

(function () {
    // ============================
    // Add product to cart
    // ============================
    function addProductToCart(product) {
        if (!product || !product.id) return;

        // Get current cart
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Optional: prevent duplicates by product id
        const exists = cart.some(item => item.id === product.id);
        if (exists) {
            showNotification(`${product.name} is already in your cart!`);
            return;
        }

        // Add product
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));

        // Show notification
        showNotification(`${product.name} has been added to your cart!`);
    }

    // Expose globally
    window.addToCart = addProductToCart;

    // ============================
    // Toast Notification System
    // ============================
    function showNotification(message) {
        // Check if toast container exists
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.position = 'fixed';
            container.style.top = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.background = 'rgba(0,0,0,0.8)';
        toast.style.color = '#fff';
        toast.style.padding = '10px 20px';
        toast.style.marginTop = '10px';
        toast.style.borderRadius = '5px';
        toast.style.fontSize = '14px';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';

        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }
})();

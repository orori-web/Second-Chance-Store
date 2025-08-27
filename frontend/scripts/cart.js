// frontend/cart.js

document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('cart-container');
    const cartSection = document.querySelector('.cart-section');
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    // ✅ Check if user is logged in (localStorage + backend fallback)
    async function checkLogin() {
        try {
            // 1. Check localStorage first
            const localUser = localStorage.getItem('user');
            if (localUser) {
                return JSON.parse(localUser);
            }

            // 2. Validate with backend (cookie-based session)
            const res = await fetch('/api/auth/me', { credentials: 'include' });
            if (!res.ok) return null;

            const data = await res.json();
            if (data.user) {
                // Sync into localStorage for PWA support
                localStorage.setItem('user', JSON.stringify(data.user));
                return data.user;
            }

            return null;
        } catch (err) {
            console.error("Login check failed:", err);
            return null;
        }
    }

    // ✅ Sync cart with backend if logged in
    async function syncCartWithBackend() {
        const user = await checkLogin();
        if (!user) return;

        try {
            const res = await fetch(`/api/cart/${user.id}`, {
                method: "GET",
                credentials: "include"
            });
            if (res.ok) {
                const serverCart = await res.json();
                cartItems = serverCart;
                localStorage.setItem("cart", JSON.stringify(cartItems));
                renderCart();
            }
        } catch (err) {
            console.error("Failed to sync cart:", err);
        }
    }

    function renderCart() {
        cartContainer.innerHTML = '';
        if (cartItems.length === 0) {
            cartContainer.innerHTML = '<p>Your cart is empty!</p>';
            return;
        }

        cartItems.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <div class="cart-item-container">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <p class="cart-item-name"><strong>${item.name}</strong></p>
                        <p class="cart-item-price">Price: Ksh ${item.price}</p>
                    </div>
                </div>
                <button class="remove-item" data-index="${index}">Remove</button>
            `;
            cartContainer.appendChild(cartItem);
        });

        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => removeItem(e.target.dataset.index));
        });

        renderCartTotal();
    }

    async function removeItem(index) {
        const removedItem = cartItems[index];
        cartItems.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cartItems));
        renderCart();

        // ✅ Update backend cart if logged in
        const user = await checkLogin();
        if (user) {
            try {
                await fetch(`/api/cart/${user.id}/remove`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ productId: removedItem._id || removedItem.id })
                });
            } catch (err) {
                console.error("Backend cart update failed:", err);
            }
        }
    }

    function renderCartTotal() {
        let cartTotalContainer = document.getElementById('cart-total');
        if (!cartTotalContainer) {
            cartTotalContainer = document.createElement('div');
            cartTotalContainer.id = 'cart-total';
            cartTotalContainer.classList.add('cart-total-container');
            cartTotalContainer.innerHTML = `
                <p id="total-amount">Total: Ksh 0</p>
                <button id="checkout-button" class="checkout-button">Proceed to Checkout</button>
            `;
            cartSection.appendChild(cartTotalContainer);

            document.getElementById('checkout-button').addEventListener('click', proceedToCheckout);
        }

        const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
        document.getElementById('total-amount').textContent = `Total: Ksh ${total.toFixed(2)}`;
    }

    async function proceedToCheckout() {
        if (cartItems.length === 0) {
            alert('Your cart is empty! Please add items to proceed.');
            return;
        }

        const user = await checkLogin();
        if (!user) {
            alert("You must log in to place an order.");
            window.location.href = "signup10.html";
            return;
        }

        const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

        const orderData = {
            products: cartItems.map(item => ({
                name: item.name,
                price: item.price,
                image: item.image,
                sellerId: item.sellerId,
                sellerPhone: item.sellerPhone
            })),
            totalPrice: total
        };

        const cartSnapshot = [...cartItems];

        try {
            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('Your order has been placed successfully!');
                localStorage.removeItem('cart');
                cartItems = [];

                // ✅ Clear backend cart
                await fetch(`/api/cart/${user.id}/clear`, {
                    method: "POST",
                    credentials: "include"
                });

                renderCart();

                // ✅ Build WhatsApp message
                let message = `Hello! I'd like to order the following items:\n\n`;
                cartSnapshot.forEach(item => {
                    message += `🛒 ${item.name} - Ksh ${item.price} (Seller: ${item.sellerPhone})\n`;
                });
                message += `\nTotal: Ksh ${total.toFixed(2)}`;

                const whatsappNumber = '254748232243';
                const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                window.open(whatsappURL, '_blank');

            } else {
                alert('Failed to place order: ' + (result.message || 'Please try again.'));
            }
        } catch (error) {
            console.error('Error during checkout:', error.message);
            alert('An error occurred during checkout. Please try again.');
        }
    }

    // ✅ Initial load
    renderCart();
    syncCartWithBackend();
});

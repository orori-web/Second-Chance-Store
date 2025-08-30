// ============================
// Fetch and display popular products
// ============================
async function fetchPopularProducts() {
    try {
        const response = await fetch('/api/popular-products');
        const products = await response.json();

        const productsContainer = document.querySelector('.popular-products-section .items-container');
        if (!productsContainer) return; // Exit if container is missing
        productsContainer.innerHTML = ''; // Clear previous results

        if (!products || products.length === 0) {
            productsContainer.innerHTML = '<p class="no-results">No products found.</p>';
            return;
        }

        products.forEach(product => {
            const productWrapper = document.createElement('div');
            productWrapper.classList.add('product-container');

            productWrapper.innerHTML = `
                <div class="product-image-container">
                    <img src="/uploads/${product.image}" alt="${product.name}" class="product-image">
                </div>
                <div class="product-details">
                    <p class="product-name">${product.name}</p>
                    <p class="product-price">Ksh ${product.price}</p>
                    <div class="button-group">
                    <button class="show-details" data-id="${product._id}">Details</button>
                    <button class="add-to-cart" 
                        data-id="${product._id}" 
                        data-name="${product.name}" 
                        data-price="${product.price}" 
                        data-image="/uploads/${product.image}"
                        data-seller-id="${product.sellerId}"
                        data-seller-phone="${product.sellerPhone}">
                        <i class="fas fa-shopping-cart"</i>
                        </button>
                        </div>
                </div>
            `;

            productsContainer.appendChild(productWrapper);
        });

        attachEventListeners();

    } catch (error) {
        console.error('Error fetching popular products:', error);
    }
}

// ============================
// Attach event listeners to buttons
// ============================
function attachEventListeners() {
    // Add to Cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            const product = {
                id: event.target.dataset.id,
                name: event.target.dataset.name,
                price: event.target.dataset.price,
                image: event.target.dataset.image,
                sellerId: event.target.dataset.sellerId,
                sellerPhone: event.target.dataset.sellerPhone
            };
            addToCart(product);
        });
    });

    // Show Details buttons
    document.querySelectorAll('.show-details').forEach(button => {
        button.addEventListener('click', async (event) => {
            const productId = event.target.dataset.id;
            await openProductModal(productId);
        });
    });
}

// ============================
// Add product to cart
// ============================
function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} has been added to your cart!`);
}

// ============================
// Open modal with product details
// ============================
async function openProductModal(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();

        const modal = document.getElementById('product-details-modal');
        if (!modal) return;

        const img = document.getElementById('modal-product-image');
        const name = document.getElementById('modal-product-name');
        const price = document.getElementById('modal-product-price');
        const category = document.getElementById('modal-product-category');
        const description = document.getElementById('modal-product-description');

        if (img) img.src = `/uploads/${product.image}`;
        if (name) name.textContent = product.name;
        if (price) price.textContent = `Price: Ksh ${product.price}`;
        if (category) category.textContent = `Category: ${product.category}`;
        if (description) description.textContent = product.description;

        modal.style.display = 'flex';

    } catch (error) {
        console.error('Error fetching product details:', error);
    }
}

// ============================
// Close modal events
// ============================
document.addEventListener('DOMContentLoaded', () => {
    const closeModal = document.querySelector('.close-modal');
    const modal = document.getElementById('product-details-modal');

    if (closeModal && modal) {
        closeModal.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (event) => {
            if (event.target === modal) modal.style.display = 'none';
        });
    }

    // Load products on page load
    fetchPopularProducts();
});

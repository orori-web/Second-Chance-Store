// ============================
// Homepage: Infinite Scroll Products
// ============================
let homepagePage = 1;
let homepageHasMore = true;
const homepageLimit = 10; // how many products per batch

async function fetchPopularProducts(page = 1) {
    try {
        const response = await fetch(`/api/products?page=${page}&limit=${homepageLimit}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        const products = data.products || data;
        const productsContainer = document.querySelector('.popular-products-section .items-container');
        if (!productsContainer) return;

        if (page === 1) productsContainer.innerHTML = ''; // reset first load

        if (!products || products.length === 0) {
            homepageHasMore = false;
            return;
        }

        products.forEach(product => {
            const productWrapper = document.createElement('div');
            productWrapper.classList.add('product-container');

            productWrapper.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
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
                            data-image="${product.image}"
                            data-seller-id="${product.sellerId}" 
                            data-seller-phone="${product.sellerPhone}">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            `;
            productsContainer.appendChild(productWrapper);
        });

        // If fewer products returned than limit → no more left
        if (products.length < homepageLimit) homepageHasMore = false;

    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// ============================
// Infinite Scroll Setup
// ============================
function setupInfiniteScroll() {
    const sentinel = document.createElement('div');
    sentinel.id = 'sentinel';
    const productsContainer = document.querySelector('.popular-products-section .items-container');
    productsContainer.appendChild(sentinel);

    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting && homepageHasMore) {
            homepagePage++;
            await fetchPopularProducts(homepagePage);
        }
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
    });

    observer.observe(sentinel);
}

// ============================
// DOMContentLoaded Setup
// ============================
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('product-details-modal');
    const closeModalBtn = modal.querySelector('.close-modal');

    // Close modal on clicking X
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');

    // Close modal on clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Handle "Details" button clicks
    document.body.addEventListener('click', async (event) => {
        const btn = event.target.closest('.show-details');
        if (!btn) return;

        const productId = btn.dataset.id;
        if (!productId) return;

        try {
            const res = await fetch(`/api/products/${productId}`);
            if (!res.ok) {
                showNotification('Product not found!');
                return;
            }

            const product = await res.json();

            modal.querySelector('#modal-product-image').src = product.image || '';
            modal.querySelector('#modal-product-name').textContent = product.name || '';
            modal.querySelector('#modal-product-price').textContent = `Price: Ksh ${product.price || 'N/A'}`;
            modal.querySelector('#modal-product-category').textContent = `Category: ${product.category || 'N/A'}`;
            modal.querySelector('#modal-product-description').textContent = product.description || 'No description available.';

            modal.style.display = 'flex';
        } catch (err) {
            console.error('Error loading product details:', err);
            showNotification('Failed to load product details.');
        }
    });

    // Handle "Add to Cart" button clicks
    document.body.addEventListener('click', (event) => {
        const btn = event.target.closest('.add-to-cart');
        if (!btn) return;

        const product = {
            id: btn.dataset.id,
            name: btn.dataset.name,
            price: btn.dataset.price,
            image: btn.dataset.image,
            sellerId: btn.dataset.sellerId,
            sellerPhone: btn.dataset.sellerPhone
        };

        if (window.addToCart) {
            window.addToCart(product);
        } else {
            console.warn('Add to Cart function not found!');
        }
    });

    // Initial load + infinite scroll
    fetchPopularProducts();
    setupInfiniteScroll();
});

// ============================
// Toast Notification
// ============================
function showNotification(message) {
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

    requestAnimationFrame(() => { toast.style.opacity = '1'; });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

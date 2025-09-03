// ==============================
// 🔍 Search.js
// ==============================

// Fetch products based on query params
async function fetchProducts(queryParams) {
    try {
        const response = await fetch(`/api/search?${new URLSearchParams(queryParams)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        displayProducts(data.products);
        // If you want pagination later, uncomment:
        // displayPagination(data.totalPages, data.currentPage);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Display products in the results container
function displayProducts(products) {
    const resultsSection = document.getElementById('search-results-section');
    const productsContainer = document.getElementById('search-results');

    // Clear previous
    productsContainer.innerHTML = '';

    if (!products || products.length === 0) {
        resultsSection.style.display = 'block';
        productsContainer.innerHTML = '<p class="no-results">No products found. Try refining your search.</p>';
        return;
    }

    resultsSection.style.display = 'block';

    products.forEach(product => {
        const productWrapper = document.createElement('div');
        productWrapper.classList.add('product-container');

        // ✅ Use Cloudinary URL if available
        const imageSrc = product.image.startsWith('http') ? product.image : `/uploads/${product.image}`;

        productWrapper.innerHTML = `
            <div class="product-image-container">
                <img src="${imageSrc}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-details">
                <p class="product-name">${product.name}</p>
                <p class="product-price">Ksh ${product.price}</p>
                <button class="show-details" data-id="${product._id}">Show Details</button>
                <button class="add-to-cart"
                    data-id="${product._id}"
                    data-name="${product.name}"
                    data-price="${product.price}"
                    data-image="${imageSrc}"
                    data-seller-id="${product.sellerId || ''}"
                    data-seller-phone="${product.sellerPhone || ''}">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
        `;
        productsContainer.appendChild(productWrapper);
    });

    // Attach add-to-cart events
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            const product = {
                id: event.currentTarget.dataset.id,
                name: event.currentTarget.dataset.name,
                price: event.currentTarget.dataset.price,
                image: event.currentTarget.dataset.image,
                sellerId: event.currentTarget.dataset.sellerId,
                sellerPhone: event.currentTarget.dataset.sellerPhone
            };
            addToCart(product);
        });
    });

    // Attach show-details events
    document.querySelectorAll('.show-details').forEach(button => {
        button.addEventListener('click', async (event) => {
            const productId = event.currentTarget.dataset.id;
            await openProductModal(productId);
        });
    });
}

// Add product to cart (localStorage)
function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} has been added to your cart!`);
}

// Open product modal
async function openProductModal(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();

        const imageSrc = product.image.startsWith('http') ? product.image : `/uploads/${product.image}`;

        document.getElementById('modal-product-image').src = imageSrc;
        document.getElementById('modal-product-name').textContent = product.name;
        document.getElementById('modal-product-price').textContent = `Price: Ksh ${product.price}`;
        document.getElementById('modal-product-category').textContent = `Category: ${product.category}`;
        document.getElementById('modal-product-description').textContent = product.description;

        document.getElementById('product-details-modal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching product details:', error);
    }
}

// Close modal
const modalClose = document.querySelector('.close-modal');
if (modalClose) {
    modalClose.addEventListener('click', () => {
        document.getElementById('product-details-modal').style.display = 'none';
    });
}
window.addEventListener('click', (event) => {
    const modal = document.getElementById('product-details-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// ==============================
// 🔹 Autocomplete + Search Handling
// ==============================
const searchInput = document.getElementById('search-query');
const suggestionsContainer = document.getElementById('autocomplete-suggestions');

searchInput.addEventListener('input', async function () {
    const query = this.value.trim();
    suggestionsContainer.innerHTML = '';

    if (query.length < 2) {
        document.getElementById('search-results-section').style.display = 'none';
        return;
    }

    // Fetch search suggestions
    try {
        const response = await fetch(`/api/search/suggestions?q=${query}`);
        const products = await response.json();

        if (products.length > 0) {
            products.forEach(product => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = product.name;

                suggestionItem.addEventListener('click', () => {
                    searchInput.value = product.name;
                    suggestionsContainer.innerHTML = '';
                    const queryParams = { q: product.name, page: 1 };
                    fetchProducts(queryParams);
                });

                suggestionsContainer.appendChild(suggestionItem);
            });
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.innerHTML = '<p>No products found</p>';
            suggestionsContainer.style.display = 'block';
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }

    // Always fetch products while typing
    const queryParams = { q: query, page: 1 };
    fetchProducts(queryParams);
});

// ==============================
// 🔹 Collapse Suggestions on Outside Click or Esc
// ==============================
document.addEventListener('click', function (event) {
    if (!suggestionsContainer.contains(event.target) && event.target !== searchInput) {
        suggestionsContainer.style.display = 'none';
    }
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        suggestionsContainer.style.display = 'none';
    }
});

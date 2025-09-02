document.getElementById('search-query').addEventListener('input', async function() {
    const query = this.value;
    const suggestionsContainer = document.getElementById('autocomplete-suggestions');
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    if (query.length < 2) return; // Skip if input is too short

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
                    document.getElementById('search-query').value = product.name;
                    suggestionsContainer.innerHTML = '';
                    currentQueryParams.q = product.name;
                    currentQueryParams.page = 1;
                    fetchProducts(currentQueryParams);
                });

                suggestionsContainer.appendChild(suggestionItem);
            });
        } else {
            suggestionsContainer.innerHTML = '<p>No products found</p>';
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }

    // Initialize query params
    let currentQueryParams = { q: query, page: 1 };

    // Fetch products based on query params
    async function fetchProducts(queryParams) {
        try {
            const response = await fetch(`/api/search?${new URLSearchParams(queryParams)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            displayProducts(data.products);
            displayPagination(data.totalPages, data.currentPage);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    // Display products in the items container
    function displayProducts(products) {
        const productsContainer = document.querySelector('.items-container');
        productsContainer.innerHTML = '';

        if (products.length === 0) {
            productsContainer.innerHTML = '<p class="no-results">No products found. Try refining your search.</p>';
            return;
        }

        products.forEach(product => {
            const productWrapper = document.createElement('div');
            productWrapper.classList.add('product-container');

            // 🔹 Updated: Use product.image directly if full URL (Cloudinary), else add /uploads/
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
                        data-seller-phone="${product.sellerPhone || ''}"
                   <i class="fas fa-shopping-cart"></i>
                        </button>
                </div>
            `;
            productsContainer.appendChild(productWrapper);
        });

        // Add-to-Cart functionality
        const cartButtons = document.querySelectorAll('.add-to-cart');
        cartButtons.forEach(button => {
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

        // Show Details functionality
        const detailsButtons = document.querySelectorAll('.show-details');
        detailsButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.target.dataset.id;
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

            // 🔹 Updated: Use Cloudinary URL directly if available
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

    // Close modal events
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

    // Trigger initial fetch
    fetchProducts(currentQueryParams);
});

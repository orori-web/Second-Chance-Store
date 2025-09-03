// ==============================
// products2.js
// ==============================

// Function to fetch and display products
async function loadProducts(category = null) {
  try {
      const url = category ? `/api/products?category=${encodeURIComponent(category)}` : '/api/products';
      const response = await fetch(url); // Fetch products from the backend
      const products = await response.json();

      const productsContainer = document.querySelector('.items-container'); // Main container
      productsContainer.innerHTML = ''; // Clear container to prevent duplication
      
      products.forEach(product => {
          const productWrapper = document.createElement('div');
          productWrapper.classList.add('product-container');

          // 🔹 Updated: Use product.image directly if it's a full URL (Cloudinary), else add /uploads/
          const imageSrc = product.image.startsWith('http') ? product.image : `/uploads/${product.image}`;

          productWrapper.innerHTML = `
              <div class="product-image-container">
                  <img src="${imageSrc}" alt="${product.name}" class="product-image">
              </div>
              <div class="product-details">
                  <p class="product-name">${product.name}</p>
                  <p class="product-price">Ksh ${product.price}</p>
                  <button class="show-details" data-id="${product._id}">Details</button>
                  <button class="add-to-cart" 
                      data-id="${product._id}" 
                      data-name="${product.name}" 
                      data-price="${product.price}" 
                      data-image="${imageSrc}"  
                      data-seller-id="${product.sellerId}"
                      data-seller-phone="${product.sellerPhone}"
                      <i class="fas fa-shopping-cart"></i>
                        </button>
                 
              </div>
          `;

          productsContainer.appendChild(productWrapper);
      });

      // Attach event listeners to buttons
      window.initializeProductButtons();

  } catch (error) {
      console.error('Error loading products:', error);
  }
}

// Function to open the modal and load product details
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

// Function to add product to cart
function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${product.name} has been added to your cart!`);
}

// Global function to attach event listeners to product buttons
window.initializeProductButtons = function() {
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

  document.querySelectorAll('.show-details').forEach(button => {
      button.addEventListener('click', (event) => {
          const productId = event.target.dataset.id;
          openProductModal(productId);
      });
  });
};

// Close modal on clicking close button or outside the modal
document.querySelector('.close-modal').addEventListener('click', () => {
  document.getElementById('product-details-modal').style.display = 'none';
});
window.addEventListener('click', (event) => {
  const modal = document.getElementById('product-details-modal');
  if (event.target === modal) {
      modal.style.display = 'none';
  }
});

// Load products on page load
document.addEventListener('DOMContentLoaded', () => loadProducts());

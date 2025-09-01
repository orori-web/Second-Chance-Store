// ============================
// Modal & Pagination Setup
// ============================
const modal = document.getElementById('products-modal');
const modalContainer = document.getElementById('modal-products-container');
const modalPagination = document.getElementById('modal-pagination');
const closeModal = modal.querySelector('.close-modal');

let currentProducts = [];
let currentPage = 1;
const productsPerPage = 10;

// Render products inside the modal with pagination
function renderModalProducts(page = 1) {
  modalContainer.innerHTML = '';

  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const pageProducts = currentProducts.slice(start, end);

  pageProducts.forEach(product => {
    const productWrapper = document.createElement('div');
    productWrapper.classList.add('product-container');

    // Fix: Ensure image path does not have double /uploads/
    const imageSrc = product.image.startsWith('/uploads/')
      ? product.image
      : `/uploads/${product.image}`;

    productWrapper.innerHTML = `
      <div class="product-image-container">
        <img src="${imageSrc}" alt="${product.name}" class="product-image">
      </div>
      <div class="product-details">
        <p class="product-name">${product.name}</p>
        <p class="product-price">Ksh ${product.price}</p>
        <div class="button-group">
          <button class="show-details" data-id="${product._id}">Show Details</button>
          <button class="add-to-cart" 
              data-id="${product._id}" 
              data-name="${product.name}" 
              data-price="${product.price}" 
              data-image="${imageSrc}"
              data-seller-id="${product.sellerId}"
              data-seller-phone="${product.sellerPhone}">Add to Cart</button>
        </div>
      </div>
    `;

    modalContainer.appendChild(productWrapper);
  });

  attachEventListeners(); // hook up modal + cart buttons

  // Render pagination buttons
  modalPagination.innerHTML = '';
  const totalPages = Math.ceil(currentProducts.length / productsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === page) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = i;
      renderModalProducts(i);
    });
    modalPagination.appendChild(btn);
  }
}

// Open modal when "See All" is clicked
document.querySelectorAll('.see-all-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const sectionId = btn.dataset.target;
    const row = document.getElementById(sectionId);
    if (!row) return;

    // Build products array from dataset attributes (avoids double /uploads/)
    currentProducts = Array.from(row.children).map(card => ({
      _id: card.querySelector('.show-details')?.dataset.id || '',
      name: card.querySelector('.product-name')?.textContent || '',
      price: card.querySelector('.product-price')?.textContent.replace('Ksh ', '') || '',
      image: card.querySelector('.add-to-cart')?.dataset.image || '', // relative path
      sellerId: card.querySelector('.add-to-cart')?.dataset.sellerId || '',
      sellerPhone: card.querySelector('.add-to-cart')?.dataset.sellerPhone || ''
    }));

    currentPage = 1;
    renderModalProducts();
    modal.style.display = 'flex';
  });
});

// Close modal when clicking X or outside modal content
closeModal.addEventListener('click', () => modal.style.display = 'none');
modal.addEventListener('click', e => {
  if (e.target === modal) modal.style.display = 'none';
});

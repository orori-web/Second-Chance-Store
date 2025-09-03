

// ============================
// Helper: Render a section
// ============================
function renderSection(sectionId, products, categoryName) {
  const container = document.getElementById(sectionId);
  if (!container) return;

  container.innerHTML = "";

  if (products && products.length > 0) {
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

      container.appendChild(productWrapper);
    });
  } else {
    container.innerHTML = `<p>No ${categoryName} found</p>`;
  }
}

// ============================
// Load all homepage sections
// ============================
async function loadHomepageSections() {
  try {
    const response = await fetch('/api/products/homepage');
    if (!response.ok) throw new Error("Failed to fetch homepage sections");

    const data = await response.json();

    renderSection('addedRecently', data.addedRecently, "Recently Added");
    renderSection('electronics', data.electronicsDeals, "Electronics");
    renderSection('phones', data.phoneDeals, "Phones");
    renderSection('tvs', data.tvDeals, "TVs");
    renderSection('fashion', data.fashionDeals, "Fashion");

    renderSection('furnitures', data.furnitureDeals, "Furnitures");
    renderSection('homeComforts', data.homeComfortsDeals, "Home-Comforts");
    renderSection('kitchen', data.kitchenDeals, "Kitchen");
    renderSection('transport', data.transportDeals, "Transport");
    renderSection('personalCare', data.personalCareDeals, "Personal-Care");

  } catch (err) {
    console.error("Error loading homepage sections:", err);
  }
}

// ============================
// Scroll + delegated events
// ============================
document.addEventListener('click', e => {
  // Scroll buttons
  if (e.target.classList.contains('scroll-left') || e.target.classList.contains('scroll-right')) {
    const targetId = e.target.dataset.target;
    const row = document.getElementById(targetId);
    const scrollAmount = e.target.classList.contains('scroll-left') ? -300 : 300;
    if (row) row.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  // Show Details button (delegated)
  const detailsBtn = e.target.closest('.show-details');
  if (detailsBtn) {
    const productId = detailsBtn.dataset.id;
    const modal = document.getElementById('product-details-modal');
    if (!productId || !modal) return;

    fetch(`/api/products/${productId}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(product => {
        modal.querySelector('#modal-product-image').src = product.image || '';
        modal.querySelector('#modal-product-name').textContent = product.name || '';
        modal.querySelector('#modal-product-price').textContent = `Price: Ksh ${product.price || 'N/A'}`;
        modal.querySelector('#modal-product-category').textContent = `Category: ${product.category || 'N/A'}`;
        modal.querySelector('#modal-product-description').textContent = product.description || 'No description available.';
        modal.style.display = 'flex';
      })
      .catch(err => {
        console.error('Error loading homepage sections:', err);
        showNotification('Failed to load product details.');
      });
  }


});

// ============================
// Load sections on DOM ready
// ============================
document.addEventListener("DOMContentLoaded", () => {
  loadHomepageSections();
});

// ============================
// See All button toggle
// ============================
document.querySelectorAll('.see-all-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const row = document.getElementById(targetId);

    if (!row) return;

    row.classList.toggle('expanded');
    btn.textContent = row.classList.contains('expanded') ? 'Show Less' : 'See All';
  });
});

// ============================
// Fallback notification
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

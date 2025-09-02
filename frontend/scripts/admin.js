// admin.js

document.addEventListener("DOMContentLoaded", () => {
    // Buttons
    const manageUsersBtn = document.getElementById("manageUsersBtn");
    const manageProductsBtn = document.getElementById("manageProductsBtn");

    // Sections
    const usersSection = document.getElementById("usersSection");
    const productsSection = document.getElementById("productsSection");

    // Tables
    const usersTableBody = document.querySelector("#usersTable tbody");
    const productsTableBody = document.querySelector("#productsTable tbody");

    // ==============================
    // Fetch Dashboard Stats
    // ==============================
    async function fetchDashboardStats() {
        try {
            const res = await fetch("/api/admin/dashboard");
            const data = await res.json();

            document.getElementById("total-users").textContent = data.totalUsers ?? "--";
            document.getElementById("total-products").textContent = data.totalProducts ?? "--";
            document.getElementById("total-orders").textContent = data.totalOrders ?? "--";
        } catch (err) {
            console.error("Error fetching dashboard stats:", err);
        }
    }

    // Call it once on page load
    fetchDashboardStats();

    // ==============================
    // Switch between sections
    // ==============================
    manageUsersBtn.addEventListener("click", () => {
        usersSection.classList.remove("hidden");
        productsSection.classList.add("hidden");
        fetchUsers();
    });

    manageProductsBtn.addEventListener("click", () => {
        productsSection.classList.remove("hidden");
        usersSection.classList.add("hidden");
        fetchProducts();
    });

    // ==============================
    // Fetch Users from backend
    // ==============================
    async function fetchUsers() {
        try {
            const res = await fetch("/api/admin/users");
            const users = await res.json();

            usersTableBody.innerHTML = "";

            users.forEach(user => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user._id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>
                        <button class="delete-btn btn-red" data-id="${user._id}">Delete</button>
                    </td>
                `;
                usersTableBody.appendChild(row);
            });

            attachDeleteEvents(".delete-btn", deleteUser);

        } catch (err) {
            console.error("Error fetching users:", err);
        }
    }

    // ==============================
    // Delete a User
    // ==============================
    async function deleteUser(userId) {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
            if (res.ok) {
                alert("User deleted successfully!");
                fetchUsers();
                fetchDashboardStats(); // Update dashboard
            } else {
                alert("Error deleting user");
            }
        } catch (err) {
            console.error("Error deleting user:", err);
        }
    }

    // ==============================
    // Fetch Products
    // ==============================
    async function fetchProducts() {
        try {
            const res = await fetch("/api/admin/products");
            const products = await res.json();

            productsTableBody.innerHTML = "";

            products.forEach(product => {
                const row = document.createElement("tr");

                // 🔹 Updated: Handle Cloudinary URLs or fallback
                const imageSrc = product.image 
                    ? (product.image.startsWith('http') ? product.image : `/uploads/${product.image}`)
                    : '/uploads/default-image.jpg';

                row.innerHTML = `
                    <td>${product._id}</td>
                    <td>
                        <div class="product-cell">
                            <img src="${imageSrc}" 
                                 alt="${product.name}" class="product-img">
                            <span>${product.name}</span>
                        </div>
                    </td>
                    <td>${product.price}</td>
                    <td>
                        <button class="delete-btn btn-red" data-id="${product._id}">Delete</button>
                    </td>
                `;
                productsTableBody.appendChild(row);
            });

            attachDeleteEvents(".delete-btn", deleteProduct);

        } catch (err) {
            console.error("Error fetching products:", err);
        }
    }

    // ==============================
    // Delete a Product
    // ==============================
    async function deleteProduct(productId) {
        try {
            const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
            if (res.ok) {
                alert("Product deleted successfully!");
                fetchProducts();
                fetchDashboardStats(); // Update dashboard
            } else {
                alert("Error deleting product");
            }
        } catch (err) {
            console.error("Error deleting product:", err);
        }
    }

    // ==============================
    // Helper: Attach Delete Events
    // ==============================
    function attachDeleteEvents(selector, callback) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener("click", () => callback(btn.dataset.id));
        });
    }
});

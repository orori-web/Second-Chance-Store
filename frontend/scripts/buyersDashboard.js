document.addEventListener('DOMContentLoaded', () => {
    const orderHistoryContainer = document.getElementById('order-history');

    // Function to fetch order history for the logged-in buyer
    async function fetchOrderHistory() {
        try {
            const response = await fetch('/api/orders/myorders', {
                method: 'GET',
                credentials: 'include' // Include cookies if needed
            });
            if (!response.ok) {
                throw new Error('Failed to fetch order history');
            }
            const data = await response.json();
            renderOrderHistory(data.orders);
        } catch (error) {
            console.error('Error fetching order history:', error.message);
            orderHistoryContainer.innerHTML = '<p>Unable to load order history. Please try again later.</p>';
        }
    }

    // Function to render the order history in the UI
    function renderOrderHistory(orders) {
        orderHistoryContainer.innerHTML = ''; // Clear previous content

        if (!orders || orders.length === 0) {
            orderHistoryContainer.innerHTML = '<p>No orders found.</p>';
            return;
        }

        orders.forEach(order => {
            const orderDiv = document.createElement('div');
            orderDiv.classList.add('order-card');
            orderDiv.innerHTML = `
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Total:</strong> Ksh ${order.totalPrice.toFixed(2)}</p>
                <p><strong>Status:</strong> ${order.status}</p>
            `;
            orderHistoryContainer.appendChild(orderDiv);
        });
    }

    // Initialize order history fetch
    fetchOrderHistory();
});

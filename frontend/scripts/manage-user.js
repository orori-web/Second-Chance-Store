document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.querySelector('#user-table-body');

  // Safeguard: Check if tbody exists
  if (!tbody) {
    console.error('Element with id "user-table-body" not found in HTML.');
    return;
  }

  try {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
    const users = await response.json();

    tbody.innerHTML = '';

    users.forEach((user, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td><button class="delete-btn" data-id="${user._id}">Delete</button></td>
      `;
      tbody.appendChild(row);
    });

    // Add delete functionality
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const userId = e.target.dataset.id;
        try {
          const deleteResponse = await fetch(`/api/users/${userId}`, {
            method: 'DELETE'
          });

          if (!deleteResponse.ok) {
            const text = await deleteResponse.text();
            throw new Error(`Failed to delete user. Server response: ${text}`);
          }

          // Remove the deleted user's row from the table
          e.target.closest('tr').remove();

        } catch (err) {
          console.error('Error deleting user:', err);
          alert('Failed to delete user.');
        }
      });
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    tbody.innerHTML = `<tr><td colspan="4">Failed to load users.</td></tr>`;
  }
});

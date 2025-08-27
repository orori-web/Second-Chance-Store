document.getElementById('adminLoginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json();

  if (response.ok && result.success) {
    // Save token or session data
    localStorage.setItem('adminToken', result.token); // example: using JWT
    window.location.href = 'admin-dashboard.html'; // go to dashboard
  } else {
    document.getElementById('errorMessage').textContent = result.message || 'Login failed.';
  }
});

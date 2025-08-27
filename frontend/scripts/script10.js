document.getElementById("google-btn").addEventListener("click", () => {
  // Redirect to backend Google OAuth route
    window.location.href = "/api/auth/google"
});



// ============================
// Handle redirect after login
// ============================

// Get query parameters from URL
function getQueryParams() {
  const params = {};
  const queryString = window.location.search.substring(1);
  const pairs = queryString.split("&");
  
  for (let pair of pairs) {
    const [key, value] = pair.split("=");
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }
  return params;
}

const params = getQueryParams();

// If backend sent token & user info in URL, save them
if (params.token && params.user) {
  localStorage.setItem("authToken", params.token);
  localStorage.setItem("user", params.user);

  
}

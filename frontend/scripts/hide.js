// hide.js
document.addEventListener("DOMContentLoaded", async () => {
    const ADMIN_EMAIL = "nyanchongiorori@gmail.com"; // your hardcoded admin
    const adminLink = document.querySelector("#admin-link"); // the link in HTML

    // Initially hide the link
    if (adminLink) adminLink.style.display = "none";

    try {
        // Fetch logged-in user info
        const res = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include" // include cookies if using cookie-based auth
        });

        if (!res.ok) throw new Error("User not logged in");

        const data = await res.json();

        // Show admin link only if email matches
        if (data.user && data.user.email === ADMIN_EMAIL) {
            if (adminLink) adminLink.style.display = "inline-block";
        }
    } catch (err) {
        console.warn("Admin link hidden:", err.message);
    }
});

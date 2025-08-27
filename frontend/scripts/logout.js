document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.querySelector(".logout-btn");

    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            // Confirm if the user really wants to log out
            const confirmLogout = confirm("Are you sure you want to log out?");
            if (!confirmLogout) return;

            try {
                // Call backend logout route to clear HttpOnly cookie
                const response = await fetch("/api/auth/logout", {
                    method: "POST",
                    credentials: "include" // 🔑 ensures cookies are sent
                });

                if (!response.ok) {
                    throw new Error("Failed to log out");
                }

                // Clear any client-side stored data
                localStorage.removeItem("authToken");
                localStorage.removeItem("userId");
                localStorage.removeItem("cart");

                // Redirect to home page
                window.location.href = "index1.html";
            } catch (error) {
                console.error("Logout error:", error);
                alert("Something went wrong while logging out.");
            }
        });
    }
});

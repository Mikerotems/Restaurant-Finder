const status = document.getElementById("login-status");
const loginLink = document.getElementById("login-link");
const apiBase = document.querySelector('meta[name="auth-api-url"]')?.content;
const token = sessionStorage.getItem("restaurant-finder-auth-token");

if (token && status) {
  if (!apiBase) {
    status.textContent = "Unable to verify your login because the account service is not configured.";
  } else {
    try {
      const response = await fetch(`${apiBase.replace(/\/$/, "")}/api/users/auth`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        status.textContent = "Congratulations, you're logged in!";
      } else if (response.status === 401) {
        sessionStorage.removeItem("restaurant-finder-auth-token");
        status.textContent = "Your login session has expired. Please sign in again.";
        if (loginLink) loginLink.hidden = false;
      } else {
        status.textContent = "Unable to verify your login right now. Please try again.";
      }
    } catch (error) {
      console.error("Login confirmation request failed:", error);
      status.textContent = "Unable to verify your login right now. Please try again.";
    }
  }
}

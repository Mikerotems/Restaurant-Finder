const form = document.getElementById("auth-form");
const status = document.getElementById("auth-status");
const apiBase = document.querySelector('meta[name="auth-api-url"]')?.content;

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const action =
    event.submitter instanceof HTMLButtonElement && event.submitter.value === "login"
      ? "login"
      : "register";
  const formData = new FormData(form);
  const buttons = [...form.querySelectorAll("button[type='submit']")];
  buttons.forEach((button) => {
    button.disabled = true;
  });
  if (status) status.textContent = "";

  try {
    if (!apiBase) {
      throw new Error("Account service is not configured.");
    }
    const response = await fetch(`${apiBase.replace(/\/$/, "")}/api/users/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "The request could not be completed.");
    }

    if (action === "login") {
      if (typeof result.token !== "string" || !result.token) {
        throw new Error("The account service did not return a login token.");
      }
      sessionStorage.setItem("restaurant-finder-auth-token", result.token);
      window.location.assign("details.html");
      return;
    }

    if (status) status.textContent = "Registration successful. Please sign in with your new account.";
    form.reset();
  } catch (error) {
    if (status) {
      status.textContent = error instanceof Error
        ? error.message
        : "Unable to contact the account service. Please try again.";
    }
  } finally {
    buttons.forEach((button) => {
      button.disabled = false;
    });
  }
});

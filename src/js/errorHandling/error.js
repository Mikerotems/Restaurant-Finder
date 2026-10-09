import { DEFAULT_ERROR_MESSAGE } from "../constants.js";
// Error handling with bootstrap. Prepending to body. This alert happens when there is something wrong with url or connection issues.
export function handleError(msg = DEFAULT_ERROR_MESSAGE) {
    const alertContainer = document.createElement("div");
    alertContainer.className = "alert alert-warning alert-dismissible fade show";
    alertContainer.setAttribute("role", "alert");
  
    alertContainer.innerHTML = `
        
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
          <strong>${msg}</strong>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          `;
    document.body.prepend(alertContainer);
  }
// Alert the user that the App is not tracking and they need to enter Location
  export function noTracking() {
    const noTracking = document.getElementById("form_noTrack");
      noTracking.classList.remove("hidden");
      const tracking = document.getElementById("form_track");
      tracking.classList.add("hidden");

    const alertContainer = document.createElement("div");
    alertContainer.className = "alert alert-info  alert-dismissible fade show";
    alertContainer.setAttribute("role", "alert");

    alertContainer.innerHTML = `
    
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
  </svg>
          <strong> Please enter your location</strong>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          `;
    document.body.prepend(alertContainer);
    
  }
  
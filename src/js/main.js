

    //Search Form Sumbmit Handler
import { centerOnMarker } from "./cardsAndMaps/drawMap.js";
import {
  getRestaurants,
  noTrackGetRestaurants,
} from "./cardsAndMaps/restaurant.js";
import { noTracking } from "./errorHandling/error.js";
import { initializeMap } from "./map.js";
import { searchRecipes } from "./edamamapi.js";

const SEARCH_PREFS_KEY = "restaurant-finder-search-preferences";

function getDefaultSearchPreferences() {
  return {
    searchTerm: "",
    location: "",
    radius: "5",
    lastSearchType: "geo",
    lastSearchAt: "",
  };
}

function loadSearchPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(SEARCH_PREFS_KEY) || "null");
    if (!saved || typeof saved !== "object") {
      return getDefaultSearchPreferences();
    }

    return {
      ...getDefaultSearchPreferences(),
      ...saved,
    };
  } catch {
    return getDefaultSearchPreferences();
  }
}

function saveSearchPreferences(preferences) {
  const payload = {
    ...getDefaultSearchPreferences(),
    ...preferences,
  };

  localStorage.setItem(SEARCH_PREFS_KEY, JSON.stringify(payload));
}

function restoreSearchPreferences() {
  const preferences = loadSearchPreferences();

  const restaurantName = document.getElementById("restaurant_name");
  if (restaurantName && preferences.searchTerm) {
    restaurantName.value = preferences.searchTerm;
  }

  const radiusTrack = document.getElementById("search_range_Track");
  const radiusTrackLabel = document.getElementById("radius_miles_Track");
  if (radiusTrack && preferences.radius) {
    radiusTrack.value = preferences.radius;
  }
  if (radiusTrackLabel && preferences.radius) {
    radiusTrackLabel.textContent = preferences.radius;
  }

  const noTrackName = document.getElementById("restaurant_name_noTrack");
  const noTrackLocation = document.getElementById("location_name_noTrack");
  const noTrackRadius = document.getElementById("search_range_noTrack");
  const noTrackRadiusLabel = document.getElementById("radius_miles_noTrack");

  if (noTrackName && preferences.searchTerm) {
    noTrackName.value = preferences.searchTerm;
  }
  if (noTrackLocation && preferences.location) {
    noTrackLocation.value = preferences.location;
  }
  if (noTrackRadius && preferences.radius) {
    noTrackRadius.value = preferences.radius;
  }
  if (noTrackRadiusLabel && preferences.radius) {
    noTrackRadiusLabel.textContent = preferences.radius;
  }
}

initializeMap("map_container");
restoreSearchPreferences();

const trackingForm = document.getElementById("form_track");
trackingForm?.addEventListener("submit", (event) => {
  const restaurantInput = document.getElementById("restaurant_name");
  const radiusInput = document.getElementById("search_range_Track");

  if (!restaurantInput || !radiusInput) return;

  event.preventDefault();

  const searchTerm = restaurantInput.value.trim();
  const radius = radiusInput.value;
  searchRecipes(searchTerm);

  saveSearchPreferences({
    searchTerm,
    radius,
    lastSearchType: "geo",
    lastSearchAt: new Date().toISOString(),
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getRestaurants, noTracking);
  } else {
    noTracking();
  }
});

const noTrackForm = document.getElementById("form_noTrack");
noTrackForm?.addEventListener("submit", (event) => {
  const restaurantInput = document.getElementById("restaurant_name_noTrack");
  const locationInput = document.getElementById("location_name_noTrack");
  const radiusInput = document.getElementById("search_range_noTrack");

  if (!restaurantInput || !locationInput || !radiusInput) return;

  event.preventDefault();

  const searchTerm = restaurantInput.value.trim();
  const location = locationInput.value.trim();
  const radius = radiusInput.value;
  searchRecipes(searchTerm);

  saveSearchPreferences({
    searchTerm,
    location,
    radius,
    lastSearchType: "manual",
    lastSearchAt: new Date().toISOString(),
  });

  noTrackGetRestaurants(location, searchTerm);
});

const restaurantResults = document.getElementById("restaurant_results");
restaurantResults?.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const mapLink = event.target.closest(".card-link");
  if (!mapLink) return;

  const card = mapLink.closest(".card");
  if (!card) return;

  centerOnMarker({
    lat: Number(card.getAttribute("lat")),
    lng: Number(card.getAttribute("lng")),
  });
});

const noTrackRange = document.getElementById("search_range_noTrack");
noTrackRange?.addEventListener("input", (event) => {
  const output = document.getElementById("radius_miles_noTrack");
  if (output) output.textContent = event.target.value;

  const currentPrefs = loadSearchPreferences();
  saveSearchPreferences({
    ...currentPrefs,
    radius: event.target.value,
  });
});

const trackRange = document.getElementById("search_range_Track");
trackRange?.addEventListener("input", (event) => {
  const output = document.getElementById("radius_miles_Track");
  if (output) output.textContent = event.target.value;

  const currentPrefs = loadSearchPreferences();
  saveSearchPreferences({
    ...currentPrefs,
    radius: event.target.value,
  });
});

const restaurantName = document.getElementById("restaurant_name");
restaurantName?.addEventListener("input", () => {
  const query = restaurantName.value.trim();
  if (!query) {
    document.getElementById("recipe_status")?.setAttribute("data-empty", "true");
  }
});

const formTrack = document.getElementById("form_track");
formTrack?.addEventListener("focusin", () => {
  formTrack.classList.add("active-search");
});

formTrack?.addEventListener("focusout", () => {
  formTrack.classList.remove("active-search");
});

const navToggle = document.getElementById("nav-button");
navToggle?.addEventListener("mouseenter", () => {
  navToggle.classList.add("is-hovered");
});

navToggle?.addEventListener("mouseleave", () => {
  navToggle.classList.remove("is-hovered");
});

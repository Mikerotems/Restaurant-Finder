

    //Search Form Sumbmit Handler
import { centerOnMarker } from "./cardsAndMaps/drawMap.js";
import {
  getRestaurants,
  noTrackGetRestaurants,
} from "./cardsAndMaps/restaurant.js";
import { noTracking } from "./errorHandling/error.js";
import { initializeMap } from "./map.js";
import { searchRecipes } from "./edamamapi.js";

initializeMap("map_container");

// When the user hits submit, the getRestaurants function is called passing the coordinates and form data
const trackingForm = document.getElementById("form_track");
trackingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  searchRecipes(document.getElementById("restaurant_name").value);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getRestaurants, noTracking);
  } else {
    noTracking();
  }
});

// No tracking form submit button functionality. Passes both search and location values
document.getElementById("form_noTrack")?.addEventListener("submit", (event) => {
  event.preventDefault();
  searchRecipes(document.getElementById("restaurant_name_noTrack").value);
  noTrackGetRestaurants(
    document.getElementById("location_name_noTrack").value,
    document.getElementById("restaurant_name_noTrack").value
  );
});

// Functionality for the "Map" button on the cards. Focuses the map on the restaurant and zooms in.
document.getElementById("restaurant_results").addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const mapLink = event.target.closest(".card-link");
  if (!mapLink) return;

  const card = mapLink.closest(".card");
  centerOnMarker({
    lat: Number(card.getAttribute("lat")),
    lng: Number(card.getAttribute("lng")),
  });
});

// Event listeners to update the value of the Radius slider as its changed
document.getElementById("search_range_noTrack")?.addEventListener(
  "change",
  (event) => {
    document.getElementById("radius_miles_noTrack").textContent =
      event.target.value;
  }
);

document.getElementById("search_range_Track")?.addEventListener(
  "change",
  (event) => {
    (document.getElementById("radius_miles_Track").textContent =
      event.target.value);
  }
);

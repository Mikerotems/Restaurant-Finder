

    //Search Form Sumbmit Handler
import { centerOnMarker } from "./cardsAndMaps/drawMap.js";
import {
  getRestaurants,
  noTrackGetRestaurants,
} from "./cardsAndMaps/restaurant.js";
import { noTracking } from "./errorHandling/error.js";
import { initializeMap } from "./map.js";

document.addEventListener('DOMContentLoaded', () => {
        const map = initializeMap('map-container');
        return map;
    });
// This will turn on the initial location services to set the appropriate form or it will show the notracking form
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(() => {}, noTracking);
}

// When the user hits submit, the getRestaurants function is called passing the coordinates and form data
form_track.addEventListener("submit", (event) => {
  event.preventDefault();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getRestaurants, noTracking);
  }
});

// No tracking form submit button functionality. Passes both search and location values
form_noTrack.addEventListener("submit", (event) => {
  event.preventDefault();
  noTrackGetRestaurants(
    location_name_noTrack.value,
    restaurant_name_noTrack.value
  );
});

// Functionality for the "Map" button on the cards. Focuses the map on the restaurant and zooms in.
restaurant_results.onclick = (event) => {
  let target = event.target.parentNode;
  if (target.classList.contains("card-body")) {
    const coords = {
      lat: Number(target.parentElement.getAttribute("lat")),
      lng: Number(target.parentElement.getAttribute("lng")),
    };
    centerOnMarker(coords);
  }
};

// Event listeners to update the value of the Radius slider as its changed
search_range_noTrack.addEventListener(
  "change",
  () => (radius_miles_noTrack.textContent = search_range_noTrack.value)
);

search_range_Track.addEventListener(
  "change",
  () => (radius_miles_Track.textContent = search_range_Track.value)
);

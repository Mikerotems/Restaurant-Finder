
export let map;

export function initializeMap(containerId) {
  const status = document.getElementById("map_status");
  const token = document
    .querySelector('meta[name="mapbox-access-token"]')
    ?.content.trim();

  if (!token) {
    status.textContent =
      "Please wait, while we load the map. Try again later if this message persists.";
    return null;
  }

  if (!window.mapboxgl) {
    status.textContent = "The Mapbox map library could not be loaded.";
    return null;
  }

  window.mapboxgl.accessToken = token;
  map = new window.mapboxgl.Map({
    container: containerId,
    style: "mapbox://styles/mapbox/streets-v12",
    center: [-74.5, 40],
    zoom: 9,
  });

  map.on("load", () => {
    status.textContent = "";
  });
  map.on("error", ({ error }) => {
    console.error("Mapbox map error:", error);
    status.textContent =
      "The map could not be loaded. Check that your Mapbox token is valid and allowed for this website.";
  });

  return map;
}

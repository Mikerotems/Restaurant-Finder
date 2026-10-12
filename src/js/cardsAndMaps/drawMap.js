import { map } from "../map.js";

let markers = [];

export function drawMap({ lat, lng }, restaurants) {
  if (!map) return;

  for (const marker of markers) marker.remove();
  markers = [];

  const bounds = new window.mapboxgl.LngLatBounds();
  bounds.extend([lng, lat]);

  for (const restaurant of restaurants) {
    const restaurantLat = Number(restaurant.coordinates?.latitude);
    const restaurantLng = Number(restaurant.coordinates?.longitude);
    if (!Number.isFinite(restaurantLat) || !Number.isFinite(restaurantLng)) {
      continue;
    }

    const popupContent = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = restaurant.name;
    popupContent.append(name);

    const address = document.createElement("p");
    address.textContent =
      restaurant.location?.display_address?.join(", ") ?? "";
    popupContent.append(address);

    if (restaurant.phone) {
      const phone = document.createElement("p");
      phone.textContent = restaurant.phone;
      popupContent.append(phone);
    }

    const link = document.createElement("a");
    link.href = restaurant.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "More information";
    popupContent.append(link);

    const marker = new window.mapboxgl.Marker()
      .setLngLat([restaurantLng, restaurantLat])
      .setPopup(new window.mapboxgl.Popup().setDOMContent(popupContent))
      .addTo(map);
    markers.push(marker);
    bounds.extend([restaurantLng, restaurantLat]);
  }

  map.fitBounds(bounds, {
    padding: 48,
    maxZoom: 14,
    duration: 700,
  });
}

// centers the map on a location and zooms into it.
export function centerOnMarker({ lat, lng }) {
  if (!map) return;
  map.panTo({ lat: lat, lng: lng });
  map.setZoom(18);
}

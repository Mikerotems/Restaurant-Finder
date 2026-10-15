import { handleError } from "../errorHandling/error.js";
import { drawMap } from "./drawMap.js";
import { getData } from "../apiHelper/getData.js";
import { NO_FOUND_RESTAURANTS } from "../constants.js";

//Setting default lat/lng to 0
const locationCoords = {
  lat: 0,
  lng: 0,
};

//When user allows geolocation. This function uses the lat and long of user's current position and search radius to display cards.
export function getRestaurants({ coords: { latitude: lat, longitude: lon } }) {
  locationCoords.lat = Number(lat);
  locationCoords.lng = Number(lon);
  const meters = calculateRadius(
    document.getElementById("search_range_Track").value
  );
  const term = document.getElementById("restaurant_name").value;
  handleUrl(
    buildApiUrl({
      term,
      latitude: lat,
      longitude: lon,
      radius: meters,
    })
  );
}
//Without geolocation. This function uses a searchlocation, searchTerm, and searchRadius to display cards.
export function noTrackGetRestaurants(searchlocation, searchTerm) {
  const meters = calculateRadius(
    document.getElementById("search_range_noTrack").value
  );
  handleUrl(
    buildApiUrl({
      location: searchlocation,
      radius: meters,
      term: searchTerm,
    })
  );
}

function buildApiUrl(params) {
  const apiUrl = document
    .querySelector('meta[name="restaurant-api-url"]')
    ?.content.trim();
  if (!apiUrl) {
    throw new Error("Restaurant search service is not configured.");
  }

  const query = new URLSearchParams({
    ...params,
    open_now: "true",
    sort_by: "best_match",
    limit: "20",
  });
  return `${apiUrl.replace(/\/+$/, "")}/api/restaurants?${query}`;
}

//Uses json data to handle errors and show the cards
function handleUrl(url) {
  getData(url).then((json_payload) => {
    const apiError = json_payload?.error;

    if (apiError) {
      handleError(apiError.code);
    } else if (!Array.isArray(json_payload?.businesses)) {
      throw new Error("The restaurant search service returned invalid data.");
    } else if (json_payload.businesses.length === 0) {
      handleError(NO_FOUND_RESTAURANTS);
    } else {
      const restaurants = json_payload.businesses.map(normalizeRestaurant);
      showRes(restaurants);
    }
  }).catch((error) => {
    console.error("Restaurant search failed:", error);
    handleError(
      error instanceof Error
        ? error.message
        : "Could not reach the restaurant search service. Check your connection and try again."
    );
  });
}

function normalizeRestaurant(restaurant) {
  return {
    id: restaurant.id ?? "",
    name: restaurant.name ?? "Restaurant",
    image_url: restaurant.image_url ?? "",
    url: restaurant.url ?? "",
    review_count: Number.isFinite(restaurant.review_count)
      ? restaurant.review_count
      : null,
    rating: Number.isFinite(restaurant.rating) ? restaurant.rating : null,
    categories: Array.isArray(restaurant.categories)
      ? restaurant.categories
          .map((category) => category?.title)
          .filter((title) => typeof title === "string" && title.length > 0)
      : [],
    price: restaurant.price ?? "",
    distance: Number.isFinite(restaurant.distance)
      ? restaurant.distance
      : null,
    is_closed:
      typeof restaurant.is_closed === "boolean"
        ? restaurant.is_closed
        : null,
    coordinates: {
      latitude: Number.isFinite(restaurant.coordinates?.latitude)
        ? restaurant.coordinates.latitude
        : null,
      longitude: Number.isFinite(restaurant.coordinates?.longitude)
        ? restaurant.coordinates.longitude
        : null,
    },
    location: {
      display_address: Array.isArray(restaurant.location?.display_address)
        ? restaurant.location.display_address.filter(
            (line) => typeof line === "string"
          )
        : [],
    },
    phone: restaurant.display_phone ?? restaurant.phone ?? "",
  };
}

function getExternalUrl(value) {
  if (typeof value !== "string" || !value) return false;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    return url.href;
  } catch {
    return false;
  }
}

function setExternalUrl(element, value) {
  const url = getExternalUrl(value);
  if (!url) return false;

  element.href = url;
  element.target = "_blank";
  element.rel = "noopener noreferrer";
  return true;
}

// Builds result cards from the restaurant JSON array and passes the same data to the map.
function showRes(restaurants) {
  const results = document.getElementById("restaurant_results");
  results.replaceChildren();

  for (const rest of restaurants) {
    const cardContainer = document.createElement("div");
    cardContainer.className = "card grid-item";
    cardContainer.style.width = "18rem";
    cardContainer.style.minHeight = "22rem";

    const hasCoordinates =
      Number.isFinite(rest.coordinates.latitude) &&
      Number.isFinite(rest.coordinates.longitude);
    if (hasCoordinates) {
      cardContainer.setAttribute("lat", String(rest.coordinates.latitude));
      cardContainer.setAttribute("lng", String(rest.coordinates.longitude));
    }

    if (rest.image_url) {
      const image = document.createElement("img");
      image.className = "card-img-top card-img";
      image.alt = `Photo of ${rest.name}`;
      const imageUrl = getExternalUrl(rest.image_url);
      if (imageUrl) {
        image.src = imageUrl;
        const imageLink = document.createElement("a");
        if (setExternalUrl(imageLink, rest.url)) {
          imageLink.append(image);
          cardContainer.append(imageLink);
        } else {
          cardContainer.append(image);
        }
      } else {
        image.removeAttribute("src");
      }
    }

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h5");
    title.className = "card-title";
    title.textContent = rest.name;
    body.append(title);

    const details = [];
    if (rest.rating !== null) {
      const reviewText =
        rest.review_count === null
          ? ""
          : ` (${rest.review_count} reviews)`;
      details.push(`Rating: ${rest.rating}/5${reviewText}`);
    }
    if (rest.categories.length) {
      details.push(rest.categories.join(", "));
    }
    if (rest.price) details.push(`Price: ${rest.price}`);
    if (rest.distance !== null) {
      details.push(`${(rest.distance / 1609.34).toFixed(1)} mi away`);
    }
    if (rest.is_closed !== null) {
      details.push(rest.is_closed ? "Currently closed" : "Open");
    }

    for (const detail of details) {
      const paragraph = document.createElement("p");
      paragraph.className = "card-text";
      paragraph.textContent = detail;
      body.append(paragraph);
    }

    const address = document.createElement("p");
    address.className = "card-text";
    address.textContent = rest.location.display_address.join(", ");
    body.append(address);

    if (rest.phone) {
      const phone = document.createElement("p");
      phone.className = "card-text";
      phone.textContent = rest.phone;
      body.append(phone);
    }

    const actions = document.createElement("div");
    if (rest.url) {
      const moreInfo = document.createElement("a");
      moreInfo.className = "card-btn";
      moreInfo.textContent = "More info";
      if (setExternalUrl(moreInfo, rest.url)) actions.append(moreInfo);
    }
    if (hasCoordinates) {
      const mapLink = document.createElement("a");
      mapLink.href = "#map_container";
      mapLink.className = "card-link";
      mapLink.textContent = "Map";
      actions.append(mapLink);
    }

    body.append(actions);
    cardContainer.append(body);
    results.appendChild(cardContainer);
  }

  const firstRestaurant = restaurants.find(
    (restaurant) =>
      Number.isFinite(restaurant.coordinates.latitude) &&
      Number.isFinite(restaurant.coordinates.longitude)
  );
  if (
    firstRestaurant &&
    locationCoords.lat === 0 &&
    locationCoords.lng === 0
  ) {
    locationCoords.lat = Number(
      firstRestaurant.coordinates.latitude
    );
    locationCoords.lng = Number(
      firstRestaurant.coordinates.longitude
    );
  }
  drawMap(locationCoords, restaurants);
}
//Converts miles to meters because yelp and google uses meters.
function calculateRadius(miles) {
  let meters = Math.floor(miles * 1609.34);
  if (meters > 40000) {
    meters = 40000;
  }
  return meters;
}

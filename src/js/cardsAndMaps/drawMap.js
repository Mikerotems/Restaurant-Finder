let map;

export async function drawMap({ lat, lng }) {
  // Create a new map centered on the location passed to the function
  map = new google.maps.Map(document.getElementById("map_container"), {
    zoom: 9,
    center: {
      lat: lat,
      lng: lng,
    },    
  });
  
//Marks user current location or location they entered
const coord ={lat, lng};
new google.maps.Marker({
  position: coord,
  map: map,
  icon: {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 10,
    fillOpacity: 1,
    strokeWeight: 2,
    fillColor: '#5384ED',
    strokeColor: '#ffffff',
  },
});

  const infoWindow = new google.maps.InfoWindow({
    content: "",
    disableAutoPan: true,
  });

  // Determines if there are any results and iterates through them to draw markers and labels
  if (restaurant_results.children.length > 0) {
    // Arrays of coordinates and labels to draw to send to google API
    const locations = [];
    const labels = [];

    for (const card of restaurant_results.children) {
      const loc = {
        lat: Number(card.getAttribute("lat")),
        lng: Number(card.getAttribute("lng")),
      };
      const name = card.children[1].children[0].textContent;
      const url = card.children[0].getAttribute("href");
      const address = card.children[1].children[1].textContent;
      const phone = card.children[1].children[2].textContent;

      locations.push(loc);

      labels.push(`
      <a href="${url}" target="_blank">${name}</a>
      <p>Address: ${address}</p>
      <p>Phone: ${phone}</P.
      `);
    }

    // Creates each marker and add them to a markers array
    const markers = locations.map((position, i) => {
      const label = labels[i % labels.length];
      const marker = new google.maps.Marker({ position });

      marker.addListener("click", () => {
        infoWindow.setContent(label);
        infoWindow.open(map, marker);
      });
      return marker;
    });

    new markerClusterer.MarkerClusterer({ markers, map }); // Clusters markers into 1 orb when zoomed out to reduce map clutter
  } else {
    // If no restaurants are open, it will place a marker on the passed in coordinates
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: map,
    });
  }
}

// centers the map on a location and zooms into it.
export function centerOnMarker({ lat, lng }) {
  map.panTo({ lat: lat, lng: lng });
  map.setZoom(18);
}

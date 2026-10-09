
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export function initializeMap(containerId) {
    mapboxgl.accessToken = process.env.mapboxAccessToken;
    
    return new mapboxgl.Map({
        container: containerId, 
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-74.5, 40],
        zoom: 9
    });
}

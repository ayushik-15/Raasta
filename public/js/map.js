mapboxgl.accessToken = mapToken;

// FIX: Only attempt to build the map if coordinates exist
if (listing.geometry && listing.geometry.coordinates && listing.geometry.coordinates.length) {
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v12',
        center: listing.geometry.coordinates, 
        zoom: 10 
    });

    const marker = new mapboxgl.Marker({color: "red"})
        .setLngLat(listing.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({offset: 25})
        .setHTML(`<h4>${listing.title}</h4><p>Exact Location will be provided after booking</p>`))
        .addTo(map);
}


async function loadData() {
    try {
        const response = await fetch('private/baxter-runs.json');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading data:', error.message);
    }
  }

  // Initialize Leaflet map
  var map = L.map('map').setView([42.3736, -60.1097], 3);

  // Add base tile layer
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // Initialize marker cluster group
  var markers = L.markerClusterGroup({
    maxClusterRadius: 40 // Adjust this value as needed
});


  loadData().then(data => {
      if (data && data.start_latlng) {
          for (var key in data.start_latlng) {
              if (data.start_latlng.hasOwnProperty(key)) {
                  var latLngString = data.start_latlng[key];
                  var latLngArray = JSON.parse(latLngString);
                  var lat = latLngArray[0];
                  var lng = latLngArray[1];
                  var latlng = [lat, lng];

                  var name = data.name[key];
                  var dist = parseFloat(data.distance_mi[key]).toFixed(2);
                  var vert = parseFloat(data.total_elevation_gain_ft[key]).toFixed(0);
                  var year = data.year[key];
                  var month = data.month[key];

                  // Create marker
                  var marker = L.marker(latlng)
                      .bindPopup("<b>" + name + "</b><br>Distance: " + dist + " mi" + "<br>Elevation Gain: " + vert + " ft")
                      .addTo(markers);
              }
          }
          // Add marker cluster group to map
          map.addLayer(markers);
      } else {
          console.error("Data is not properly defined or does not contain 'start_latlng' property.");
      }
    });
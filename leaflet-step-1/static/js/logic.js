// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  console.log("data", data)
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log("data.features",data.features)
});

function selectColor(mag) {
  switch(true){
    case (mag < 1):
      bubbleColor = "#a1e8af"
      break;
    case (mag <2):
      bubbleColor = "#94c595"
      break;
    case (mag < 3):
      bubbleColor = "#747c92"
      break;
    case (mag < 3.5):
      bubbleColor = "#372772"
      break;
    case (mag < 4):
      bubbleColor = "#3a2449"
      break;
      case (mag < 5):
        bubbleColor = "#f19c79"
        break;
    default:
      bubbleColor = "#a44a3f"
  }
  return (bubbleColor)
}

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
console.log("feature", feature)
console.log("layer", layer)
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) +
      "</p><p>Magnitude:" + feature.properties.mag);
  }
    console.log(onEachFeature)
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      var geojsonMarkerOptions = {
        radius: feature.properties.mag*5,
        fillColor: selectColor(feature.properties.mag),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });


console.log("earthquakes",earthquakes)
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

// Define variables for our base layers
var streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: 'mapbox/streets-v11',
  accessToken: API_KEY
  })

var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: 'mapbox/dark-v10',
  accessToken: API_KEY
  })

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = earthquakes.options.limits;
    var colors = earthquakes.options.colors;
    var labels = [];

    // Add min & max
    var legendInfo = "<h1>Median Income</h1>" +
      "<div class=\"labels\">" +
        "<div class=\"min\">"  + "</div>" +
        "<div class=\"max\">"  + "</div>" +
      "</div>";

    div.innerHTML = legendInfo;

    // limits.forEach(function(limit, index) {
    //   labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
    // });

    // div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };


  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });
legend.addTo(myMap)

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

    // Set up the legend

  

  
}






// // Loop through the cities array and create one marker for each city object
// for (var i = 0; i < cities.length; i++) {
//   L.circle(cities[i].location, {
//     fillOpacity: 0.75,
//     color: "white",
//     fillColor: "purple",
//     // Setting our circle's radius equal to the output of our markerSize function
//     // This will make our marker's size proportionate to its population
//     radius: markerSize(cities[i].population)
//   }).bindPopup("<h1>" + cities[i].name + "</h1> <hr> <h3>Population: " + cities[i].population + "</h3>").addTo(myMap);
// }

// Store our API endpoint inside queryUrl
var queryUrl = ["https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
  "./static/GeoJSON/PB2002_boundaries.json",
  "./static/GeoJSON/PB2002_orogens.json",
  "./static/GeoJSON/PB2002_plates.json"]

// Define variables for our base layers
var streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: 'mapbox/streets-v11',
  accessToken: "sk.eyJ1IjoidGhlYWRkaWVzIiwiYSI6ImNrZWMycXAyZTAzMnMyc2s5b3JjY21yZW8ifQ.9kBPjqmg89i-61swV4I-Kw"
})

var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: 'mapbox/dark-v10',
  accessToken: API_KEY
})

var satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: 'mapbox/satellite-streets-v11',
  accessToken: API_KEY
})

// Create our map, giving it the streetmap and earthquakes layers to display on load
var myMap = L.map("map", {
  center: [
    37.09, -95.71
  ],
  zoom: 5,
  layers: [streetmap]
});

// Create a base layer that holds all three maps.
let baseMaps = {
  "Streets": streetmap,
  "Dark Map": darkmap,
  "Satellite": satelliteStreets
};

// Create the layers for our two different sets of data, earthquakes and tectonicplates.
let earthquakesLayer = new L.LayerGroup();
let boundaryLayer = new L.LayerGroup();
let orogensLayer = new L.LayerGroup();
let platesLayer = new L.LayerGroup();

// let tectonicplates = new L.LayerGroup();

// We define an object contains all of our overlays.
// This overlay will be visible all the time.
let overlayMaps = {

  "Earthquakes": earthquakesLayer,
  "Boundaries": boundaryLayer,
  "Orogens": orogensLayer,
  "Plates": platesLayer
};

// Then we add a control to the map that will allow the user to change which
// layers are visible.
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

var colors = ["#a1e8af", "#94c595", "#747c92", "#372772", "#3a2449", "#f19c79",
  "#a44a3f"]

var quakeDivision = [1, 2, 3, 3.5, 4, 5, 6];

var quakeLabels = ["0 - 1", "1 - 2", "2 - 3", "3 - 4", "4 - 5", "5 - 6", ">6"]

function selectColor(mag) {
  switch (true) {
    case (mag < 1):
      bubbleColor = colors[0]
      break;
    case (mag < 2):
      bubbleColor = colors[1]
      break;
    case (mag < 3):
      bubbleColor = colors[2]
      break;
    case (mag < 3.5):
      bubbleColor = colors[3]
      break;
    case (mag < 4):
      bubbleColor = colors[4]
      break;
    case (mag < 5):
      bubbleColor = colors[5]
      break;
    default:
      bubbleColor = colors[6]
  }
  return (bubbleColor)
}

// Define a function we want to run once for each feature in the features array
// Give each feature a popup describing the place and time of the earthquake
function onEachFeature(feature, layer) {
  console.log("feature", feature)
  console.log("layer", layer)
  layer.bindPopup("<h3>Magnitude:" + feature.properties.mag +
    "</h3><hr><p>When: " + new Date(feature.properties.time) +
    "</p><p>Location: " + feature.properties.place + "</p>");
}

// Define a function we want to run once for each feature in the features array
// Give each feature a popup describing the place and time of the earthquake
function onEachFeatureB(feature, layer) {
  console.log("feature", feature)
  console.log("layer", layer)
  layer.bindPopup("<h3>Magnitude:"  +
    "</h3><hr><p></p>");
}

var dataNames = ['earthquake', 'boundaries', 'orogen', 'plate Name', 'steps']

// Perform a GET request to the query URL
var firstQuery = d3.json(queryUrl[0], function (earthquakeData) {
  // Once we get a response, send the data.features object to the createFeatures function


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      var geojsonMarkerOptions = {
        radius: feature.properties.mag * 5,
        fillColor: selectColor(feature.properties.mag),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  })

    // Sending our earthquakes layer to the createMap function
    .addTo(earthquakesLayer);
  earthquakesLayer.addTo(myMap);

  // Set up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");

    //    var colors = earthquakes.options.colors;
    var labels = [];

    // Add min & max
    var legendInfo = "<h1>Magnitude</h1>";

    div.innerHTML = legendInfo;
    colors.forEach(function (d, index) {
      //     labels.push("<p><li style=\"background-color: " + colors[index] + "\"></li>" + quakeLabels[index] +"</p>");
      labels.push("<li style=\"background-color:" + colors[index] + "\"></li><span>"
        + quakeLabels[index] + "</span><br>")
    });

// 

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };
  legend.addTo(myMap)
});

firstQuery = d3.json(queryUrl[1], function (boundaryData) {
  // Once we get a response, send the data.features object to the createFeatures function
  console.log("boundaryData", boundaryData)
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>Plate Name:" + feature.properties.Name +
      "</h3>");
  }
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  L.geoJSON(boundaryData, {
    onEachFeature: onEachFeature
  })

    // Sending our boundary layer to the createMap function
    .addTo(boundaryLayer);

});

firstQuery = d3.json(queryUrl[2], function (orogensData) {
  // Once we get a response, send the data.features object to the createFeatures function

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>Orogen Name:" + feature.properties.Name +
      "</h3>");
  }
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  L.geoJSON(orogensData, {
    onEachFeature: onEachFeature
  })

    // Sending our orogens layer to the createMap function
    .addTo(orogensLayer);

});

firstQuery = d3.json(queryUrl[3], function (platesData) {
  // Once we get a response, send the data.features object to the createFeatures function

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>Plate Code:" + feature.properties.Code +
      "</h3><h3>Plate Name:" + feature.properties.PlateName +
      "</h3>");
  }
  console.log(onEachFeature)
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  L.geoJSON(platesData, {
    onEachFeature: onEachFeature
  })

    // Sending our plates layer to the createMap function
    .addTo(platesLayer);

});

// Create a layer control
// Pass in our baseMaps and overlayMaps
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);
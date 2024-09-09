import { allPoints } from "./data.js";
require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/symbols/PictureMarkerSymbol",
  "esri/geometry/Point",
], function (Map, MapView, Graphic, PictureMarkerSymbol, Point) {
  // Create a map instance
  let map = new Map({
    basemap: "streets-vector",
  });
  // Create a MapView instance
  let view = new MapView({
    container: "viewDiv",
    map: map,
    center: [100.6146536, 15.7298565], // Default center
    zoom: 5,
  });
  console.log(allPoints);
  // Define an array of points
  let points = [
    { longitude: 108.276449, latitude: 14.5790722, name: "Marker 1" },
    { longitude: -118.71512, latitude: 34.091, name: "Marker 2" },
    { longitude: -118.7145, latitude: 34.0895, name: "Marker 3" },
    { longitude: -118.716, latitude: 34.09, name: "Marker 4" },
    { longitude: -118.7158, latitude: 34.092, name: "Marker 5" },
  ];

  // Create a PictureMarkerSymbol using a custom image URL
  let pictureMarkerSymbol = new PictureMarkerSymbol({
    url: "https://cdn4.iconfinder.com/data/icons/liny/24/map-marker-line-512.png", // Replace with your image URL
    width: "32px",
    height: "32px",
  });

  // Create graphics for each point and add to the view
  points.forEach(function (pointCoords) {
    let point = new Point({
      longitude: pointCoords.longitude,
      latitude: pointCoords.latitude,
    });

    let pointGraphic = new Graphic({
      geometry: point,
      symbol: pictureMarkerSymbol,
      attributes: { name: pointCoords.name },
    });

    view.graphics.add(pointGraphic);
  });

  // Add a click event listener to the view
  view.on("click", function (event) {
    view.hitTest(event).then(function (response) {
      var results = response.results;
      if (results.length > 0) {
        var graphic = results[0].graphic;
        if (graphic.symbol === pictureMarkerSymbol) {
          // Retrieve attribute data
          var name = graphic.attributes.name;
          // Update the view or show an alert
          alert("Marker clicked: " + name);
          // Optionally, update the center or zoom level
          view.center = graphic.geometry;
          view.zoom = 14;
        }
      }
    });
  });

  // Handle dropdown change event
  document
    .getElementById("locationDropdown")
    .addEventListener("change", function (event) {
      let selectedValue = event.target.value;
      let [longitude, latitude] = selectedValue.split(",").map(Number);

      // Update view center and zoom level
      view.center = [longitude, latitude];
      view.zoom = 14; // Adjust zoom level as needed
    });

});

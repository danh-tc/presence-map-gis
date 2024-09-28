import { locators } from "./locators.js";
require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/symbols/PictureMarkerSymbol",
  "esri/geometry/Point",
], function (Map, MapView, Graphic, PictureMarkerSymbol, Point) {
  // Cache selectors
  const mapEl = document.querySelector(".cmp-map");
  const backButtonEl = mapEl.querySelector(".cmp-map__back-button");
  const mainPanelEl = mapEl.querySelector(".cmp-map__main-panel");
  const propEl = mapEl.querySelector(".cmp-map__property-info");
  const propTitle = propEl.querySelector(".cmp-map__property-info__title");
  const propImg = propEl.querySelector(".cmp-map__property-info__img");
  const propStatus = propEl.querySelector(".cmp-map__property-info__status");
  const propLocation = propEl.querySelector(
    ".cmp-map__property-info__lcoation"
  );
  const propNavigate = propEl.querySelector(
    ".cmp-map__property-info__navigate a"
  );
  const propCharging = propEl.querySelector(
    ".cmp-map__property-info__charging-type ul"
  );
  const propMore = propEl.querySelector(".cmp-map__property-info__more ul");
  const propHotline = propEl.querySelector(
    ".cmp-map__property-info__hottline__num"
  );
  const districtSelectedEl = mapEl.querySelector(
    "#district-dropdown .selected-value"
  );
  // Create a map instance
  let map = new Map({
    basemap: "streets-navigation-vector",
  });
  // Create a MapView instance
  let view = new MapView({
    container: "viewDiv",
    map: map,
    center: [100.6146536, 15.7298565], // Default center
    zoom: 5,
  });
  // Get all points from data to init map
  const points = locators.data.map((locator) => {
    return {
      longitude: locator.lng,
      latitude: locator.lat,
      name: locator.name,
      obj: locator,
    };
  });

  // Create a PictureMarkerSymbol using a custom image URL
  let pictureMarkerSymbol = new PictureMarkerSymbol({
    url: "https://cdn-icons-png.flaticon.com/512/8567/8567636.png", // Replace with your image URL
    width: "20px",
    height: "20px",
  });

  // Create graphics for each point and add to the view
  // points.forEach(function (pointCoords) {
  //   let point = new Point({
  //     longitude: pointCoords.longitude,
  //     latitude: pointCoords.latitude,
  //   });

  //   let pointGraphic = new Graphic({
  //     geometry: point,
  //     symbol: pictureMarkerSymbol,
  //     attributes: { name: pointCoords.name, obj: pointCoords.obj },
  //   });

  //   view.graphics.add(pointGraphic);
  // });
  renderMarkers(points);
  function renderMarkers(points) {
    points.forEach(function (pointCoords) {
      let point = new Point({
        longitude: pointCoords.longitude,
        latitude: pointCoords.latitude,
      });

      let pointGraphic = new Graphic({
        geometry: point,
        symbol: pictureMarkerSymbol,
        attributes: { name: pointCoords.name, obj: pointCoords.obj },
      });

      view.graphics.add(pointGraphic);
    });
  }

  function removeAllMarkers() {
    view.graphics.removeAll();
  }

  // Add a click event listener to the view
  view.on("click", function (event) {
    view.hitTest(event).then(function (response) {
      let results = response.results;
      if (results.length > 0) {
        let graphic = results[0].graphic;
        if (graphic.symbol === pictureMarkerSymbol) {
          // Retrieve attribute data
          let name = graphic.attributes.name;
          // Update the view or show an alert
          console.log("Marker clicked: " + name);
          propEl.classList.toggle("cmp-map__property-info--hidden");
          mainPanelEl.classList.toggle("cmp-map__main-panel--hidden");
          const obj = graphic.attributes.obj;
          debugger;
          if (obj) {
            propTitle.innerHTML = obj.name;
            propLocation.innerHTML = obj.address;
            propNavigate.href = obj.get_direction;
            propStatus.innerHTML = obj.status;
            propImg.src = obj.image_uri;
            let typeOfCharging = "";
          }
          // Optionally, update the center or zoom level
          let [longitude, latitude] = [obj.lng, obj.lat];
          debugger;
          updateViewCenterAndZoomLevel([longitude, latitude], 18);
        }
      }
    });
  });

  // Handle dropdown change events
  const provinceDropdown = document
    .getElementById("province-dropdown")
    ?.querySelectorAll("a");
  function handleDropdownOnchange(event) {
    let selectedValue = event.target.getAttribute("data-value");
    if (selectedValue) {
      let [longitude, latitude] = selectedValue.split(",").map(Number);
      // Rerender points
      const points = locators.data
        .filter(
          (locator) => locator.province_id == event.target.dataset.province
        )
        .map((locator) => {
          return {
            longitude: locator.lng,
            latitude: locator.lat,
            name: locator.name,
            obj: locator,
          };
        });
      removeAllMarkers();
      renderMarkers(points);
      updateViewCenterAndZoomLevel([longitude, latitude], 10);
    }
    // Show information on left side panel
  }

  provinceDropdown.forEach((option) => {
    option.addEventListener("click", handleDropdownOnchange);
  });

  backButtonEl.addEventListener("click", () => {
    propEl.classList.toggle("cmp-map__property-info--hidden");
    mainPanelEl.classList.toggle("cmp-map__main-panel--hidden");
  });

  districtSelectedEl.addEventListener("districtOnChange", function (event) {
    let selectedDistrict = event.detail.selectedDistrict;
    // Rerender points
    const points = locators.data
      .filter((locator) => locator.district_id == selectedDistrict)
      .map((locator) => {
        return {
          longitude: locator.lng,
          latitude: locator.lat,
          name: locator.name,
          obj: locator,
        };
      });
    removeAllMarkers();
    renderMarkers(points);
    // Zoom to the selected district
    // Get lon lat
    let [longitude, latitude] = [points[0].obj.lng, points[0].obj.lat];
    updateViewCenterAndZoomLevel([longitude, latitude], 13);
  });

  function updateViewCenterAndZoomLevel(lonlat, zoom) {
    view.center = lonlat;
    view.zoom = zoom;
  }
});

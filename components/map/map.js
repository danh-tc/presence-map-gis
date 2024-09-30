import { locators } from "./locators.js";
import { polygonData } from "./data.js";
require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/symbols/PictureMarkerSymbol",
  "esri/geometry/Point",
  "esri/layers/GraphicsLayer",
  "esri/geometry/Polygon",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/PopupTemplate",
], function (
  Map,
  MapView,
  Graphic,
  PictureMarkerSymbol,
  Point,
  GraphicsLayer,
  Polygon,
  SimpleFillSymbol,
  SimpleLineSymbol,
  PopupTemplate
) {
  // Cache selectors
  const mapEl = document.querySelector(".cmp-map");
  const resetButtonEl = mapEl.querySelector("#reset-button");
  const backButtonEl = mapEl.querySelector(".cmp-map__back-button");
  const mainPanelEl = mapEl.querySelector(".cmp-map__main-panel");
  const propEl = mapEl.querySelector(".cmp-map__property-info");
  const propTitle = propEl.querySelector(".cmp-map__property-info__title");
  const propImg = propEl.querySelector(".cmp-map__property-info__img");
  const propStatus = propEl.querySelector(".cmp-map__property-info__status");
  const propLocation = propEl.querySelector(
    ".cmp-map__property-info__location"
  );
  const propNavigate = propEl.querySelector(
    ".cmp-map__property-info__navigate a"
  );
  const propHotline = propEl.querySelector(
    ".cmp-map__property-info__hottline__num"
  );
  const nationalNumber = mapEl.querySelector(".cmp-map__info__national-number");
  const provincialNumber = mapEl.querySelector(
    ".cmp-map__info__provincial-number"
  );
  const districtinglNumber = mapEl.querySelector(
    ".cmp-map__info__districting-number"
  );
  const provinceDropdownEl = mapEl.querySelector("#province-dropdown");
  const districtSelectedEl = mapEl.querySelector(
    "#district-dropdown .selected-value"
  );
  const provinceSelectedEl = mapEl.querySelector(
    "#province-dropdown .selected-value"
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
  // Create a GraphicsLayer to hold the polygon
  let graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  // Get all points from data to init map
  const points = locators.data.map((locator) => {
    return {
      longitude: locator.lng,
      latitude: locator.lat,
      name: locator.name,
      obj: locator,
    };
  });
  // Update total numbers
  nationalNumber.innerHTML = `<span class="special-number">${points.length}</span>
                              <div>trạm sạc trên toàn quốc</div>`;

  // Create a PictureMarkerSymbol using a custom image URL
  let pictureMarkerSymbol = new PictureMarkerSymbol({
    url: "https://cdn-icons-png.flaticon.com/512/8567/8567636.png", // Replace with your image URL
    width: "20px",
    height: "20px",
  });

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
          if (obj) {
            propTitle.innerHTML = obj.name;
            propLocation.innerHTML = obj.address;
            propNavigate.href = obj.get_direction;
            propStatus.innerHTML =
              obj.status == 1 ? "Đang hoạt động" : "Tạm đóng cửa";
            propHotline.innerHTML = obj.hotline;
            // propImg.src = obj.image_uri;
            const uniqueParam = new Date().getTime();
            propImg.src = `https://picsum.photos/300/400?random=${uniqueParam}`;
          }
          // Optionally, update the center or zoom level
          let [longitude, latitude] = [obj.lng, obj.lat];
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
    // Update info
    const numOfChargingStation = locators.data.filter(
      (locator) => locator.province_id == event.target.dataset.province
    ).length;
    provincialNumber.innerHTML = `<span class="special-number">${numOfChargingStation}</span>
                              <div>trạm sạc tại ${event.target.innerHTML}</div>`;
    provincialNumber.classList.remove("hidden");
    if (!nationalNumber.classList.contains("hidden")) {
      nationalNumber.classList.add("hidden");
    }
    if (!districtinglNumber.classList.contains("hidden")) {
      districtinglNumber.classList.add("hidden");
    }
  }

  provinceDropdown.forEach((option) => {
    option.addEventListener("click", handleDropdownOnchange);
  });

  backButtonEl.addEventListener("click", () => {
    propEl.classList.toggle("cmp-map__property-info--hidden");
    mainPanelEl.classList.toggle("cmp-map__main-panel--hidden");
    let selectedDistrict = districtSelectedEl.dataset.district;
    let selectedProvince = provinceSelectedEl.dataset.province;
    if (selectedDistrict) {
      // show markers
      // zoom to district
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
      let [longitude, latitude] = [points[0].obj.lng, points[0].obj.lat];
      updateViewCenterAndZoomLevel([longitude, latitude], 13);
    } else if (selectedProvince) {
      const points = locators.data
        .filter((locator) => locator.province_id == selectedProvince)
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
      const options = provinceDropdownEl.querySelectorAll(
        ".dropdown-options a"
      );
      options.forEach((opt) => {
        if (opt.dataset.province === selectedProvince) {
          let [longitude, latitude] = opt.dataset.value.split(",").map(Number);
          updateViewCenterAndZoomLevel([longitude, latitude], 10);
        }
      });
    } else {
      updateViewCenterAndZoomLevel([100.6146536, 15.7298565], 5);
    }
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
    let [longitude, latitude] = [points[0].obj.lng, points[0].obj.lat];
    updateViewCenterAndZoomLevel([longitude, latitude], 13);
    // Update info
    // Get current province
    let selectedProvinceLabel = provinceSelectedEl.dataset.provincelabel;
    let selectedDistrictLabel = event.detail.selectedDistrictText;
    const numOfChargingStation = locators.data.filter(
      (locator) => locator.district_id == event.target.dataset.district
    ).length;
    districtinglNumber.innerHTML = `<span class="special-number">${numOfChargingStation}</span>
                              <div>trạm sạc tại ${selectedDistrictLabel}, ${selectedProvinceLabel}</div>`;
    if (!nationalNumber.classList.contains("hidden")) {
      nationalNumber.classList.add("hidden");
    }
    if (!provincialNumber.classList.contains("hidden")) {
      provincialNumber.classList.add("hidden");
    }
    if (districtinglNumber.classList.contains("hidden")) {
      districtinglNumber.classList.remove("hidden");
    }
  });

  resetButtonEl.addEventListener("click", function () {
    window.location.reload();
  });

  function updateViewCenterAndZoomLevel(lonlat, zoom) {
    view.center = lonlat;
    view.zoom = zoom;
  }

  // polygonData.forEach((polygon) => {
  //   let { polygonCoords, color, backgroundColor, template } = polygon;
  //   renderPolygon(polygonCoords, color, backgroundColor, template);
  // });

  // Add an event listener to show the popup on hover
  view.on("pointer-move", function (event) {
    view.hitTest(event).then(function (response) {
      var graphic = response.results.filter(function (result) {
        return result.graphic.layer === graphicsLayer;
      })[0]?.graphic;

      if (graphic) {
        // Show the popup at the mouse location
        view.popup.open({
          location: event.mapPoint,
          features: [graphic],
        });
      } else {
        // Close the popup if no graphic is hovered
        view.popup.close();
      }
    });
  });

  function renderPolygon(
    polygonCoords,
    outlineColor,
    backgroundColor,
    template
  ) {
    // Create the polygon geometry
    let polygon = new Polygon({
      rings: polygonCoords,
      spatialReference: { wkid: 4326 }, // WGS84
    });

    // Define the symbol for the polygon (persistent background color)
    let polygonSymbol = new SimpleFillSymbol({
      color: backgroundColor, // Green fill with transparency
      outline: {
        color: outlineColor, // Green outline
        width: 2,
      },
    });

    // Define the popup template with image and other content
    let popupTemplate = new PopupTemplate(template);

    // Create a graphic for the polygon
    let polygonGraphic = new Graphic({
      geometry: polygon,
      symbol: polygonSymbol,
      attributes: {
        rings: polygonCoords,
      },
      popupTemplate: popupTemplate,
    });

    // Add the polygon graphic to the graphics layer
    graphicsLayer.add(polygonGraphic);
  }
});

/* global L */
var names = ["ST. JOHNS","KENTON"];  //name of neighborhood
var incs = [10,20];            //mean hosuehold income

var nbhds = [];
var zoominit = 10;  //0-22

class Neighborhood{
  constructor(name, inc){
    this.name = name;
    this.inc = inc;
  }
}

function addN(){
  for (let i=0;i<names.length;i++){
    nbhds[i] = new Neighborhood(names[i],incs[i]);
  }
}
addN();

// MAP SETUP
let map = L.map("mapid", {
  center: [45.55, -122.65], // latitude, longitude in decimal degrees
  //center: [43.6, -116.22], // boise o.0
  zoom: zoominit, // can be 0-22, higher is closer
  scrollWheelZoom: false // don't zoom the map on scroll
});

// add the basemap tiles
L.tileLayer(
 // "https://www.google.com/maps/@37.9979916,-121.3202432,14z@2x.png"
  "https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}@2x.png" // stamen toner tiles
/*O.o how does @2x.png actually work?? guessing it creates a png file??
*/
).addTo(map);

//EVENT HANDLERS

let geojson; // this is global because of resetHighlight

// change color when hovered on
function highlightFeature(e) {
  let layer = e.target; // highlight the actual feature that should be highlighted
  layer.setStyle({
    weight: 3, // thicker border
    color: "#000", // black
    fillOpacity: 0.3 // a bit transparent
  });
}

// reset to normal style
function resetHighlight(e) {
  geojson.resetStyle(e.target);
}

// zoom to feature (a.k.a. fit the bounds of the map to the bounds of the feature
function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

// attach the event handlers to events
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature, // a.k.a. hover
    mouseout: resetHighlight, // a.k.a. no longer hovering
    //click: zoomToFeature // a.k.a. clicking
  });
}

/* GET DATA
   Because the data is in a different file, it must be retrieved asynchronously. This ensures that all of
   the data has been loaded before trying to use it (in this case, add it to the map). Read more about Fetch:
   https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
*/

// get the data
fetch(
  "https://cdn.glitch.com/4e131691-974a-4b1f-95e5-47137b94043d%2FNeighborhood_Boundaries.geojson?1553538254953"
)
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    // this is where we do things with data
    doThingsWithData(json);
  });

// once the data is loaded, this function takes over
function doThingsWithData(json) {
  // assign colors to each "COALIT" (a.k.a. neighborhood coalition)
  let colorObj = assignColors(json, "COALIT");
  
  
  
  // add the data to the map
  geojson = L.geoJSON(json, {
    
    // both `style` and `onEachFeature` want a function as a value
    // the function for `style` is defined inline (a.k.a. an "anonymous function")
    // the function for `onEachFeature` is defined earlier in the file
    // so we just set the value to the function name
    style: function(feature) {
      
      return {
        color: colorObj[feature.properties.COALIT], // set color based on colorObj
        weight: 1.7, // thickness of the border
        fillOpacity: 0.2 // opacity of the fill
      };
    },
    onEachFeature: onEachFeature // call onEachFeature
  })
    .bindPopup(function(layer) {
    let Name = layer.feature.properties.NAME; // use the NAME property as the popup value
    let k;
    let num = 0;
    for (let i=0;i<nbhds.length;i++){
      if (nbhds[i].name==Name){
        k=i;
        num=nbhds[k].inc; 
      }
    }
    return Name + " mean income: "+num.toString()
    })
    .addTo(map); // add it to the map
}

// create an object where each unique value in prop is a key and
// each key has a color as its value
function assignColors(json, prop) {
  // from ColorBrewer http://colorbrewer2.org
  let colors = [
    "#a6cee3",
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
    "#fdbf6f",
    "#ff7f00",
    "#cab2d6",
    "#6a3d9a",
    "#ffff99",
    "#b15928"
  ];
  let uniquePropValues = []; // create an empty array to hold the unique values
  json.features.forEach(feature => { // for each feature
    if (uniquePropValues.indexOf(feature.properties[prop]) === -1) { 
      uniquePropValues.push(feature.properties[prop]); // if the value isn't already in the list, add it
    }
  });
  let colorObj = {}; // create an empty object
  uniquePropValues.forEach((prop, index) => { // for each unique value
    colorObj[prop] = colors[index]; // add a new key-value pair to colorObj
  });
  return colorObj;
}

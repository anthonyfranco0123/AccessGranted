let defaultRowCount = 15; // No of rows
let defaultColCount = 12; // No of cols
const SPREADSHEET_DB = "spreadsheet_db";
let names=["ST. JOHN"];
let incs=[];



initializeData = () => {
  // console.log("initializeData");
  const data = [];
  for (let i = 0; i <= defaultRowCount; i++) {
    const child = [];
    for (let j = 0; j <= defaultColCount; j++) {
      child.push("");
    }
    data.push(child);
  }
  return data;
};

getData = () => {
  let data = localStorage.getItem(SPREADSHEET_DB);
  if (data === undefined || data === null) {
    return initializeData();
  }
  return JSON.parse(data);
};

saveData = data => {
  localStorage.setItem(SPREADSHEET_DB, JSON.stringify(data));
};

resetData = data => {
  localStorage.removeItem(SPREADSHEET_DB);
  this.createSpreadsheet();
};

createHeaderRow = () => {
  const tr = document.createElement("tr");
  tr.setAttribute("id", "h-0");
  for (let i = 0; i <= defaultColCount; i++) {
    const th = document.createElement("th");
    th.setAttribute("id", `h-0-${i}`);
    th.setAttribute("class", `${i === 0 ? "" : "column-header"}`);
    // th.innerHTML = i === 0 ? `` : `Col ${i}`;
    if (i !== 0) {
      const span = document.createElement("span");
      span.innerHTML = `Bus Stop ${i}`;
      span.setAttribute("class", "column-header-span");
      const dropDownDiv = document.createElement("div");
      dropDownDiv.setAttribute("class", "dropdown");
      dropDownDiv.innerHTML = `<button class="dropbtn" id="col-dropbtn-${i}">+</button>
        <div id="col-dropdown-${i}" class="dropdown-content">
          <p class="col-insert-left">Insert 1 column left</p>
          <p class="col-insert-right">Insert 1 column right</p>
          <p class="col-delete">Delete column</p>
        </div>`;
      th.appendChild(span);
      th.appendChild(dropDownDiv);
    }
    tr.appendChild(th);
  }
  return tr;
};

createTableBodyRow = rowNum => {
  const tr = document.createElement("tr");
  tr.setAttribute("id", `r-${rowNum}`);
  for (let i = 0; i <= defaultColCount; i++) {
    const cell = document.createElement(`${i === 0 ? "th" : "td"}`);
    if (i === 0) {
      cell.contentEditable = false;
      const span = document.createElement("span");
      const dropDownDiv = document.createElement("div");
      span.innerHTML = rowNum;
      dropDownDiv.setAttribute("class", "dropdown");
      dropDownDiv.innerHTML = `<button class="dropbtn" id="row-dropbtn-${rowNum}">+</button>
        <div id="row-dropdown-${rowNum}" class="dropdown-content">
          <p class="row-insert-top">Insert 1 row above</p>
          <p class="row-insert-bottom">Insert 1 row below</p>
          <p class="row-delete">Delete row</p>
        </div>`;
      cell.appendChild(span);
      cell.appendChild(dropDownDiv);
      cell.setAttribute("class", "row-header");
    } else {
      cell.contentEditable = true;
    }
    cell.setAttribute("id", `r-${rowNum}-${i}`);
    // cell.id = `${rowNum}-${i}`;
    tr.appendChild(cell);
  }
  return tr;
};

createTableBody = tableBody => {
  for (let rowNum = 1; rowNum <= defaultRowCount; rowNum++) {
    tableBody.appendChild(this.createTableBodyRow(rowNum));
  }
};

// Fill Data in created table from localstorage
populateTable = () => {
  const data = this.getData();
  if (data === undefined || data === null) return;

  for (let i = 1; i < data.length; i++) {
    for (let j = 1; j < data[i].length; j++) {
      const cell = document.getElementById(`r-${i}-${j}`);
      cell.innerHTML = data[i][j];
      if(j==1){
        names[i]=cell.innerHTML;
      }
      if(j==2){
        incs[i]=cell.innerHTML;
      }
    }
      document.write("<h1>0</h1>");
    
  }
};

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



// Utility function to add row
addRow = (currentRow, direction) => {
  let data = this.getData();
  const colCount = data[0].length;
  const newRow = new Array(colCount).fill("");
  if (direction === "top") {
    data.splice(currentRow, 0, newRow);
  } else if (direction === "bottom") {
    data.splice(currentRow + 1, 0, newRow);
  }
  defaultRowCount++;
  saveData(data);
  this.createSpreadsheet();
};

// Utility function to delete row
deleteRow = currentRow => {
  let data = this.getData();
  data.splice(currentRow, 1);
  defaultRowCount++;
  saveData(data);
  this.createSpreadsheet();
};

// Utility function to add columns
addColumn = (currentCol, direction) => {
  let data = this.getData();
  for (let i = 0; i <= defaultRowCount; i++) {
    if (direction === "left") {
      data[i].splice(currentCol, 0, "");
    } else if (direction === "right") {
      data[i].splice(currentCol + 1, 0, "");
    }
  }
  defaultColCount++;
  saveData(data);
  this.createSpreadsheet();
};

// Utility function to delete column
deleteColumn = currentCol => {
  let data = this.getData();
  for (let i = 0; i <= defaultRowCount; i++) {
    data[i].splice(currentCol, 1);
  }
  defaultColCount++;
  saveData(data);
  this.createSpreadsheet();
};

// Map for storing the sorting history of every column;
const sortingHistory = new Map();

// Utility function to sort columns
sortColumn = currentCol => {
  let spreadSheetData = this.getData();
  let data = spreadSheetData.slice(1);
  if (!data.some(a => a[currentCol] !== "")) return;
  if (sortingHistory.has(currentCol)) {
    const sortOrder = sortingHistory.get(currentCol);
    switch (sortOrder) {
      case "desc":
        data.sort(ascSort.bind(this, currentCol));
        sortingHistory.set(currentCol, "asc");
        break;
      case "asc":
        data.sort(dscSort.bind(this, currentCol));
        sortingHistory.set(currentCol, "desc");
        break;
    }
  } else {
    data.sort(ascSort.bind(this, currentCol));
    sortingHistory.set(currentCol, "asc");
  }
  data.splice(0, 0, new Array(data[0].length).fill(""));
  saveData(data);
  this.createSpreadsheet();
};

// Compare Functions for sorting - ascending
const ascSort = (currentCol, a, b) => {
  let _a = a[currentCol];
  let _b = b[currentCol];
  if (_a === "") return 1;
  if (_b === "") return -1;

  // Check for strings and numbers
  if (isNaN(_a) || isNaN(_b)) {
    _a = _a.toUpperCase();
    _b = _b.toUpperCase();
    if (_a < _b) return -1;
    if (_a > _b) return 1;
    return 0;
  }
  return _a - _b;
};

// Descending compare function
const dscSort = (currentCol, a, b) => {
  let _a = a[currentCol];
  let _b = b[currentCol];
  if (_a === "") return 1;
  if (_b === "") return -1;

  // Check for strings and numbers
  if (isNaN(_a) || isNaN(_b)) {
    _a = _a.toUpperCase();
    _b = _b.toUpperCase();
    if (_a < _b) return 1;
    if (_a > _b) return -1;
    return 0;
  }
  return _b - _a;
};

createSpreadsheet = () => {
  const spreadsheetData = this.getData();
  defaultRowCount = spreadsheetData.length - 1 || defaultRowCount;
  defaultColCount = spreadsheetData[0].length - 1 || defaultColCount;

  const tableHeaderElement = document.getElementById("table-headers");
  const tableBodyElement = document.getElementById("table-body");

  const tableBody = tableBodyElement.cloneNode(true);
  tableBodyElement.parentNode.replaceChild(tableBody, tableBodyElement);
  const tableHeaders = tableHeaderElement.cloneNode(true);
  tableHeaderElement.parentNode.replaceChild(tableHeaders, tableHeaderElement);

  tableHeaders.innerHTML = "";
  tableBody.innerHTML = "";

  tableHeaders.appendChild(createHeaderRow(defaultColCount));
  createTableBody(tableBody, defaultRowCount, defaultColCount);

  populateTable();
  

  // attach focusout event listener to whole table body container
  tableBody.addEventListener("focusout", function(e) {
    if (e.target && e.target.nodeName === "TD") {
      let item = e.target;
      const indices = item.id.split("-");
      let spreadsheetData = getData();
      spreadsheetData[indices[1]][indices[2]] = item.innerHTML;
      saveData(spreadsheetData);
    }
  });

  // Attach click event listener to table body
  tableBody.addEventListener("click", function(e) {
    if (e.target) {
      if (e.target.className === "dropbtn") {
        const idArr = e.target.id.split("-");
        document
          .getElementById(`row-dropdown-${idArr[2]}`)
          .classList.toggle("show");
      }
      if (e.target.className === "row-insert-top") {
        const indices = e.target.parentNode.id.split("-");
        addRow(parseInt(indices[2]), "top");
      }
      if (e.target.className === "row-insert-bottom") {
        const indices = e.target.parentNode.id.split("-");
        addRow(parseInt(indices[2]), "bottom");
      }
      if (e.target.className === "row-delete") {
        const indices = e.target.parentNode.id.split("-");
        deleteRow(parseInt(indices[2]));
      }
    }
  });

  // Attach click event listener to table headers
  tableHeaders.addEventListener("click", function(e) {
    if (e.target) {
      if (e.target.className === "column-header-span") {
        sortColumn(parseInt(e.target.parentNode.id.split("-")[2]));
      }
      if (e.target.className === "dropbtn") {
        const idArr = e.target.id.split("-");
        document
          .getElementById(`col-dropdown-${idArr[2]}`)
          .classList.toggle("show");
      }
      if (e.target.className === "col-insert-left") {
        const indices = e.target.parentNode.id.split("-");
        addColumn(parseInt(indices[2]), "left");
      }
      if (e.target.className === "col-insert-right") {
        const indices = e.target.parentNode.id.split("-");
        addColumn(parseInt(indices[2]), "right");
      }
      if (e.target.className === "col-delete") {
        const indices = e.target.parentNode.id.split("-");
        deleteColumn(parseInt(indices[2]));
      }
    }
  });
};

createSpreadsheet();

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches(".dropbtn")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

document.getElementById("reset").addEventListener("click", e => {
  if (
    confirm("This will erase all data and set default configs. Are you sure?")
  ) {
    this.resetData();
  }
});

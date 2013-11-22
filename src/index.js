var L = require('leaflet'),
    map = L.map('map', { attributionControl: false }),
    Repository = require('./repository'),
    Sidebar = require('./sidebar.js'),
    Projections = require('./projections'),
    CoordDisplay = require('./coordinates'),
    projs = new Projections(),
    repo = new Repository(projs),
    coordDisplay = new CoordDisplay('coordinates', projs);
    geomLayer = L.geoJson();

new Sidebar(repo);

repo.on('added', function(e) {
  geomLayer.addData(e.geojson);
});

map.on('click', function(e) {
  coordDisplay.show(e.latlng);
});

L.tileLayer('https://a.tiles.mapbox.com/v3/liedman.map-mmgw7jk5/{z}/{x}/{y}.png', {
    attribution: 'Maps by <a href="https://www.mapbox.com/about/maps/">MapBox</a>'
}).addTo(map);

L.control.attribution({ position: 'bottomleft' }).addTo(map);

geomLayer.addTo(map);
map.setView([0, 0], 2);


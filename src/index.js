var L = require('leaflet'),
    Repository = require('./repository'),
    Sidebar = require('./sidebar.js'),
    Projections = require('./projections'),
    CoordDisplay = require('./coordinates'),
    createStyle = require('./feature-style'),
    map = L.map('map', { attributionControl: false }),
    projs = new Projections(),
    repo = new Repository(projs),
    coordDisplay = new CoordDisplay('coordinates', projs),
    geojsonLayer = {},
    geomLayer = L.geoJson(null, {
      style: createStyle,
      pointToLayer: function(feature, latlng) {
        return L.circle(latlng, 24);
      },
      onEachFeature: function(f, layer) {
        geojsonLayer[L.stamp(f)] = layer;
        require('./feature-control')(f, layer);
      }
    });

var config = window.config || {
  tiles: {
    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }
};


L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images';

new Sidebar(repo);

repo.on('added', function(e) {
  geomLayer.addData(e.geojson);
  map.fitBounds(geomLayer.getBounds(), {maxZoom: 14});
});

repo.on('removed', function(e) {
  var id = L.stamp(e.geojson);
  geomLayer.removeLayer(geojsonLayer[id]);
  delete geomLayer[id];
});

map.on('click', function(e) {
  coordDisplay.show(e.latlng);
});

L.tileLayer(config.tiles.url, {
  attribution: config.tiles.atttribution
}).addTo(map);

L.control.attribution({ position: 'bottomleft' }).addTo(map);

geomLayer.addTo(map);
map.setView([0, 0], 2);


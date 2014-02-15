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
    geomLayer = L.geoJson(null, {
      style: createStyle,
      pointToLayer: function(feature, latlng) {
        return L.circle(latlng, 24);
      },
      onEachFeature: require('./feature-control')
    });

L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images';

new Sidebar(repo);

repo.on('added', function(e) {
  geomLayer.addData(e.geojson);
  map.fitBounds(geomLayer.getBounds(), {maxZoom: 14});
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


var L = require('leaflet'),
    Repository = require('./repository'),
    Sidebar = require('./sidebar.js'),
    Projections = require('./projections'),
    CoordDisplay = require('./coordinates'),
    Map = require('./map'),
    map = new Map('map'),
    projs = new Projections(),
    repo = new Repository(projs),
    sidebar = new Sidebar(),
    coordDisplay = new CoordDisplay('coordinates', projs);

L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images';

sidebar.on('featureCreated', function(e) {
  repo.add(e.def, e.srs, e.reverse);
});
sidebar.on('featureRemoved', function(e) {
  repo.remove(e.geojson);
});
repo.on('added', function(e) {
  sidebar.addFeature(e.geojson);
  map.add(e.geojson);
});
repo.on('removed', function(e) {
  sidebar.removeFeature(e.geojson);
  map.remove(e.geojson);
});
sidebar.on('featureSelected', function(e) {
  map.highlightFeature(e.geojson);
});

map.on('click', function(e) {
  coordDisplay.show(e.latlng);
});

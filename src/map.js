var L = require('leaflet'),
    createStyle = require('./feature-style'),
    featureControl = require('./feature-control'),
    config = window.config || {
      tiles: {
        url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }
    };

module.exports = L.Class.extend({
  includes: L.Mixin.Events,

  initialize: function(id) {
    var _this = this;

    this.map = L.map(id, { attributionControl: false });
    this.geojsonLayer = {};
    this.geomLayer = L.geoJson(null, {
      style: createStyle,
      pointToLayer: function(feature, latlng) {
        return L.circle(latlng, 24);
      },
      onEachFeature: function(f, layer) {
        _this.geojsonLayer[L.stamp(f)] = layer;
        featureControl(f, layer);
      }
    });

    L.tileLayer(config.tiles.url, {
      attribution: config.tiles.atttribution
    }).addTo(this.map);

    L.control.attribution({ position: 'bottomleft' }).addTo(this.map);

    this.geomLayer.addTo(this.map);
    this.map.setView([0, 0], 2);
  },

  add: function(geojson) {
    this.geomLayer.addData(geojson);
    this.map.fitBounds(this.geomLayer.getBounds(), {maxZoom: 14});

    this.fire('added', {
      geojson: geojson,
      layer: this.geojsonLayer[L.stamp(geojson)]
    });
  },

  remove: function(geojson) {
    var id = L.stamp(geojson);
    this.geomLayer.removeLayer(this.geojsonLayer[id]);
    delete this.geomLayer[id];
  },

  highlightFeature: function(geojson) {
    var layer = this.geojsonLayer[L.stamp(geojson)];
    this.map.fitBounds(layer.getBounds(), {maxZoom: 15});
  }
});

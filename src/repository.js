var L = require('leaflet'),
    reproject = require('reproject'),
    parsers = [
      require('wellknown'),
      function geojson(gj) { return JSON.parse(gj); }
    ];

module.exports = L.Class.extend({
  includes: L.Mixin.Events,

  initialize: function(projs) {
    this.geoms = [];
    this._projs = projs;
  },

  add: function(def, srs) {
    var geojson;
    for (var i = 0; i < parsers.length && !geojson; i++) {
      geojson = parsers[i](def);
    }

    if (!geojson) {
      throw {
        messages: ['Unable to parse.']
      };
    }

    this._projs.get(srs, function(name, proj) {
      geojson = reproject.toWgs84(geojson, proj);
      this.geoms.push(geojson);

      this.fire('added', {
        geojson: geojson
      });
    }, this);

  }
});
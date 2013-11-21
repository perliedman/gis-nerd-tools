var L = require('leaflet'),
    parsers = [
      require('wellknown'),
      function geojson(gj) { return gj; }
    ];

module.exports = L.Class.extend({
  includes: L.Mixin.Events,

  initialize: function() {
    this.geoms = [];
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

    this.geoms.push(geojson);

    this.fire('added', {
      geojson: geojson
    });
  }
});
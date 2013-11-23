var L = require('leaflet'),
    reproject = require('reproject'),
    wktParser = require('wellknown'),
    geojsonhint = require('geojsonhint');

module.exports = L.Class.extend({
  includes: L.Mixin.Events,

  initialize: function(projs) {
    this.geoms = [];
    this._projs = projs;
  },

  add: function(def, srs, reverse) {
    var geojson = this._parse(def);

    if (!geojson) {
      throw {
        messages: ['Unable to parse.']
      };
    }

    this._projs.get(srs, function(name, proj) {
      if (reverse) {
        geojson = reproject.reverse(geojson);
      }

      geojson = reproject.toWgs84(geojson, proj);

      this.geoms.push(geojson);

      if (geojson.type !== 'Feature') {
        geojson = {
          type: 'Feature',
          geometry: geojson,
          properties: {}
        };
      }

      geojson.properties._gnt = {
        id: this.geoms.length - 1,
        def: def,
        srs: srs
      };

      this.fire('added', {
        geojson: geojson
      });
    }, this);
  },

  _parse: function(def) {
    var errors,
        result;
    if (def.indexOf('{') >= 0) {
      // This looks like GeoJSON
      errors = geojsonhint.hint(def);
      if (!errors || errors.length === 0) {
        return JSON.parse(def);
      } else {
        throw errors;
      }
    }

    result = wktParser(def);
    if (result) {
      return result;
    } else {
      throw [{
        message: 'Invalid WKT (and it didn\'t appear to be GeoJSON either).',
        line: 1
      }];
    }
  }
});
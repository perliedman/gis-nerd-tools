var L = require('leaflet'),
    reproject = require('reproject'),
    wktParser = require('wellknown'),
    geojsonhint = require('geojsonhint');

function parseBBox(def) {
  var parts = def.replace(/[,;:\/]/g, ' ').split(' '),
      c = parts.map(function(v) { return parseFloat(v); });

  if (parts.length >= 4) {
    return {
      type: 'Polygon',
      coordinates: [[
        [c[0], c[1]],
        [c[2], c[1]],
        [c[2], c[3]],
        [c[0], c[3]]
      ]]
    };
  }
}

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
    }

    result = parseBBox(def);
    if (result) {
      return result;
    }

    throw [{
      message: 'Sorry, couldn\'t recognize this. It doesn\'t appear to be GeoJSON, WKT or bounding box coordinates :(',
      line: 1
    }];
  }
});
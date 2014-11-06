var L = require('leaflet'),
    reproject = require('reproject'),
    wktParser = require('wellknown'),
    geojsonhint = require('geojsonhint');

function parseRawCoords(def) {
  var parts = def.
      replace(/[\n\(\)\[\]]/g, ' ').
      replace(/[,;:\/]/g, ' ').
      split(' ').
      filter(function(s) { return s !== ''; }),
      c = parts.map(function(v) { return parseFloat(v); }),
      partsAreNumbers = c.reduce(function(areNumbers, x) {
        return areNumbers && !isNaN(x) && x !== undefined && x !== null;
      }, true);

  if (partsAreNumbers) {
    if (parts.length === 4) {
      return {
        type: 'Polygon',
        coordinates: [[
          [c[0], c[1]],
          [c[2], c[1]],
          [c[2], c[3]],
          [c[0], c[3]]
        ]]
      };
    } else if (parts.length >= 2) {
      return (function(cs) {
        var r = {
            type: 'MultiPoint',
            coordinates: []
          },
          i;
        for (i = 0; i < cs.length - 1; i += 2) {
          r.coordinates.push([c[i], c[i + 1]]);
        }

        return r;
      })(parts);
    }
  }
}

module.exports = L.Class.extend({
  includes: L.Mixin.Events,

  initialize: function(projs) {
    this.geoms = {};
    this._projs = projs;
  },

  add: function(def, srs, reverse) {
    var geojson = this._parse(def),
        i;

    if (!geojson) {
      throw {
        messages: ['Unable to parse.']
      };
    }

    if (geojson.type === 'FeatureCollection') {
      for (i = 0; i < geojson.features.length; i++) {
        this._addSingle(geojson.features[i], srs, reverse, JSON.stringify(geojson.features[i]));
      }
    } else {
      this._addSingle(geojson, srs, reverse, def);
    }
  },

  remove: function(geojson) {
    var id = L.stamp(geojson);
    if (id) {
      delete this.geoms[id];
      this.fire('removed', {geojson: geojson});
    }
  },

  _addSingle: function(geojson, srs, reverse, def) {
    this._projs.get(srs, function(name, proj) {
      if (reverse) {
        geojson = reproject.reverse(geojson);
      }

      geojson = reproject.toWgs84(geojson, proj);

      if (geojson.type !== 'Feature') {
        geojson = {
          type: 'Feature',
          geometry: geojson,
          properties: {}
        };
      }

      geojson.properties._gnt = {
        def: def,
        srs: srs,
        reverse: reverse
      };

      this.geoms[L.stamp(geojson)] = geojson;

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
      errors = geojsonhint.hint(JSON.stringify(result));
      if (!errors || errors.length === 0) {
        return result;
      } else {
        throw [{
          message: 'This looks like WKT, but the parsed result was invalid. Check the WKT syntax.',
          line: 1
        }];
      }
    }

    result = parseRawCoords(def);
    if (result) {
      return result;
    }

    throw [{
      message: 'Sorry, couldn\'t recognize this. It doesn\'t appear to be GeoJSON, WKT or bounding box coordinates :(',
      line: 1
    }];
  }
});
var L = require('leaflet'),
    proj4 = require('proj4');

if (!window.Proj4js) {
  window.Proj4js = {
    defs: {}
  };
}

module.exports = L.Class.extend({
  initialize: function() {
    this.projections = {
      'EPSG:4326': proj4.WGS84
    };
  },

  get: function(name, cb, context) {
    var parts = name.split(':'),
        authority,
        code,
        proj;

    if (parts.length === 2) {
      authority = parts[0].toUpperCase();
      code = parts[1];
    } else if (parts.length === 1) {
      authority = 'EPSG';
      code = parts[0];
    } else {
      throw 'Unable to parse SRS name';
    }

    name = authority + ':' + code;
    proj = this.projections[name];

    if (!proj) {
      if (window.Proj4js.defs[name]) {
        this._store(name, cb, context);
      } else {
        this._fetch(authority, code, cb, context);
      }
    } else {
      cb.call(context || cb, name, proj);
    }
  },

  _fetch: function(authority, code, cb, context) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'http://epsg.io/' + code + '.js';
    document.getElementsByTagName('head')[0].appendChild(script);
    this._poll(authority, code, cb, context);
  },

  _poll: function(authority, code, cb, context) {
    var _this = this,
        name = authority + ':' + code;
    if (window.Proj4js.defs[name]) {
      this._store(name, cb, context);
    } else {
      setTimeout(function() {
        _this._poll(authority, code, cb, context);
      }, 100);
    }
  },

  _store: function(name, cb, context) {
    var p = proj4.Proj(window.Proj4js.defs[name]);
    this.projections[name] = p;
    cb.call(context || cb, name, p);
  }
});
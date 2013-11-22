var L = require('leaflet'),
    proj4 = require('proj4');

module.exports = L.Class.extend({
  initialize: function(el, projs) {
    this._el = el;
    this._projs = projs;
  },

  show: function(latlng) {
    var el = L.DomUtil.get(this._el),
        lnglat = [latlng.lng, latlng.lat],
        pname,
        proj,
        transform,
        c,
        li;

    el.innerHTML = '';
    for (pname in this._projs.projections) {
      proj = this._projs.projections[pname];
      transform = proj4(proj4.WGS84, proj);
      c = transform.forward(lnglat);
      c = c.map(this._formatCoordinateValue);
      li = L.DomUtil.create('li');
      li.innerHTML = '<em>' + pname + '</em>: ' + c[0] + ' ' + c[1];
      el.appendChild(li)
    }
  },

  _formatCoordinateValue: function(v) {
    return (Math.round(v * 10000) / 10000).toString();
  }
});
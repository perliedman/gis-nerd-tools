var L = require('leaflet'),
    geocoder;

require('leaflet-control-geocoder');
geocoder = L.Control.Geocoder.nominatim();

module.exports = L.Class.extend({
  includes: L.Mixin.Events,

  initialize: function() {
    this._geojsonItems = {};
    this._setupEvents();
  },

  _setupEvents: function() {
    var addBtn = L.DomUtil.get('btn-add');

    L.DomEvent.addListener(addBtn, 'click', this._addGeometry, this);
  },

  _addGeometry: function() {
    var defCtl = L.DomUtil.get('geom-def'),
        srsCtl = L.DomUtil.get('srs'),
        swapCtl = L.DomUtil.get('swap'),
        def = defCtl.value,
        srs = srsCtl.value;
    try {
      this.fire('featureCreated', {
        def: def,
        srs: srs,
        reverse: swapCtl.checked
      });
      defCtl.value = '';
      L.DomUtil.addClass(L.DomUtil.get('error-list'), 'hidden');
    } catch (e) {
      if (L.Util.isArray(e)) {
        this.showErrors(e);
      } else {
        throw e;
      }
    }
  },

  showErrors: function(errors) {
    var el = L.DomUtil.get('error-list');

    el.innerHTML = '';
    errors.forEach(function(e) {
      var li = L.DomUtil.create('li', null, el);
      li.innerHTML = e.message;
    });

    L.DomUtil.removeClass(el, 'hidden');
  },

  addFeature: function(geojson) {
    var item = L.DomUtil.create('li', '', L.DomUtil.get('items')),
        delBtn;
    item.appendChild(this._getItemDescription(geojson));
    delBtn = L.DomUtil.create('button', 'delete-btn');
    delBtn.type = 'button';
    delBtn.innerHTML = '\u2212';
    L.DomEvent.addListener(delBtn, 'click', function() {
      this.fire('featureRemoved', {geojson: geojson});
    }, this);
    L.DomEvent.addListener(item, 'click', function() {
      this.fire('featureSelected', {geojson: geojson});
    }, this);
    item.insertBefore(delBtn, item.children[0]);
    this._geojsonItems[L.stamp(geojson)] = item;
  },

  removeFeature: function(geojson) {
    var id = L.stamp(geojson);
    L.DomUtil.get('items').removeChild(this._geojsonItems[id]);
    delete this._geojsonItems[id];
  },

  _getItemDescription: function(geojson) {
    var gnt = geojson.properties._gnt,
        r = L.DomUtil.create('div', ''),
        title = L.DomUtil.create('strong', '', r),
        srsNode = L.DomUtil.create('span', '', r),
        srsDesc = ' (<a href="http://epsg.io/' + gnt.srs + '">' + gnt.srs + '</a>' +
        (gnt.reverse ? ', reversed' : '') + ')',
        def = L.DomUtil.create('div', 'def', r);

    title.innerHTML = geojson.geometry.type;
    srsNode.innerHTML = srsDesc;
    def.innerHTML = '<div class="def" title="' + gnt.def + '">' +
      gnt.def + '</div>' +
      '<div class="row"></div>';

    geocoder.reverse(this._bounds(geojson).getCenter(), 262144, function(results) {
      if (results && results.length > 0 && results[0].name) {
        title.innerHTML = geojson.geometry.type + ' near ' + results[0].name.split(',')[0].trim();
      }
    });

    return r;
  },

  _bounds: function (geojson) {
    function isXY(list) {
      return list.length === 2 &&
        typeof list[0] === 'number' &&
        typeof list[1] === 'number';
    }

    var b,
        cs,
        c,
        i;

    // TODO: this is messy and could probably be simplified
    if (geojson.geometry) {
      return this._bounds(geojson.geometry);
    } else if (geojson.geometries) {
      for (i = 0; i < geojson.geometries.length; i++) {
        b = b ? b.extend(this._bounds(geojson.geometries[i])) : this._bounds(geojson.geometries[i]);
      }
    } else if (geojson.features) {
      for (i = 0; i < geojson.features.length; i++) {
        b = b ? b.extend(this._bounds(geojson.features[i])) : this._bounds(geojson.features[i]);
      }
    } else if (geojson.coordinates && isXY(geojson.coordinates)) {
      c = geojson.coordinates;
      return L.latLngBounds(L.latLng(c[1], c[0]), L.latLng(c[1], c[0]));
    } else {
      cs = geojson.coordinates || geojson;
      for (i = 0; i < cs.length; i++) {
        c = cs[i];
        if (isXY(c)) {
          b = b ? b.extend(L.latLng(c[1], c[0])) : L.latLngBounds(L.latLng(c[1], c[0]), L.latLng(c[1], c[0]));
        } else {
          b = b ? b.extend(this._bounds(c)) : this._bounds(c);
        }
      }
    }

    return b;
  }
});

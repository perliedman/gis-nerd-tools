var L = require('leaflet');

module.exports = L.Class.extend({
  initialize: function(repo) {
    this._repo = repo;
    this._geojsonItems = {};
    this._setupEvents();
  },

  _setupEvents: function() {
    var addBtn = L.DomUtil.get('btn-add');

    L.DomEvent.addListener(addBtn, 'click', this._addGeometry, this);
    this._repo.on('added', this._onItemAdded, this);
    this._repo.on('removed', this._onItemRemoved, this);
  },

  _addGeometry: function() {
    var defCtl = L.DomUtil.get('geom-def'),
        srsCtl = L.DomUtil.get('srs'),
        swapCtl = L.DomUtil.get('swap'),
        def = defCtl.value,
        srs = srsCtl.value;
    try {
      this._repo.add(def, srs, swapCtl.checked);
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

  _onItemAdded: function(e) {
    var item = L.DomUtil.create('li', '', L.DomUtil.get('items')),
        gnt = e.geojson.properties._gnt,
        delBtn;
    item.innerHTML = '<div><strong>' + e.geojson.type + '</strong> (' +
      gnt.srs + (gnt.reverse ? ', reversed' : '') + ')</div>' +
      '<div class="def" title="' + gnt.def + '">' +
      gnt.def + '</div>' +
      '<div class="row"></div>';
    delBtn = L.DomUtil.create('button', 'delete-btn');
    delBtn.type = 'button';
    delBtn.innerHTML = '\u2212';
    L.DomEvent.addListener(delBtn, 'click', function() {
      this._repo.remove(e.geojson);
    }, this);
    item.insertBefore(delBtn, item.children[0]);
    this._geojsonItems[L.stamp(e.geojson)] = item;
  },

  _onItemRemoved: function(e) {
    var id = L.stamp(e.geojson);
    L.DomUtil.get('items').removeChild(this._geojsonItems[id]);
    delete this._geojsonItems[id];
  }
});

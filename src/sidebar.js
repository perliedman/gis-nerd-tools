var L = require('leaflet');

module.exports = L.Class.extend({
  initialize: function(repo) {
    this._repo = repo;
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
      this._repo.add(def, srs, swapCtl.checked);
      defCtl.value = '';
    } catch (e) {
      if (L.Util.isArray(e)) {
        this.showErrors(e);
      } else {
        throw e;
      }
    }
  },

  showErrors: function(errors) {
    alert(errors.map(function(e) { return e.message; }).join('\n'));
  }
});

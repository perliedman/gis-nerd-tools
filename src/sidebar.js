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
  }
});

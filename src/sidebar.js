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
        def = defCtl.value,
        srs = srsCtl.value;
    try {
      this._repo.add(def, srs);
      defCtl.value = '';
    } catch (e) {
      if (e.messages) {
        this.showErrors(e.messages);
      } else {
        throw e;
      }
    }
  },

  showErrors: function(errors) {
    alert(errors.join('\n'));
  }
});

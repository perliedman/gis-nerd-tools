module.exports = function(f, layer) {
  layer.bindPopup(
    '<strong>SRS:</strong>&nbsp;' + f.properties._gnt.srs +
    '<br/><strong>Definition:</strong><blockquote class="feature-def">' +
    f.properties._gnt.def.substring(0, 160) +
    '</blockquote>'
  );
};

define(['openlayers'], function(OpenLayers) {
    return OpenLayers.Class(OpenLayers.Control,
    {
        defaultHandlerOptions: {
            'single': true,
            'double': false,
            'pixelTolerance': 0,
            'stopSingle': false,
            'stopDouble': false
        },

        initialize: function(options) {
            this.handlerOptions = OpenLayers.Util.extend(
                {}, this.defaultHandlerOptions
            );
            OpenLayers.Control.prototype.initialize.apply(
                this, arguments
            );
            this.handler = new OpenLayers.Handler.Click(
                this, {
                    'click': this.trigger
                }, this.handlerOptions
            );
        },

        trigger: function(e) {
            var lonlat = this.map.getLonLatFromViewPortPx(e.xy);
            this.locationClicked(lonlat);
        },

        locationClicked: function(lonlat) {
            // Do nothing
        }
    });
})
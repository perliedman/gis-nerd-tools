OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, 
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
        var lonlat = map.getLonLatFromViewPortPx(e.xy);
        this.locationClicked(lonlat);
    },
    
    locationClicked: function(lonlat) {
        // Do nothing
    }
});

var map;
var vectorLayer;
var wktFormat = new OpenLayers.Format.WKT();
var coordSystems = {};
var mapCoordinateSystem = 
    new OpenLayers.Projection('EPSG:900913');

$(document).ready(function() {
    map = new OpenLayers.Map("map");
    var mapnik = new OpenLayers.Layer.OSM();
    vectorLayer = new OpenLayers.Layer.Vector();

    map.addLayers([mapnik, vectorLayer]);
    map.zoomToMaxExtent();

    $('#updateFeature').click(function() {
        try {
            updatedFeature();
        } catch (e) {
            // Do something nice.
        }

        return false;
    });
    $('#coordinateSystemName').change(function() {
        var csName = jQuery.trim($('#coordinateSystemName').val());
        var csDef = '';
        if (coordSystems[csName]) {
            var cs = new Proj4js.Proj(csName);
            csDef = cs.defData;
        }

        $('#coordinateSystemDef').val(csDef);
    });
    $('#coordinateSystemDef').change(function() {
        var csName = jQuery.trim($('#coordinateSystemName').val());
        var csDef = jQuery.trim($('#coordinateSystemDef').val());                    if (coordSystems[csName]) {
            var cs = new Proj4js.Proj(csName);

            if (csDef != '' && cs.defData != csDef) {
                Proj4js.defs[csName] = csDef;
                coordSystems[csName] = null;
                getCurrentCoordinateSystem(function() {
                    // Do nothing
                });
            }
        } else {
            Proj4js.defs[csName] = csDef;
            getCurrentCoordinateSystem(function() {
                // Do nothing
            });
        }
    });

    var mapClick = new OpenLayers.Control.Click();
    mapClick.locationClicked = function(lonlat) {
        getCurrentCoordinateSystem(function(cs) {
            var p = lonlat.transform(mapCoordinateSystem, cs);
            var rx = parseInt(p.lon * 10000) / 10000;
            var ry = parseInt(p.lat * 10000) / 10000;
            $('#coordinate').html('X = ' + rx + ', Y = ' + ry);
        });
    };

    map.addControl(mapClick);
    mapClick.activate();

    $('#wait').hide();
});

function updatedFeature() {
    var wktField = $('#wkt');

    var feature = wktFormat.read(jQuery.trim(wktField.val()));

    /*feature.style = {
        'strokeColor': '#a00000',
        'strokeWidth': 4,
        'fillColor': '#a04040',
        'strokeOpacity': 0.8,
        'fillOpacity': 0.5
    };*/
    if (feature != null) {
        wktField.removeClass('error');

        if ($('#swapCoordinates').is(':checked')) {
            swapFeatureCoordinates(feature);
        }

        getCurrentCoordinateSystem(function(coordinateSystem) {
            features = transformFeatures(feature, coordinateSystem);

            vectorLayer.removeAllFeatures();
            vectorLayer.addFeatures(features);
            map.zoomToExtent(vectorLayer.getDataExtent());
        });
    } else if (!wktField.hasClass('error')) {
        wktField.addClass('error');
    }
};

function transformFeatures(features, coordinateSystem) {
    if ($.isArray(features)) {
        for (var i = 0; i < features.length; i++) {
            transformFeatures(features[i]);
        }

        return features;
    } else {
        features.geometry.transform(coordinateSystem,
            mapCoordinateSystem);
        return [features];
    }
}

function getCurrentCoordinateSystem(callback) {
    var coordinateSystemField = $('#coordinateSystemName');
    var csName = jQuery.trim(coordinateSystemField.val());
    var p4cs = new Proj4js.Proj(csName);
    if (coordSystems[csName] == null) {
        $('#wait').show();
        waitForCoordinateSystem(p4cs, function() {
            $('#wait').hide();
            coordSystems[csName] = 
                new OpenLayers.Projection(csName);
            $('#coordinateSystemDef').val(p4cs.defData);
            callback(coordSystems[csName]);
        });
    } else {
        $('#coordinateSystemDef').val(p4cs.defData);
        callback(coordSystems[csName]);
    }
}

function waitForCoordinateSystem(cs, callback) {
    if (!cs.readyToUse) {
        setTimeout(function() {
            waitForCoordinateSystem(cs, callback);
        }, 100);
    } else {
        callback();
    }
}

function swapFeatureCoordinates(feature) {
    if ($.isArray(feature)) {
        for (var i = 0; i < feature.length; i++) {
            swapFeatureCoordinates(feature[i]);
        }
    } else {
        swapGeometryCoordinates(feature.geometry);
    }
}

function swapGeometryCoordinates(geometry) {
    if (geometry.components) {
        var swapSet = {}
        for (var i = 0; i < geometry.components.length; i++) {
            var component = geometry.components[i];
            if (!swapSet[component]) {
                swapGeometryCoordinates(component);
                swapSet[component] = true;
            }
        }
    } else {
        var temp = geometry.x;
        geometry.x = geometry.y;
        geometry.y = temp;
    }
}


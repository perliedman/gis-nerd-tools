var jam = {
    "packages": [
        {
            "name": "proj4js",
            "location": "lib/proj4js",
            "main": "proj4js-combined.js"
        },
        {
            "name": "jquery",
            "location": "lib/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "openlayers",
            "location": "lib/openlayers",
            "main": "OpenLayers.js"
        }
    ],
    "version": "0.2.13",
    "shim": {
        "proj4js": {
            "exports": "Proj4js"
        },
        "openlayers": {
            "exports": "OpenLayers"
        }
    }
};

if (typeof require !== "undefined" && require.config) {
    require.config({
    "packages": [
        {
            "name": "proj4js",
            "location": "lib/proj4js",
            "main": "proj4js-combined.js"
        },
        {
            "name": "jquery",
            "location": "lib/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "openlayers",
            "location": "lib/openlayers",
            "main": "OpenLayers.js"
        }
    ],
    "shim": {
        "proj4js": {
            "exports": "Proj4js"
        },
        "openlayers": {
            "exports": "OpenLayers"
        }
    }
});
}
else {
    var require = {
    "packages": [
        {
            "name": "proj4js",
            "location": "lib/proj4js",
            "main": "proj4js-combined.js"
        },
        {
            "name": "jquery",
            "location": "lib/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "openlayers",
            "location": "lib/openlayers",
            "main": "OpenLayers.js"
        }
    ],
    "shim": {
        "proj4js": {
            "exports": "Proj4js"
        },
        "openlayers": {
            "exports": "OpenLayers"
        }
    }
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}
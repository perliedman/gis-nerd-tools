var featureCount = 0,
    colors = [
        '#D7191C',
        '#FDAE61',
        '#FFFFBF',
        '#ABD9E9',
        '#2C7BB6'
    ];

module.exports = function createStyle(f) {
    var idx = featureCount % colors.length;

    featureCount++;

    return {
        color: colors[idx],
        weight: 1.5
    }
}
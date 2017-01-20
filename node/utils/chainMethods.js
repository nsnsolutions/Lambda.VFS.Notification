module.exports = function(origin, insert) {
    var _ = function() {
        var args = insert.apply(this, arguments);
        return origin.apply(this, args);
    };

    return _;
};

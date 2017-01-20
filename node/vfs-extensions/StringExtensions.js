var util = require('util');

String.prototype.format = function() {
    var args = Array.prototype.slice.call(arguments);
    args.splice(0, 0, this.toString());
    return util.format.apply(null, args);
};

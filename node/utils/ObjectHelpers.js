module.exports = {
    getValueOrDefault: _getValueOrDefault,
    isNullOrEmpty: _isNullOrEmpty,

    propertyPathIsNullOrEmpty: function(context, propertyPath) {
        var _path = propertyPath.split(".");
        return _propertyPathIsNullOrEmpty(context, _path);
    },

    propertyIsNullOrEmpty: function(context, propertyName) {
        return _propertyPathIsNullOrEmpty(context, [propertyName]);
    }
};

function _isNullOrEmpty(o) {

    if(typeof o === 'undefined')
        return true;

    if(o == "")
        return true;

    if(o == null)
        return true;

    return false;
};


function _propertyPathIsNullOrEmpty(inst, path) {
    if (path.length == 0)
        return false;

    var prop = path[0];
    path.shift();

    if(!(_isNullOrEmpty(inst[prop])))
        return _propertyPathIsNullOrEmpty(inst[prop], path);

    return true;
};

function _getValueOrDefault(context, path, defaultValue) {
    if(_propertyPathIsNullOrEmpty(context, path.split(".")))
        return defaultValue;

    var _path = path.split('.');
    var _context = context;

    while(_path.length > 0) {
        var p = _path.shift();
        _context = _context[p]
    }

    return _context;
};

function _isEmail(val) {
    if (typeof val !== 'string')
        return false;

    var _val1 = val.split('@');
    if (_val1.length != 2)
        return false;

    var _val2 = _val1[1].split('.');
    if (_val2.length < 2)
        return false;

    return true;
};

module.exports = {
    isEmail: _isEmail
};

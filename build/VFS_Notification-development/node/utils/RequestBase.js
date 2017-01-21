'use strict'

const util = require('util');
const Obj = require('./ObjectHelpers.js');

var RequestBase = function(body, parameterMap) {

    this.isValid = true;
    this.errorMessage = null;
    this.errorParameter = null;

    if(Obj.isNullOrEmpty(body)) {

        /*
         * No body, There is no request so it's not valid.
         */

        this.isValid = false;
        this.errorMessage = "No request body provided.";

    } else if(Obj.isNullOrEmpty(parameterMap)) {

        /*
         * There was not validation map so we clone it and call it good.
         */

        for (var p in body)
            this[p] = body[p];

    } else {

        /*
         * Parse the body object according to the parameter map and set the
         * values on this context.
         */

        for(var parameter in parameterMap) {
            var args = parameterMap[parameter];
            RequestBase.prototype.requireParameter.call(this, parameter, args, body);

            if (!this.isValid) {
                this.errorParameter = parameter;
                break;
            }
        }
    }
};

RequestBase.prototype.requireParameter = function(name, options, body) {

    /*
     * Parse a parameter from body as defined in options and set this[name] to
     * the resulting value.
     *
     * Example obj.requireParameter("foo.bar", [ "some.deep.link", String, true ], requestBody);
     *
     * Arguments:
     *  name - The name of the parameter on the current object to set.
     *  options - Details about where to look in the body. Similare to pmap.
     *  body - A object containing the request body to be parsed.
     */

    options.unshift(body);
    var value = RequestBase.prototype.parseParameter.apply(this, options);

    if(typeof value !== 'undefined' && name != "_")
        RequestBase.prototype.setValueByPath.call(this, name, value);
};

RequestBase.prototype.setValueByPath = function(path, value) {

    /*
     * Set a value on the current object context given a path.
     * Example:
     * obj.setValueByPath("foo.bar.baz", 42);
     *
     * This will cause the obj variable to have the following additional
     * fields: * obj=> { "foo": { "bar": { "baz": 42 } } }
     *
     * Arguments:
     *  path : The path inside the current context to set.
     *  value : The value to set on that property.
     *
     * Returns:
     *  Nothing
     */

    var _path = path.split('.');
    var _context = this;

    while(_path.length > 1) {
        var p = _path.shift();

        if (Obj.propertyIsNullOrEmpty(_context, p))
            _context[p] = {};

        _context = _context[p]
    }

    var p = _path.shift();
    _context[p] = value;
};

RequestBase.prototype.parseParameter = function(obj, path, type, required, defValue) {
    /*
     * Retrieve and validate a value from obj.
     *
     * If an object is requried but not present then the isValid flag will be
     * set to false and errorMessage will be set.
     *
     * If an object is present but not the correct type, isValid flag will be
     * set to false and error message will be set regardless if the value is
     * required or not.
     *
     * If the value is not required and not present, defValue will be returned
     * without type checking.
     *
     * Arguments:
     *  obj: The object to get the value out of.
     *  path: A string representing the path in the object. eg: "foo.bar.baz"
     *  type: A primative type function. eg: Number
     *  required: A bool indicating if the parameter is required or not.
     *  defValue: A default value if the value is not required and not present.
     *
     * Returns:
     *  The value stored in object.path.
     *
     */

    if (Obj.propertyPathIsNullOrEmpty(obj, path) && required) {
        this.isValid = false;
        this.errorMessage = util.format(
            "Missing required field '%s' in request body", path
        );
        return null;
    }

    var value = Obj.getValueOrDefault(obj, path, defValue);

    if(value == defValue)
        return value;

    if(typeof value === typeof type())
        return value;

    this.isValid = false;
    this.errorMessage = util.format(
        "Required field '%s' should be type '%s'", path, typeof type()
    );
};

module.exports = RequestBase;

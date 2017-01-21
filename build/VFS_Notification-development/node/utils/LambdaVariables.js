
'use strict'

const util = require('util');
const IdentLogger = require('./IdentLogger.js');
const moment = require('moment');
const Obj = require('./ObjectHelpers.js');
const RequestBase = require('./RequestBase.js');

function extend_pmap(pmap, key, values) {
    if(Obj.isNullOrEmpty(values) || Obj.isNullOrEmpty(values[key]) || values.length == 0) {
        pmap[key] = [ util.format("environment.%s", key), Object, false, {} ]
    } else {
        var _values = values[key]
        for (var i = 0; i < _values.length; i++) {
            var _key = util.format("%s.%s", key, _values[i]);
            pmap[_key] = [ util.format("environment.%s", _key), String, true ];
        }
    }
};

var LambdaVariables = function(body, requires) {

    var _pmap = {
        "logLevel": [ "environment.logLevel", String, false, "info" ],
        "region": [ "environment.region", String, false, "us-west-2" ],
        "isDebug": [ "environment.debug", Boolean, false, false ],
        "tables": [ "environment.tables", Object, false, {} ],
        "queues": [ "environment.queues", Object, false, {} ],
        "topics": [ "environment.topics", Object, false, {} ],
        "remoteEndpoint": [ "environment.remoteEndpoint", Object, false, {} ],
    };

    if(!Obj.isNullOrEmpty(requires))
        for(var key in requires)
            extend_pmap(_pmap, key, requires);

    RequestBase.call(this, body, _pmap);
}

util.inherits(LambdaVariables, RequestBase);

LambdaVariables.prototype.createLogger = function(context) {
    return IdentLogger.createLogger({
        level: this.logLevel,
        log2Console: true,
        program: util.format(
            "%s.%s",
            context.functionName,
            context.functionVersion
        )
    }, util.format("AWSID: %s", context.awsRequestId || moment().format("x")));
};

module.exports = LambdaVariables;

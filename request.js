'use strict'

const util = require('util');
const vfsUtil = require('vfs-utils');

var Request = function(body) {

    var pmap = { 
    	"module": [ "module", String, true ],
        "method": [ "method", String, true ],
        "params": [ "params", Object, true ]
    };

    vfsUtil.service.RequestBase.call(this, body, pmap);
}

util.inherits(Request, vfsUtil.service.RequestBase);

module.exports = Request;
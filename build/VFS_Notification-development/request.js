'use strict'

const util = require('util');
const vfsUtil = require('vfs-utils');

var Request = function(body) {

    var pmap = {
        "eventType": [ "eventType", String, true ],
        "jobId": ["jobId", String, true]
    };

    vfsUtil.service.RequestBase.call(this, body, pmap);
}

util.inherits(Request, vfsUtil.service.RequestBase);

module.exports = Request;
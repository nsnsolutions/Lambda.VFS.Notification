'use strict';

const util = require('util');
const vfsUtils = require('vfs-utils');
const Request = require('./request.js');

var Service = function(environment, logger, ddbClient) {
    vfsUtils.service.ServiceBase.call(this);
    this.log = logger;
    this.env = environment;
    this.ddbClient = ddbClient;
};

util.inherits(Service, vfsUtils.service.ServiceBase);

Service.prototype.process = function(body) {

    var req = new Request(body);

    if (req.isValid) 
        this._process(req);
    else 
        this.abort(400, req.errorMessage);
}

Service.prototype._process = function(req) {


    var method;
    try {
        var mod = require("./modules/" + req.module);
        method = mod[req.method].bind(this);

    } catch (e) {
        // Could not find module or method. Abort 400 - Bad request
        console.error(String(e));
        this.abort(400, "Unknown handler '%s.%s': Abort.".format(req.module, req.method));
    }

    method(req.params);
};

module.exports = Service;

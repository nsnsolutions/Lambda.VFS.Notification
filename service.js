'use strict';

const util = require('util');
const vfsUtil = require('vfs-utils');
const Request = require('./request.js');

var Service = function(environment, logger, dbClient) {
    vfsUtil.service.ServiceBase.call(this);
    this.log = logger;
    this.env = environment;
    this.dbClient = dbClient;
};

util.inherits(Service, vfsUtil.service.ServiceBase);

Service.prototype.process = function(body) {
    
    var req = new Request(body);

    if(req.isValid)
        this._process(req);
    else
        this.abort(400, req.errorMessage);
}

Service.prototype._process = function(req) {

    // Lookup the module and execute its funciton.
    if (this._validate()) {

        this.log.infoPublic("Sending " + req.eventType + " to Notification Service");

        /* 
         * Push Event to notification service 
         */ 


















        this.complete("Event Sent to Notification Service");
    } else 
        this.abort("Event Failed Validation");
    
};

Service.prototype._validate  = function(req) {

    // Lookup the module and execute its funciton.

    /* 
     * Perform Detailed Validation on the Event
     */ 

    return true;
};





module.exports = Service;

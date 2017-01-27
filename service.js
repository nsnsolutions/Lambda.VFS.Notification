'use strict';

const util = require('util');
const vfsUtil = require('vfs-utils');
const Request = require('./request.js');
const Client = require('node-rest-client').Client;
const Q = require('q');

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

        //http://localhost:10101/act?role=notificationService.Pub&cmd=notification.v1&cp=%7B%20%0A%20isValid%3A%20true%2C%0A%20%20errorMessage%3A%20null%2C%0A%20%20errorParameter%3A%20null%2C%0A%20%20eventType%3A%20%27PrintJobApprovalRequested%27%2C%0A%20%20jobId%3A%20%27VEMYJOBID%27%20%0A%7D

        console.log("Logging Request: ");
        console.log(req);

        if (req.rpcUri != 'local') {

            this.log.infoPublic("Processing Request");

            var url = "https://" + this._rpcUri(req) + "/amqp/exec/notificationService/notification";
            this.log.infoPublic("Post to: " + url);
            this._post(url, this._buildNotificationEventReq(req)).then(
                function(data) {
                    this.complete("Event Sent to Notification Service");
                }, function (error) {
                    this.complete("Error to Notification Service");
                });

        } else {

            //https://devel.rpc.velma.com/amqp/exec/notificationServicetokenService/tokenize 
            this.log.infoPublic("Local Dev Testing");

            var baseUrl = "http://localhost:10101/act?role=notificationService.Pub&cmd=notification.v1";
            var url = baseUrl + "&cp=" + encodeURI(JSON.stringify(this._buildNotificationEventReq(req)));
            this.log.infoPublic("Post to: " + url);
            this._postWithGet(url).then(
                function(data) {
                    this.complete("Event Sent to Notification Service");
                }, function (error) {
                    this.complete("Error to Notification Service");
                });

        } 

        
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


Service.prototype._buildNotificationEventReq  = function(req) {

// {
//     "eventType": "PrintJobApprovalRequested", 
//     "jobId": "VEMYJOBID"
//  
// }

    var ner = {
        eventType: req.type,
        jobId: req.job_id, 
        person: req.person,
        details: req.details, 
        rpcUri: this._rpcUri(req)
    };

    return ner;
};


/*
 * Used for Local Testing through encoded url
 */
Service.prototype._postWithGet = function(url) {

    var deferred = Q.defer(); 
    var client = new Client();
    client.get(url, function (data, response) {
        if(data.hasError)
            deferred.reject(false); 
        else 
            deferred.resolve(true);
        
    }, function(error) {
        deferred.reject(false);
    });

    return deferred.promise;

}

/*
 * Post Data to the RPC Service
 */
Service.prototype._post = function(url, req) {

    this.log.infoPublic("Payload");
    this.log.infoPublic(req);

    var args = {
      data: req,
      headers: { "Content-Type": "application/json" }
    };

    var deferred = Q.defer(); 
    var client = new Client();
    client.post(url, args, function (data, response) {
        if(data.hasError)
            deferred.reject(false); 
        else 
            deferred.resolve(true);
    }, function(error) {
        deferred.reject(false);
    });
    return deferred.promise;
}

Service.prototype._rpcUri = function(req) {

    if (req.eventArn.indexOf("devel") != -1)
        return req.develRpcUri;
    else if (req.eventArn.indexOf("test") != -1)
        return req.testRpcUri;
    return req.rpcUri; 

}

module.exports = Service;

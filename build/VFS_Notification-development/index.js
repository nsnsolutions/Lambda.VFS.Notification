'use strict'

require('vfs-extensions');

const vfsUtil = require('vfs-utils');
const Service = require('./service.js');
const aws = require('aws-sdk');
const lodash = require('lodash');

const errorMessage = {
    400: "Bad Request: %s",
    500: "Internal Server Error: %s",

    format: function (code, message) {
        var _code = String(code);
        if (_code in this)
            return this[_code].format(message);
        return "Unknown Error: %s".format(message);
    }
};

const eventTypeMap = [
    "PrintJobApproved", 
    "PrintJobDeclined", 
    "PrintJobApprovalRequested"
];

exports.handler = function (event, context, callback) {

    var env = new vfsUtil.LambdaVariables(event, {});

    if (!env.isValid) {

        /*
         * The environment must be valid for us to continue. If you get a 503
         * from this function, it is because your Request Integration Model is
         * not providing the environment needed to execute.
         */

        console.log("Environment is not valid: %s".format(env.errorMessage));
        callback(errorMessage.format(503, "The service might be in maintenance mode. Please try again later."));
        return;
    }

    var logger = env.createLogger(context);

    /* 
     * Check to see if the nofitification event is accepted. 
     */

    logger.infoPublic("EventType : " + event.body.eventType);
 
    if (lodash.indexOf(eventTypeMap, event.body.eventType) == -1) {
        console.log("Event Not Accepted: Dropping: %s".format("'" + event.body.eventType + "'"));
        return;
    }

    /*
     * Process Event Body in Service
     */
    
    var impl = new Service(env, logger);

    /*
     * impl will emit codes on completion.
     * The possible events are:
     *  - fail: Raised when abort is called inside Service.
     *  - succeed: Raised when complete is called inside Service.
     *  - complete: Called if either complete or abort is called inside Service.
     *
     * In the case of abort, the impl will also emit an event named by the code
     * that was given on the abort call.
     *
     * Example:
     * Service.prototype.something = Function() { this.abort(500, "Failed"); }
     * would emit a 500 event, failed and complete.
     *
     * Example:
     * impl.once(500, function(result) {} );
     */

    impl.once('abort', function(result) { 
        logger.errorPublic("%s - %s".format(result.code, result.error));
    });

    impl.once('done', function(result) {

        if(result.error)
            result.error = errorMessage.format(result.code, result.error);

        callback(result.error, result.data);
        logger.baseLogger.close();
    });

    impl.process(event.body);
};
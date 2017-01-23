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

    /* Message Structure 
     {
      "Records":[
        {
          "EventSource":"aws:sns",
          "EventVersion": "1.0",
          "EventSubscriptionArn": "arn:aws:sns:us-east-1:123456789012:lambda_topic:0b6941c3-f04d-4d3e-a66d-b1df00e1e381",
          "Sns":{
            "Type": "Notification",
            "MessageId":"95df01b4-ee98-5cb9-9903-4c221d41eb5e",
            "TopicArn":"arn:aws:sns:us-east-1:123456789012:lambda_topic",
            "Subject":"TestInvoke",
            "Message":"<message payload>",
            "Timestamp":"2015-04-02T07:36:57.451Z",
            "SignatureVersion":"1",
            "Signature":"r0Dc5YVHuAglGcmZ9Q7SpFb2PuRDFmJNprJlAEEk8CzSq9Btu8U7dxOu++uU",
            "SigningCertUrl":"http://sns.us-east-1.amazonaws.com/SimpleNotificationService-d6d679a1d18e95c2f9ffcf11f4f9e198.pem",
            "UnsubscribeUrl":"http://cloudcast.amazon.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:123456789012:example_topic:0b6941c3-f04d-4d3e-a66d-b1df00e1e381",
            "MessageAttributes":{"key":{"Type":"String","Value":"value"}}
          }
        }
      ]
    }
    */

    console.log("*********** LOG EVENT ************");
    
    // Looking for a valid SNS Record

    if (event.Records[0].Sns) {

        console.log("Valid SNS Record");   

        // Extract Event Body from the SNS Message
        event.body = JSON.parse(event.Records[0].Sns.Message);

    } else {

        // Error
        console.log("Bad SNS Message");
        console.log(event);
        return;
    }
    
    // console.log("** event.body **");
    // console.log(event.body);
    // console.log(event.body.eventType);

    var env = new vfsUtil.LambdaVariables(event, {});
    var logger = env.createLogger(context);

    /* 
     * Check to see if the nofitification event is accepted. 
     */

    logger.infoPublic("*** EventType : " + event.body.eventType);
 
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

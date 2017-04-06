'use strict';

// const AWS = require('aws-sdk');
const util = require('util');
const vfsUtil = require('vfs-utils');
const async = require('async');

// vfsUtils.aws = require('vfs-aws');
// const Request = require('./request.js');
// const Client = require('node-rest-client').Client;
// const Q = require('q');
// const lodash = require('lodash');
// const httpreq = require('httpreq');

const jobAsset = {
    getJobRecord: require('./_getJobRecord'), 
    getJobCommandPacket: require('./_getJobCommandPacket'),
    requeueCommandPacket: require('./_requeueCommandPacket')
};

module.exports = function (params) {

    console.log(params);

    var req = new RequeueJobRequest(params); 

    console.log(req);

     if(!req.isValid) {
        this.abort(400, req.errorMessage);
        return;
    }

    var tasks = [
        async.apply(getJobRecord.bind(this), req),
        async.apply(getJobCommandPacket.bind(this), req),
        async.apply(requeueCommandPacket.bind(this), req)
    ];

    async.waterfall(tasks, (err, data) => {
        if(err) {
            this.log.error(err);
            this.abort(500, String(err));
        } else {
            this.complete(req.result);
        }
    });
}

function getJobRecord(req, done) {

    console.log("Get Job Record");
    console.log(req);
 
    jobAsset.getJobRecord({
        ddbClient: this.ddbClient,
        jobTable: this.env.tables.vfs_job_table,
        jobId: req.jobId,
        failure: this.abort.bind(this),
        success: (item) => {
            req.jobRecord = item;
            done();
        }
    })
  
}

function getJobCommandPacket(req, done) {
 
    console.log("Get Job Command Packet");
    console.log(req);
      
    jobAsset.getJobCommandPacket({
        jobId: req.jobId, 
        cpRef: req.jobRecord.cp_ref,
        failure: this.abort.bind(this),
        success: (item) => {
            req.jobCommandPacket = item;
            done();
        }  
    })

}

function requeueCommandPacket(req, done) {
 
    console.log("Re-Queue Command Packet");
    console.log(req);
    
    done();
}

var RequeueJobRequest = function(body) {

    var pmap = {
        "jobId":   [ "jobId",   String, true ],
        "queue": [ "queue", String, true ]
    };

    vfsUtil.service.RequestBase.call(this, body, pmap);

    this.result = {};
};



// util.inherits(Service, vfsUtils.service.ServiceBase);

// Service.prototype.process = function(body) {
//     console.log(body);
//     this._process(body);
// }

// Service.prototype._process = function(req) {

//     console.log("req.body");
//     console.log(req);
   
//     var emailQueue = this.env.queues.emailQueue;
//     console.log(emailQueue);

//     // Build Job Queuy
//     var q = {
//         TableName: this.env.tables.vfs_job_table,
//         Key: "jobId", 
//         KeyConditionExpression: "#j = :jid",
//         ExpressionAttributeNames: 
//         { 
//             "#j": "jobId"
//         },
//         ExpressionAttributeValues: { 
//             ":jid": "VE2017021023511456805712"
//         }
//     };

//     console.log("Run Query");
//     console.log(q);        

//     console.log("Results");
//     var jobs = [];

//     var dynDb  = new vfsUtils.aws.AmazonDynamoDb();

//     dynDb.queryItem(q).then(
//         function(data) {
             
//              if (data.data.Count > 0) {
             
//                 console.log("Found Job");   
//                 console.log(data);
                            
//                 // Get Command Packet 




//                             if(item.cp_ref && item.jobId == 'VE2017021023511456805712')
//                             {
                                
//                                 var client = lodash.find(clientKeyMap, function (c) { return c.key == i.clientKey; });
                                
//                                 if (client)
//                                     client.count++;  
        
//                                 httpreq.get(i.cp, function (err, res) {
                                    
//                                     if (err) {
//                                         log.error("Failed to get JSON File: " + i.cp + " with status code: " + res.statusCode);
//                                     } else {

//                                         //console.log("Fetched CP: " + i.jobId);
                                       
//                                         //console.log("Fetched CP");
                                        
//                                         var commandPacket = JSON.parse(res.body);    
//                                         // console.log(commandPacket);
                                        
//                                         /*
//                                          * Send Command Packet to Success Queue
//                                          */   

//                                         var amazonSQS = new vfsUtils.aws.AmazonSQS(emailQueue);
//                                         amazonSQS.saveMessage(commandPacket).then(
//                                         function(data) {

//                                             /*** Success ***/
//                                             if (data.success) {
//                                                 console.log("Re - Submitting job : " + i.jobId); 
//                                                 index++;
//                                                 resolve("Job ReSubmitted");

//                                             } else {
//                                                 var errMsg = 'SQS save message failed for queue: ' + emailQueue
//                                                 console.log(errMsg);
//                                                 index++;
//                                                 reject(errMsg);    
//                                             }
                                       
//                                         },
//                                         function(error) {
//                                             var errMsg = 'SQS save message failed: ' + JSON.stringify(error);
//                                             console.log(errMsg);
//                                             index++;
//                                             reject(errMsg);
//                                         });
//                                     }
//                                 });    
//                             } else {
//                                //console.log("Skipping: " + i.jobId);
//                                index++;
//                                resolve("Skipping");
//                             }

//                         });

//                   }).then(function() {
//                       var message = "Finished Processing all jobs"; 
//                       console.log(clientKeyMap);
//                       console.log(message);
//                      });

//              } else {
//                 var message = "No jobs were found.";   
//                 console.log(message);
//              }
//          },
//         function (error) {
//             console.log("Error Processing Jobs: " + JSON.stringify(error));
//         });


// // Re-post all jobs for:
// // ·         Home Access Financial: 16
// // ·         Bond Street: 59
// // ·         West Town Bank & trust: 7    681670f92aaf4e84bb68bb3805d1ec4f
// // ·         Primary Residential: 23
   

// };


// function _resend_job(job) {
    
//     if (job.jobId == 'VE20170210153216ec29a1e5')
//     {
//         console.log("Resending: " + job.jobId);
//         console.log(job);
//     }    

//     // Update Job Status


//     // Get CP and Drop Back into Processing Queue

//     // httpreq.get(job.cp, function (err, res) {
                                
//     //     if (err) {
//     //         log.error("Failed to get JSON File: " + job.cp);
//     //     } else {

//     //         var commandPacket = JSON.parse(res.body);    

//     //         /*
//     //          * Send Command Packet to Success Queue
//     //          */   

//     //         var amazonSQS = new vfsUtils.aws.AmazonSQS(event.SUCCESSQUEUEURL);
//     //         amazonSQS.saveMessage(commandPacket).then(
//     //         function(data) {

//     //             /*** Success ***/
//     //             if (data.success) {
//     //                 //log.info("[" + jobId + "] dispatching job to Amazing Mail Queue: " + event.SUCCESSQUEUEURL); 
//     //                 //resolve("Job Dispatched " + jobId);

//     //             } else {
//     //                 //var errMsg = 'SQS save message failed for queue: ' + event.SUCCESSQUEUEURL
//     //                 log.info(errMsg);
//     //             }
           
//     //         },
//     //         function(error) {
//     //             var errMsg = 'SQS save message failed: ' + JSON.stringify(error);
//     //             log.info(errMsg);
//     //             index++;
//     //             reject(errMsg);
//     //         });
//     //     }
//     // });    


//     // var params = {
//     //     QueueUrl: this.env.queues.default,
//     //     MessageBody: commandPacket
//     // }

   

//     //     this.sqsClient.sendMessage(params, (err, data) => {

//     //         if(err) {
//     //             // Make error a bit more specific.
//     //             var _err = "Failed to dispatch to queue: %s".format(String(err));
//     //             this.log.errorPublic("Failed to dispatch to queue. \n" + String(err));
//     //         }

//     //         body.addResult(item, _err, _err == null);
//     //         done();
//     //     });
//     // }

// }


// module.exports = Service;

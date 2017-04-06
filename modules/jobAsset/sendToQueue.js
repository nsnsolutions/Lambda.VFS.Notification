'use strict';

const AWS = require('aws-sdk');
const util = require('util');
const vfsUtils = require('vfs-utils');
vfsUtils.aws = require('vfs-aws');
const Request = require('./request.js');
const Client = require('node-rest-client').Client;
const Q = require('q');
const lodash = require('lodash');
const httpreq = require('httpreq');

var Service = function(environment, logger, dbClient) {
    vfsUtils.service.ServiceBase.call(this);
    this.log = logger;
    this.env = environment;
    this.dbClient = dbClient;
};

util.inherits(Service, vfsUtils.service.ServiceBase);

Service.prototype.process = function(body) {
    console.log(body);
    this._process(body);
}

// const clientKeyMap = [
//     { client: "Bond Street", key: '74dd9e21d15b4623991ffb0723cd9c1c', count: 0 }, 
//     { client: "Primary Residential Mortgage Inc.", key: 'c8677b53db7a40dabdf57e39ee15f3f8', count: 0  }, 
//     { client: "Home Access Financial", key: '71035be264eb4923af397ad75570b1fc', count: 0  }, 
//     { client: 'West Town Bank & Trust', key: '681670f92aaf4e84bb68bb3805d1ec4f', count: 0  }, 
//     { client: 'MOCK', key: '9058883ff8234e43ab1b6ac077c76772', count: 0  }, 
// ]

// function promiseWhile (condition, action) {
//     var resolver = Promise.defer();
  
//     var loop = function() {
//         if (!condition()) {
//           // End
//           return resolver.resolve();  
//         } else {
//           // Loop
//           return Promise.resolve(action())
//             .then(loop)
//             .catch(resolver.reject);
//         }
//     };

//     process.nextTick(loop);
//     return resolver.promise;
// };


Service.prototype._process = function(req) {

    console.log("req.body"); 

//     var dates = req.dateRange.split(';');

//     var startDate = dates[0];
//     var endDate = dates[1];

//     console.log(req); 
   
//     var emailQueue = this.env.queues.emailQueue;
//     console.log(emailQueue);
    
//     // var q = 
//     //     {
//     //         TableName: this.env.tables.vfs_job_table,
//     //         ProjectionExpression:"#sp, jobId, #st, cp_ref, client, sponsor, createDate",
//     //         IndexName: "sponsorId-createDate-index",
//     //         KeyConditionExpression: "#sp = :sp and #cd > :sd",
//     //         ExpressionAttributeNames: 
//     //         { 
//     //             "#sp": "sponsorId",
//     //             "#cd": "createDate", 
//     //             "#st": "status"
//     //         },
//     //         ExpressionAttributeValues: { 
//     //             ":sp": req.sponsorId, 
//     //             ":sd": startDate
//     //         }
//     //     };

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
             
//                 console.log("Found " + data.data.Count  + " Jobs");   

//                 var jobCnt = data.data.Count;
//                 var index = 0;

//                 promiseWhile(
//                     function () {
                        
//                         /*
//                          * This will stop looping when this condition is false. 
//                          */    

//                         return index < jobCnt; 
//                     }, 
//                     function () {
                        
//                         /*
//                          * Will loop through the jobs until the previous function is false  
//                          */

//                         return new Promise(function(resolve, reject) {

//                             var item = data.data.Items[index];

//                             /*
//                              * Get Command Packet from S3 and Drop into success queue
//                              */   
                           
//                             console.log(item);
//                             // var i = {
//                             //     jobId: item.jobId, 
//                             //     sponsorKey: item.sponsor.key, 
//                             //     name: item.client.name,
//                             //     clientKey: item.client.key, 
//                             //     status: item.status, 
//                             //     cp: item.cp_ref, 
//                             //     date: item.createDate
//                             // }           

//                             console.log(i);


//                             //if (i.cp && i.status == req.status && i.clientKey != '9058883ff8234e43ab1b6ac077c76772')
                            
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
   

};



module.exports = Service;

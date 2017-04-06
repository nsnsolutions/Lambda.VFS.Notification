'use strict';

const httpreq = require('httpreq');
const 

module.exports = function(opts) {
    
    /*
     * opts:
     *   jobId: The ID of the record to retrieve.
     *   cp_ref: A refrence to the DynamoDB Document Client.
     *   success: A function to call on success: (item) => {}
     *   failure: A function to call on failure: (code, message) => {}
     */


     console.log("_getJobCommandPacket");
     console.log(opts);

      // httpreq.get(i.cp, function (err, data) {
                         
      //       console.log(data);
      //       console.log(err);

      //       if(!err && data.body)
      //           opts.success(data.Item);
      //       else 
      //           opts.failure(500, "Failed to retrieve command packet.");

      //       var commandPacket = JSON.parse(res.body);    
      //       console.log(commandPacket);
            
      // });  
                                        







    // var query = {
    //     TableName: opts.jobTable,
    //     Key: { "jobId": opts.jobId }
    // };

    // opts.ddbClient.get(query, (err, data) => {

    //     if(!err && data.Item)
    //         opts.success(data.Item);
    //     else if (!err)
    //         opts.failure(404, "Unknown job record.");
    //     else
    //         opts.failure(500, "Failed to retireve job record.");

    // });
}
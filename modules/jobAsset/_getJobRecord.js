'use strict';

module.exports = function(opts) {
    
    /*
     * opts:
     *   jobTable: The name of the dynamo VFS_Jobs table for this stack.
     *   jobId: The ID of the record to retrieve.
     *   ddbClient: A refrence to the DynamoDB Document Client.
     *   success: A function to call on success: (item) => {}
     *   failure: A function to call on failure: (code, message) => {}
     */

    var query = {
        TableName: opts.jobTable,
        Key: { "jobId": opts.jobId }
    };

    opts.ddbClient.get(query, (err, data) => {

        if(!err && data.Item)
            opts.success(data.Item);
        else if (!err)
            opts.failure(404, "Unknown job record.");
        else
            opts.failure(500, "Failed to retireve job record.");

    });
}
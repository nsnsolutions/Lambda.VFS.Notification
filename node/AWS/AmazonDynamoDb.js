'use strict';

var AWS = require('aws-sdk');
var Promise = require('bluebird');

// Configure AWS
// http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html
// AWS.config.update({ 
// 	accessKeyId: 'XXXXXXX', 
// 	secretAccessKey: 'XXXXXXX'
// });

var AmazonDynamoDb = function() {}

// PutItem: Saves data item to the specified table in DynamoDb.
AmazonDynamoDb.prototype.putItem = function(table, data) {

	return new Promise(function(resolve, reject) {

		var request = {
			TableName: table,
			Item: data
		};

		var db = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});
		db.put(request, function(error, data) {
			if (error) {
				console.log(error);
				reject({ success: false, responseCode: '200.0.1', message: 'AWS DynamoDb PutItem failed', error: error });
			} else {
				resolve({ success: true, responseCode: '200.0.0', message: 'AWS DynamoDb PutItem succeeded', data: data.Body })
			}
		});

	});
};

AmazonDynamoDb.prototype.updateItem = function (params) {
	
	return new Promise(function(resolve, reject) {

		var docClient = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});

		docClient.update(params, function(err, data) {
			if (err) {
				console.log(err);
				reject({ success: false, responseCode: '200.0.2', message: 'Update failed.', error: err });
			}
			else {
				resolve({ success: true, responseCode: '200.0.0', message: 'Update succeeded', data: data });
			}
		});
	});
};

AmazonDynamoDb.prototype.queryItem = function (params) {
	
	return new Promise(function(resolve, reject) {

		var docClient = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});

		docClient.query(params, function(err, data) {
			if (err) {
				console.log(err);
				reject({ success: false, responseCode: '200.0.1', message: 'Query failed.', error: err });
			}
			else {
				resolve({ success: true, responseCode: '200.0.0', message: 'Query succeeded.', data: data });
			}
		});
	});
};



AmazonDynamoDb.prototype.getJob = function (table, jobId) {
	
	return new Promise(function(resolve, reject) {

		console.log("Table = " + table);
		console.log("jobId = " + jobId);

		var docClient = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});
 
		var params = {
		    Key: {
		        jobId: jobId,
                itemId: ""
		    },
		    TableName: table
		};

		docClient.get(params, function(err, data) {
			if (err) {
				console.log(err);
				reject({ success: false, responseCode: '200.0.1', message: 'Job: Error querying job by jobId', error: err });
			}
			else if (data.Item == null) {
				reject({ success: false, responseCode: '200.0.1', message: 'Job: Error querying job by jobId. Invalid jobId'});
			}
			else {
				console.log("Data");
				console.log(data);
				resolve({ success: true, responseCode: '200.0.0', message: 'Job: AWS DynamoDb getJob succeeded', data: data.Item });
			}
		});
	});
};

AmazonDynamoDb.prototype.getItemById = function (table, id) {
	
	return new Promise(function(resolve, reject) {

		var docClient = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});
 
		var params = {
		    Key: {
		        id: id,
		    },
		    TableName: table
		};

		docClient.get(params, function(err, data) {
			if (err) {
				console.log(err);
				reject({ success: false, responseCode: '200.0.1', message: 'Sponsor: Error querying sponsor by key', error: err });
			}
			else {
				resolve({ success: true, responseCode: '200.0.0', message: 'Sponsor: AWS DynamoDb getItemById succeeded', data: data.Body });
			}
		});
	});
};




// Module Definition
module.exports = AmazonDynamoDb;
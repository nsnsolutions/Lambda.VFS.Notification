'use strict';

var AWS = require('aws-sdk');
var Promise = require('bluebird');

var AmazonSQS = function(queueUrl) {
	this.queueUrl = queueUrl;	
}

// Ge tFile: Gets a file from Amazon S3.
// var fileRequest = {
//   Bucket: 'velma-orders',
//   Key: 'test/VP-201617-2-12-WU8/VP-201617-2-12-WU8.html'
// }

AmazonSQS.prototype.saveMessage = function(messageBody) {

	var queueUrl = this.queueUrl;

	return new Promise(function(resolve, reject) {

		var request = {
			QueueUrl: queueUrl,
			MessageBody: JSON.stringify(messageBody)
		}

		var sqs = new AWS.SQS({region: 'us-west-2' })
		sqs.sendMessage(request, function(error, data) {
			if (error) {
				console.error('AWS SQS SaveToQueue failed');
				reject({ success: false, message: 'AWS SQS SaveToQueue failed', error: error });
			} else {
				resolve({ success: true, message: 'AWS SQS SaveToQueue succeeded', data: data })
			}
		});

	});

};

// Module Definition
module.exports = AmazonSQS;

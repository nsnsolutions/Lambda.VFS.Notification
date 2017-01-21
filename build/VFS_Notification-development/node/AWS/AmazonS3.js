'use strict';

var S3_REGION = 'us-east-1';
var AWS = require('aws-sdk');
var Promise = require('bluebird');

// Configure AWS
// http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html
// AWS.config.update({ 
// 	accessKeyId: 'XXXXXXX', 
// 	secretAccessKey: 'XXXXXXX'
// });

var AmazonS3 = function() {}

// GetFile: Gets a file from Amazon S3.
// var fileRequest = {
//   Bucket: 'velma-orders',
//   Key: 'test/VP-201617-2-12-WU8/VP-201617-2-12-WU8.html'
// }
AmazonS3.prototype.getFile = function(bucketName, fileKey) {

	return new Promise(function(resolve, reject) {

		var request = {
			Bucket: bucketName,
			Key: fileKey
		}

		var s3 = new AWS.S3({region: S3_REGION });
		s3.getObject(request, function(error, data) {
			if (error) {
				console.error('AWS S3 GetFile failed');
				reject({ success: false, message: 'AWS S3 GetFile failed', error: error });
			} else {
				resolve({ success: true, message: 'AWS S3 GetFile succeeded', data: data })
			}
		});
	});
};

AmazonS3.prototype.PushUpToS3 = function(bucket, key, data) {

	return new Promise(function(resolve, reject) {

		var s3 = new AWS.S3({ region: S3_REGION });
		
		var params = {
			Bucket: bucket,
			Key: key,
			Body: JSON.stringify(data)
		};

		s3.putObject(params, function (error, data) {

			if (error) {
				reject({ success: false, message: 'AWS S3 PutObject failed', error: error});
			} else {
				resolve({ success: true, message: 'AWS S3 PubOvject passed'});
			}
		
		});

	});

};

// Module Definition
module.exports = AmazonS3;

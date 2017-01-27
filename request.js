'use strict'

const util = require('util');
const vfsUtil = require('vfs-utils');

var Request = function(body) {

    var pmap = {
        "type": [ "type", String, true ],
        "job_id": ["job_id", String, true],
        "details": ["details", Object, true],

        // Person Object Validation 
        "person": ["person", Object, true],

        "sponsorId": ["person.sponsorId", String, true],
        "sponsorKey": ["person.sponsorKey", String, true],
        "clientId": ["person.clientId", String, true],
        "clientKey": ["person.clientKey", String, true],
        "userId": ["person.userId", String, true], // Could user for appid
        "email": ["person.email", String, true], 
        "fullName": ["person.fullName", String, true], 
        "photoUrl": ["person.photoUrl", String, true], 
        "address": ["person.address", Object, true], 
        "roles": ["person.roles", Object, true], 

        // Environment
        "rpcUri": ["rpcUri", String, true],
        "testRpcUri": ["testRpcUri", String, true],
        "develRpcUri": ["develRpcUri", String, true],
        "eventArn": ["eventArn", String, true]
    };

    vfsUtil.service.RequestBase.call(this, body, pmap);
}

util.inherits(Request, vfsUtil.service.RequestBase);

module.exports = Request;
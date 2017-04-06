/*

Modules: environments
Description: createApiStage

*/

'use strict'

module.exports = function(params) {
    var req = new createApiStageRequest(params);

    if(!req.isValid) {
        this.abort(400, req.errorMessage);
        return;
    }

    var tasks = [
        async.apply(getApisFromStage.bind(this), req),
        async.apply(modifyApis.bind(this), req),
        async.apply(createStage.bind(this), req)
    ];

    async.waterfall(tasks, (err, data) => {
        if(err) {
            this.log.error(err);
            this.abort(500, String(err));
        } else {
            this.complete(req.result);
        }
    });
};

function getApisFromStage(req, done) {

	console.log("task1");

	done();
}


function modifyApis(req, done) {

    console.log("task2");

    done();
}

function createStage(req, done) {

	console.log("task2");

	done();
}



var createApiStageRequest = function(body) {

    var pmap = {
        "sourceStage":   [ "sourceStage",   String, true  ],
        "createStage":   [ "createStage", String, true]
    };

    vfsUtil.service.RequestBase.call(this, body, pmap);

    this.result = [];
};
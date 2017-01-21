const ObjectHelpers = require('./ObjectHelpers.js');

module.exports = {
    LogService: require('./LogService.js'),
    IdentLogger: require('./IdentLogger.js'),
    chainMethods: require('./chainMethods.js'),
    buildSnsMessage: require('./buildSnsMessage.js'),
    buildDynamoQuery: require('./buildQuery.js'),
    LambdaVariables: require('./LambdaVariables.js'),
    isNullOrEmpty: ObjectHelpers.isNullOrEmpty,
    propertyIsNullOrEmpty: ObjectHelpers.propertyIsNullOrEmpty,
    propertyPathIsNullOrEmpty: ObjectHelpers.propertyPathIsNullOrEmpty,
    getValueOrDefault: ObjectHelpers.getValueOrDefault,
    service : {
        ServiceBase: require('./ServiceBase.js'),
        RequestBase: require('./RequestBase.js')
    },
    validators: require('./Validators.js')
};


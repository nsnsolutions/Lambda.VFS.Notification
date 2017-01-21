module.exports = function(arn, payload) {
    return {
        TopicArn: arn,
        MessageStructure: 'json',
        Message: JSON.stringify({
            default: JSON.stringify(payload)
        })
    };
};

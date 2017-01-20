module.exports = function(table, key, index) {
    var expr = [];

    var query = {
        TableName: table,
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {}
    };

    var i = 0;
    for (var k in key) {

        if(!key.hasOwnProperty(k))
            continue;

        var k_value = key[k];
        var f = "#f%d".format(i);
        var v = ":v%d".format(i);
        i++;

        expr.push("%s = %s".format(f, v));
        query.ExpressionAttributeNames[f] = k;
        query.ExpressionAttributeValues[v] = k_value;
    }

    query.KeyConditionExpression = expr.join(" and ");

    if(typeof index !== 'undefined' && index != null && index != "")
        query.IndexName = index;

    return query;
}


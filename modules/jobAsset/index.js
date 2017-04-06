/*
 * List each method by name in the map. 
 * Example function:
 * function(params) {
 *   self.complete("I got %j".format(params));
 * }
 *
 * !IMPORTANT: Method is called bound to the context of Service.
 *
 * Arguments: 
 * - params: A map containing the params of the service level request object.
 */

module.exports = {
    requeueJob: require('./requeueJob'),
};
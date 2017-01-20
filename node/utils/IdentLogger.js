'use strict';

/*
 * IdentLogger is a proxy object that wrapps winston. It creates a Papertrail
 * transport that will communicate with VFS's logging system. 
 *
 * The concept of an 'Identity' is identical to that in
 * VFS.Models.Log.LoggingIdentity.  You can have multiple identities for a
 * single log record or no identities. The public and private modifiers only
 * apply to records that have one or more identites.
 *
 * Example Usage:
 *  var Logger = require('IdentLogger');
 *  var logger = Logger.createLogger();
 *
 *  logger.setIdentity('abc123');
 *  logger.info("This is a private log for identity abc123");
 *  logger.info("This is a public log for identity abc123", true);
 *
 *  logger.addIdentity('xyz789');
 *  logger.infoPublic("This is a public log for identity abc123 and xyz789");
 *  logger.infoPrivate("This is a private log for identity abc123 and xyz789");
 *
 *  logger.setIdentity(['foo', 'bar']);
 *  logger.log('info', "This is a private message for foo and bar", false);
 *  logger.log('info', "This is a public message for foo and bar", true);
 *
 * Parameters:
 *  log2Console: If true, log output to console in addition to papertrail. Default: false
 *  hostname: Tells PT the hostname this logger is running on. Default: 'lambda'
 *  program: Tells PT what program is being logged. Default: 'UNKNOWN'
 *  level: Sets the loglevel. Default: Debug.
 *  host: The PT destination. Default: 'logs3.papertrailapp.com'
 *  port: The PT destination port. Default: 38682
 *  attemptsBeforeDecay: How many retries should be attempted before backing off. Default: 5
 *  maximumAttempts: How many retries before disabling buffering. Default: 25
 *  connectionDelay: How log between backoff in milliseconds. Default: 1000
 *  maxDelayBetweenReconnection: The max backoff in milliseconds. Default 60000
 *  maxBufferSize: The max size of the retry buffer, in bytes. Default 1048576
 */

var util = require('util');
var chainMethods = require('./chainMethods.js');
var winston = require('winston');
var moment = require('moment');

// Addes Papertrail Transport to winston.transports.
require('winston-papertrail').Papertrail;

var _GENERAL_FAULT = "The system trapped an exception while processing the request. The task is unable to continue.";
var _FATAL_FAULT = "The system has encountered an unexpected error while processing the request.";

var _default_level = 'debug';
var _levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

var _IdentLogger = function(logger, identity) {
    this.ident = {
        _public: "",
        _private: ""
    };

    this.baseLogger = logger;

    if (identity)
        this.setIdentity(identity);
}

_IdentLogger.FATAL_FAULT = _FATAL_FAULT;
_IdentLogger.GENERAL_FAULT = _GENERAL_FAULT;

/*
 * NOTE: ** Turned off papertrail logging as of 2016/5/03 ** 
 * It seemed to be crashing some of the lambdas.
 */

_IdentLogger.createLogger = function(conf, identity) {

    if (typeof conf === 'undefined')
        conf = {}

    var _transports = [getConsoleTransport(conf)];

    var _logger = new winston.Logger({
        levels: _levels,
        level: (conf.level ? conf.level : _default_level),
        transports: _transports,
    });

    return new _IdentLogger(_logger, identity);
};

_IdentLogger.createFromContext = function(context, level) {
    return _IdentLogger.createLogger({
        level: level,
        log2Console: true, // **  this does nothing after removing papertrail logging on 2016/5/03 **
        program: util.format(
            "%s.%s",
            context.functionName,
            context.functionVersion
        )
    }, util.format("AWSID: %s", context.awsRequestId || moment().format("x")));
};

_IdentLogger.prototype.logFatal = function() {
    this.log('error', this.FATAL_FAULT, true);
};

_IdentLogger.prototype.logFault = function() {
    this.log('error', this.GENERAL_FAULT, true);
};

_IdentLogger.prototype.forIdent = function(identity) {
    /*
     * Create a new Identity Logger with it's own identity using the same
     * base logging connection.
     *
     * Arguments:
     *  identity: A string or list of strings that represent the identity of
     *  the new logger.
     *
     * Returns:
     *  A new IdentLogger containing the same underlaying logger connection.
     */

    return new _IdentLogger(this.baseLogger, identity);
};

_IdentLogger.prototype.log = function(sev, message, isPublic) {
    /*
     * Generic log method to log to given sev level.
     * Arguments:
     *   sev: The loglevel to publish this under.
     *   message: the message to publish in the log.
     *   isPublic: If identities are used, use a public identity if true.
     */

    var _identity = this._getIdentity(Boolean(isPublic));
    this.baseLogger[sev](_identity + message);
};

_IdentLogger.prototype.setIdentity = function(ident) {
    /*
     * Overwrite the current identity with the given identity. Identity can be
     * a string or an array.
     */

    if (typeof ident === 'string')
        ident = [ident];

    this.ident._public = util.format("[%s]", ident.join("]["));
    this.ident._private = util.format("<%s>", ident.join("><"));
};

_IdentLogger.prototype.addIdentity = function(ident) {

    /*
     * Add an additional identitiy to the identities that already exist.
     */

    this.ident._public += util.format("[%s]", ident);
    this.ident._private += util.format("<%s>", ident);
};

for(var _l in _levels) {

    /*
     * Create a method for each log level specified in _levels.
     * Also create a public and private version of the same.
     * This snip uses a wrapper to get around a scope issue. If you know a better
     * way, please update this code.
     */

    _IdentLogger.prototype[_l] = _logWrapper(_l);
    _IdentLogger.prototype[_l + "Public"] = _logWrapperForceVisability(_l, true);
    _IdentLogger.prototype[_l + "Private"] = _logWrapperForceVisability(_l, false);
};

_IdentLogger.prototype.logContextFailure = function(context, isPublic) {
    var logger = this;

    var _ = function() {
        logger.log('error', arguments[0], isPublic);
        return arguments;
    };

    context.fail = chainMethods(context.fail, _);
};

_IdentLogger.prototype._getIdentity = function(isPublic) {
    if (isPublic && this.ident._public != "")
        return this.ident._public + " ";

    else if (this.ident._private != "")
        return this.ident._private + " ";

    return "";
};

module.exports = _IdentLogger;

/* 
 * Utility Function
 * These are private functions that should not be called outside of this file.
 */

function _logWrapper(sev) {
    var fn = function(message, isPublic) {
        return this.log(sev, message, isPublic);
    };
    return fn;
};

function _logWrapperForceVisability(sev, isPublic) {
    var fn = function(message) {
        return this.log(sev, message, isPublic);
    };
    return fn;
};

function formatLog(sev, message) {
    var _sev = (typeof sev === 'undefined' ? 'INFO' : sev.toUpperCase());
    return util.format("%s - %s", _sev, message);
};

function getPtTransport(conf) {
    return new winston.transports.Papertrail({
        disableTls: true, 
        inlineMeta: false,
        hostname: (conf.hostname ? conf.hostname : 'Lambda'),
        program: (conf.program ? conf.program : 'UNKNOWN'),
        level: (conf.level ? conf.level : _default_level),
        host: (conf.host ? conf.host : 'logs3.papertrailapp.com'),
        port: (conf.port ? conf.port : 38682),
        attemptsBeforeDecay: (conf.attemptsBeforeDecay ? conf.attemptsBeforeDecay : 5),
        maximumAttempts: (conf.maximumAttempts ? conf.maximumAttempts : 25),
        connectionDelay: (conf.connectionDelay ? conf.connectionDelay : 1000),
        maxDelayBetweenReconnection: (conf.maxDelayBetweenReconnection ? conf.maxDelayBetweenReconnection : 60000),
        maxBufferSize: (conf.maxBufferSize ? conf.maxBufferSize : 1048576),
        logFormat: formatLog,
        handleExceptions: true
    })
};

function getConsoleTransport(conf) {
    return new winston.transports.Console({
        level: (conf.level ? conf.level : _default_level),
        formatter: function(a) { return formatLog(a.level, a.message); },
        timestamp: function() { return moment().format('M/DD HH:mm:ss a'); },
        colorize: true
    })
};

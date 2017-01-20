'use strict';

var logLevels = [
    'debug',   // 0
    'info',    // 1
    'error',   // 2
    'none'     // 3
];

var LogService = function(logLevel) {
	this.logLevel = (logLevel)
		? logLevels.indexOf(logLevel)
		: 1; //Decfault to Info
};

LogService.prototype.debug = function(message, data) {
	if (this.logLevel <= 0) {
		console.log(message);
		if (data) console.log(data);
	}
};

LogService.prototype.info = function(message, data) {
	if (this.logLevel <= 1)
		console.log(message);
	if ((data) && (this.logLevel <= 0))
		console.log(data);
};

LogService.prototype.error = function(message, data) {
	if (this.logLevel <= 2)
		console.error(message);
	if ((data) && (this.logLevel <= 0))
		console.error(data);
};

// Module Definition
module.exports = LogService;

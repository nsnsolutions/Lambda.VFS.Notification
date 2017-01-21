'use strict'

const util = require('util');
const EventEmitter = require('events');

var ServiceBase = function() {
    EventEmitter.call(this);
};
util.inherits(ServiceBase, EventEmitter);

ServiceBase.prototype.complete = function(data) {
    var _dat = {
        code: 200,
        data: data,
        error: null
    }

    this.emit('complete', _dat);
    this.emit('done', _dat);
};

ServiceBase.prototype.abort = function(code, error) {
    var _dat = {
        code: code,
        data: null,
        error: error
    }

    this.emit('abort', _dat);
    this.emit(String(code), _dat);
    this.emit('done', _dat);
};

module.exports = ServiceBase;

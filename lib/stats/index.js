'use strict';

var debuglog = require('util').debuglog('agent');
var Subscriber = require('cote').Subscriber;
var qprocs = require('./queueProcesses');
var queues = require('./queues');

var metrics = {};


module.exports.init = function init(client) {
    var subscriber = new Subscriber({
        name: 'agentSubscriber',
        subscribesTo: ['metrics:pub']
    });

    subscriber.on('metrics:pub', function (packet) {
        debuglog('processing msg packet:', packet);
        qprocs.refreshMetrics(metrics, client.apps, packet);
        queues.refreshMetrics(metrics, packet);
    });
};

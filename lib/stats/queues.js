'use strict';

var debuglog = require('util').debuglog('agent');
var Probe = require('pmx').probe();

var queues = module.exports;


queues.initMetrics = function initMetrics(name, metrics) {

    if (metrics[name]) {
        return;
    }

    debuglog('initializing metrics for queue:', name);
    metrics[name] = {};

    metrics[name].status = Probe.metric({
        name: 'queueStatus ' + name,
        value: 'N/A',
        agg_type: 'none'
    });

    metrics[name].activeJobs = Probe.counter({
        name: 'activeJobs ' + name,
        agg_type: 'sum'
    });

    metrics[name].failedJobs = Probe.counter({
        name: 'failedJobs ' + name,
        agg_type: 'sum'
    });

};

queues.refreshMetrics = function refreshMetrics(metrics, packet) {
    debuglog('processing metric for queue:', packet.queue);
    // attempt to initialize (if needed)
    queues.initMetrics(packet.queue, metrics);

    var metric = metrics[packet.queue][packet.type];

    if (!metric) {
        debuglog('no metric defined for metric type:', packet.type);
        return;
    }

    debuglog('queue metric type:', packet.type);
    if (packet.type === 'status') {
        metric.set(packet.data.value);
    } else {
        if (packet.data.value < 0) {
            metric.dec();
        } else {
            metric.inc();
        }
    }
};

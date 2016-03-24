'use strict';

var _ = require('lodash');
var debuglog = require('util').debuglog('agent');
var Probe = require('pmx').probe();

var qprocs = module.exports;


qprocs.initMetrics = function initMetrics(id, name, metrics) {

    if (metrics[id]) {
        return;
    }

    debuglog('initializing metrics for process:', id);
    metrics[id] = {};

    metrics[id].jobCompleted = Probe.meter({
        name: name + ' jobCompleted/sec',
        samples: 1, // default value
        timeframe: 60   // default value
    });

    metrics[id].jobFailed = Probe.meter({
        name: name + ' jobFailed/sec',
        samples: 1, // default value
        timeframe: 60   // default value
    });

};

qprocs.refreshMetrics = function refreshMetrics(metrics, apps, packet) {
    debuglog('total apps:', apps.length);
    var proc = _.find(apps, 'name', packet.from) || _.find(apps, 'modname', packet.from);
    if (!proc) {
        debuglog('unrecognized process:', packet);
        return;
    }

    debuglog('metrics from process id:', proc.id);

    // attempt to initialize metrics (if needed)
    qprocs.initMetrics(proc.id, proc.name, metrics);
    var metric = metrics[proc.id][packet.type];

    if (!metric) {
        debuglog('no metric defined for metric type:', packet.type);
        return;
    }
    metric.mark();
};

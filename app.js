'use strict';

var pmx = require('pmx');
var debuglog = require('util').debuglog('agent');
var clientFactory = require('./lib/clientFactory');
var httpInterface = require('./lib/httpInterface');
var stats = require('./lib/stats');
var actions = require('./lib/actions');

pmx.initModule({

    // Options related to the display style on Keymetrics
    widget: {

        // Module colors
        // 0 = main element
        // 1 = secondary
        // 2 = main border
        // 3 = secondary border
        theme: ['#141A1F', '#222222', '#3ff', '#3ff'],

        // Section to show / hide
        el: {
            probes: true,
            actions: true
        },

        // Main block to show / hide
        block: {
            actions: true,
            issues: true,
            meta: false,

            main_probes: []
        }

    }

}, function (err, conf) {
    var port = process.env.PM2_AGENT_HTTP_PORT || conf.http_port;

    debuglog('agent starting up...');
    clientFactory.build().then(function (client) {
        actions.init(client);
        stats.init(client);
        httpInterface.start(client, port);
    });

});

'use strict';

var pmx = require('pmx');


module.exports.init = function init(client) {

    pmx.action('stop', function (param, reply) {
        client.stop(param).then(function (result) {
            return reply(result.data);
        });
    });

    pmx.action('restart', function (param, reply) {
        client.restart(param).then(function (result) {
            return reply(result.data);
        });
    });

    pmx.action('scale up', function (param, reply) {
        client.scaleup(param).then(function (result) {
            return reply(result.data);
        });
    });

    pmx.action('scale down', function (param, reply) {
        client.scaledn(param).then(function (result) {
            return reply(result.data);
        });
    });

};

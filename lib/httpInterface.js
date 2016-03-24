'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var http = require('http');
var URL = require('url');
var debuglog = require('util').debuglog('agent');

var Client;

var defaultRoute = Promise.method(function () {
    return {code: 404, data: {err: 'Not Found'}};
});

function handleRequest(req, res, route) {
    var promise;

    debuglog('handling request for route:', route);
    if (route.key) {
        promise = route.fn(route.key);
    } else {
        promise = route.fn();
    }

    promise.then(function (result) {
        debuglog('route result:', result);
        res.statusCode = result.code || 200;
        res.write(JSON.stringify(result.data));
        return res.end();
    });
}

function determineRoute(pathname) {
    debuglog('determineRoute for pathname:', pathname);
    var parts = _.compact(pathname.split('/'));
    debuglog('pathname parts:', parts);
    var route = {
        fn: defaultRoute,
        key: null
    };

    if (parts.length === 0) {
        route.fn = Client.list;
    }

    if (parts.length === 1 && Client[parts[0]]) {
        route.fn = Client[parts[0]];
    }

    if (parts.length === 2) {
        route.fn = Client[parts[0]];
        route.key = parts[1];
    }

    debuglog('returning route:', route);
    return route;
}

module.exports.start = function start(client, port) {
    Client = client;

    debuglog('starting http server on port', port);
    http.createServer(function (req, res) {
        // Add CORS headers to allow browsers to fetch data directly
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers',
            'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With');
        res.setHeader('Access-Control-Allow-Methods', 'GET');

        // We always send json
        res.setHeader('Content-Type', 'application/json');

        var route = determineRoute(URL.parse(req.url).pathname);
        handleRequest(req, res, route);

    }).listen(port);
};

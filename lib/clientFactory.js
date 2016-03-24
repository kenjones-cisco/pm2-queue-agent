'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var pm2 = Promise.promisifyAll(require('pm2'));
var debuglog = require('util').debuglog('agent');


// provides the common functionality of each functional API
function wrapper(fn) {
    return function () {
        var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
        debuglog('execute wrapper function...with arguments:', args);

        return fn.apply(this, args).then(function (data) {
            debuglog('all done send back the results', data);
            return data;
        }).catch(function (err) {
            debuglog('pm2 call failed:', err);
            return {
                code: 400,
                data: err.message || err
            };
        });
    };
}

// All functional APIs
var client = module.exports = {
    cacheInterval: null,
    apps: []
};

client.build = function build() {
    return pm2.connectAsync().then(function () {
        debuglog('pm2 connected');
        client.cacheInterval = setInterval(client.cacheApps.bind(client), 2000);
        return client;
    }).catch(function (err) {
        throw err;
    });
};

client.exit = function exit() {
    debuglog('agent shutting down');
    clearInterval(client.cacheInterval);
    try {
        pm2.disconnect();
    } catch (e) {
        // nothing to do
    }
};

client.cacheApps = function cacheApps() {
    pm2.listAsync().then(function (results) {
        client.apps = _.map(results, function (app) {
            return {
                id: app.pm_id,
                name: app.name,
                modname: app.pm2_env.pm_exec_path
            };
        });
    }).catch(function (err) {
        console.error('Failed to cache apps', err); // eslint-disable-line
    });
};

client.list = wrapper(function list() {
    debuglog('list all processes...');
    return pm2.listAsync().then(function (results) {
        debuglog('pm2 list successful, return results:', results);
        return {
            data: results
        };
    });
});

client.status = wrapper(function status(name) {
    debuglog('get status of process ' + name);
    if (!name) {
        return Promise.reject(new Error('Process name required parameter'));
    }
    // seems the input parameter says id but it will check and use the
    // name as well.
    return pm2.describeAsync(name).then(function (result) {
        if (_.isEmpty(result)) {
            return Promise.reject(new Error('Unknown Process name: ' + name));
        }
        // TODO(kenjones): add support for multiple instances
        // right now assume name is unique but because multiple instances
        // of a process can be running and managed by a single pm2 manager
        // it could be a list of values and not a single.
        return {
            data: _.pick(result[0].pm2_env, 'status')
        };
    });
});

client.metrics = wrapper(function metrics(name) {
    debuglog('get metrics of process ' + name);
    if (!name) {
        return Promise.reject(new Error('Process name required parameter'));
    }
    // seems the input parameter says id but it will check and use the
    // name as well.
    return pm2.describeAsync(name).then(function (result) {
        if (_.isEmpty(result)) {
            return Promise.reject(new Error('Unknown Process name: ' + name));
        }
        // TODO(kenjones): add support for multiple instances
        // right now assume name is unique but because multiple instances
        // of a process can be running and managed by a single pm2 manager
        // it could be a list of values and not a single.
        return {
            data: {
                metrics: _.get(result[0].pm2_env, 'axm_monitor')
            }
        };
    });
});

client.stop = wrapper(function stop(name) {
    debuglog('stop process ' + name);
    if (!name) {
        return Promise.reject(new Error('Process name required parameter'));
    }
    return pm2.stop(name).then(function (data) {
        return {
            data: data
        };
    });
});

client.restart = wrapper(function restart(name) {
    debuglog('restart process ' + name);
    if (!name) {
        return Promise.reject(new Error('Process name required parameter'));
    }
    return pm2.restart(name).then(function (data) {
        return {
            data: data
        };
    });
});

client.scale = wrapper(function scale(name, number) {
    debuglog('scale process ' + name);
    if (!name) {
        return Promise.reject(new Error('Process name required parameter'));
    }
    return pm2.scale(name, number).then(function (data) {
        return {
            data: data
        };
    });
});

client.scaleup = wrapper(function scaleup(name) {
    debuglog('scale up process ' + name);
    return client.scale(name, 1);
});

client.scaledn = wrapper(function scaledn(name) {
    debuglog('scale down process ' + name);
    return client.scale(name, -1);
});


process.on('SIGINT', function () {
    client.exit();
    setTimeout(function () {
        process.exit(0); // eslint-disable-line
    }, 200);
});

'use strict';

var debuglog = require('util').debuglog('tester');
var Publisher = require('cote').Publisher;

var publisher = new Publisher({
    name: 'metricPublisher',
    broadcasts: ['metrics:pub']
});

function send(msg) {
    publisher.publish('metrics:pub', msg);
}

function sendJobCompleted(change) {
    send({
        type: 'jobCompleted',
        from: change ? 'agent' : 'fake',
        queue: 'test',
        data: {
            value: 1
        }
    });
}

function sendJobFailed(change) {
    send({
        type: 'jobFailed',
        from: !change ? 'agent' : 'fake',
        queue: 'test',
        data: {
            value: 1
        }
    });
}

function sendQueueStatus(change) {
    send({
        type: 'status',
        from: 'testApp1',
        queue: 'test',
        data: {
            value: change ? 'online' : 'offline'
        }
    });
}

function sendQueueActiveJobs(change) {
    send({
        type: 'activeJobs',
        from: 'testApp1',
        queue: 'test',
        data: {
            value: change ? 1 : -1
        }
    });
}

function sendQueueFailedJobs(change) {
    if (!change) {
        return;
    }
    send({
        type: 'failedJobs',
        from: 'testApp1',
        queue: 'test',
        data: {
            value: 1
        }
    });
}
var flag = true;

function start() {
    setInterval(function () {

        debuglog('sending message with flag', flag);

        sendJobCompleted(flag);
        sendJobFailed(flag);

        sendQueueStatus(flag);
        sendQueueActiveJobs(flag);
        sendQueueFailedJobs(flag);

        // flip the flag
        flag = !flag;

    }, 1000);

}

publisher.on('ready', function () {
    start();
});

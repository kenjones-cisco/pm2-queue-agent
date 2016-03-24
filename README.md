Monitor, measure, and interact with managed processes via agent.

## Features

- Enhanced HTTP Interface
- Pub/Sub metrics collector
- Integration with PMX Dashboard


### Available Endpoints

| Path | Description |
|------|-------------|
| `/` | list processes |
| `/list` | list processes |
| `/status/{name}` | status of process by name |
| `/metrics/{name}` | metrics of process by name |
| `/stop/{name}` | stop process by name |
| `/restart/{name}` | restart process by name |
| `/scaleup/{name}` | scale up process by name |
| `/scaledn/{name}` | scale down process by name |

Default Port: `9808`
The port can also be set via environment variable `PM2_AGENT_HTTP_PORT`


### Available Actions

*Each expects the name of a process as the parameter*

- stop
- restart
- scale up
- scale down


### Available Metrics

| Metric Type | Dashboard Name | Pub/Sub Type |
|-------------|----------------|--------------|
| METER | {process name} jobCompleted/sec | jobCompleted |
| METER | {process name} jobFailed/sec | jobFailed |
| METRIC | queueStatus {queue name} | status |
| COUNTER | activeJobs {queue name} | activeJobs |
| COUNTER | failedJobs {queue name} | failedJobs |


Metrics are collected from via Subscription to `metrics:pub` where the expected message payload has the following attributes:

```json
{
    "type": "<metric name>",
    "from": "<process name>",
    "queue": "<queue name>",
    "data": {
        "value": "<actual value>"
    }
}
```

[cote](https://github.com/dashersw/cote) is used to provide the Publish/Subscribe transport mechanism for metrics.

#### Example Publisher

```js
var Publisher = require('cote').Publisher;

var publisher = new Publisher({
    name: 'metricPublisher',
    broadcasts: ['metrics:pub']
});

publisher.on('ready', function () {
    var msg = {
        type: 'status',
        from: 'testApp1',
        queue: 'test',
        data: {
            value: 'online'
        }
    };
    publisher.publish('metrics:pub', msg);
});
```


### Debugging

```bash
export NODE_DEBUG=agent
```

By setting the environment variable `NODE_DEBUG` to `agent` then additinal logging via `util.debuglog` will be displayed.

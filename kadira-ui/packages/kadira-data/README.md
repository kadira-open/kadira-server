# Kadira Data

Kadira Data package is the way how we interact with the Kadira's Data layer. It has parts in both server and the client. 

In this guide, you can learn how to setup Kadira Data Layer locally and interact with it using this package.

## Setup Kadira Data

Setting Up Kadira Data is easy. Let's start.

#### MongoDB
Basically, you need to run a local MongoDB server(as you normally use with Kadira UI). It needs to run on port 27017.

It needs to run as a MongoDB replica set. See: https://meteorhacks.com/lets-scale-meteor#configure-mongodb

#### Kadira Engine

Kadira Engine collects data and save to the MongoDB. You need to run it locally.

For that, 

* Clone this project: https://github.com/arunoda/meteor-apm-engine
* Go to that project and invoke `npm install`
* After that, run it with `node server`
* Then, there will be a HTTP server running on `http://localhost:11011`
* That's our engine

#### Kadira RMA

Collecting data is just a one part. Other part is to aggregate data. That's what RMA does. RMA lives in the above project. (`meteor-apm-engine`).

In order to run RMA simply run `sh start-rma.sh`. Then all the metrics will start to aggregating.

#### Sending Data from Apps

Now, everything is ready and apps can send data. For that, first you need to create an app from the local Kadira UI. Then, you need to configure appId, passwords and set the endpoint to the locally running kadira engine which is on `http://localhost:11011`.

Check here on how to do it: https://gist.github.com/arunoda/554cfc3111267a8a7600

## Learn Kadira Data Format

Kadira use few collections inside the DB store different kind of data. For an example:

* pubsub data in pubMetrics
* methods data in methodsMetrics
* system data in systemMetrics

You can see an introduction on which kind of data we use in this [PROTOCOL](https://github.com/arunoda/meteor-apm-engine/blob/master/PROTOCOL.md) definition.

It's not complete and include all the data we track. But you can get a sense of what we are tracking.

Then, send data from a real app(like [Telescope](https://github.com/TelescopeJS/Telescope)) and see what metrics we are tracking.

## Using Kadira

Now we can use this package to get data from the Kadira Data layer and send it to client for different uses (like rendering charts and so on.).

We've two kind data.

1. Metrics - metrics like CPU, response time
2. Traces - A method trace or public trace

Getting Data is a two step process.

1. Define what you want (using aggregation pipelines)
2. Fetch data from the client

Let's discover how to do it.

### 1. Define the data you want

Now, we need to define what kind of data we need. We need to do it in the server. In the Kadira UI, we've places them at `<kadira-ui-path>/server/kadira_data_definitions`.

Let's try to see a sample data definition:

~~~js
KadiraData.defineMetrics('timeseries.memory', 'systemMetrics', function(args) {
  var groupByHost = args.groupByHost;
  var query = args.query;

  var pipes = [];
  pipes.push({$match: query});
  pipes.push({$group: buildGroup()});
  pipes.push({$sort: {_id: 1}});
  return pipes;

  function buildGroup() {
    var groupDef = {_id: {time: '$value.startTime'}};
    if(groupByHost) {
      groupDef._id.host = '$value.host';
    }

    groupDef.memory = {'$avg': '$value.memory'};
    return groupDef;
  }
});
~~~

* `timeseries.memory` is the key for this definition. That's how client can request this data
* `systemMetrics` is the collection we need to get/aggregate data
* `args` is the a set of arguments sent from the client
* `args.query` is the MongoDB query definition based on the args. It's already done by Kadira Data for each of use. But, you can use whatever you like.

Now, inside the kadira data callback, you can create a MongoDB pipeline return it. Then kadira data will fetch these data and aggregate based on pipe when we invoked a data request from the client.

> Defining traces is also the same.

### 2. Fetch Data From Client

This is also very easy. We have two API to deal with this. There is a low level API, but we don't need to use it. Most of the times, we can rely on a FlowComponent Mixin provided by Kadira Data.

This is how to use it.

~~~js
var component = FlowComponents.define('cpuChart', function(props) {
  this.autorun(function() {
    var time = ;
    var host = FlowRouter.getQueryParam('host');
    var res = FlowRouter.getQueryParam('res') || '1min';
    var appId = FlowRouter.getParam('appId');
    var isRealtime = !time;
    var groupByHost = !!this.get('groupByHost');

    // this could be anything and it's used to identify 
    // different set of kadira data metrics inside a single component
    this.nameForMetric = 'timeseries';
    // the data definition we need to invoke
    var dataKey = 'timeseries.memory';
    // arguments we are going to pass to the server
    var args = {
      time: FlowRouter.getQueryParam('date'), 
      host: FlowRouter.getQueryParam('host'),
      res: FlowRouter.getQueryParam('res') || '1min',
      appId: FlowRouter.getParam('appId'),
      realtime: !FlowRouter.getQueryParam('date')
    };

    // ask the server to send the data
    this.kdFindMetrics(this.nameForMetric, dataKey, args);
  });
});

// extend this component with the `KadiraData.FlowMixin`
// If will provide few methods like `kdFindMetrics`
component.extend(KadiraData.FlowMixin);

component.state.chartData = function() {
  var self = this;
  // simply ask for the data
  // see we are using `this.nameForMetric` here. 
  // it's used to reference to get the data
  //
  // `this.kdMetrics().fetch()` is a reactive function and it's re-run 
  // when the data arrives
  var data = this.kdMetrics(this.nameForMetric).fetch() || [];
  return data;
};
~~~

Here we've used `kdFindMetrics` and `kdMetrics` APIs. They are provided by the `KadiraData.FlowMixin` mixin.

Likewise there are another two API called `kdFindTraces`and `kdTraces` to get traces from the server.

#### Adding More Ranges
* add an entry to `KadiraData.Ranges.all` in `kadira_data/ranges.js
* add an entry to `strings.ranges` in `lib/i18n/en.js`
* modify `maxRange` in `config/plans.js` if needed.
* update "change resolutions range from dropdown menu on dashboard" test in`tests/gagarin/e2e/app.js`

#### Read More

For more information, I highly suggest you to read the following resouces and files.

* KadiaData.FlowMixin - `client/flow_mixin.js`
* Data definitions at ``<kadira-ui-path>/server/kadira_data_definitions`
* Search components for `KadiraData.FlowMixin` and how we've used them.
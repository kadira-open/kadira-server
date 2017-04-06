# Kadira APM Protocol

> We've added more stuff into the protocol and it's not updated in this document.

Kadira APM Protocol documents all what we do with Data and how they'll be presented in client, over-the-write and the server.

* APM Client communicates with the APM Engine
* How data received will be saved in the DB
* How those data will be processed and what is the outcome.

## Communication

HTTP will be used to send metrics from client to the server. Currently a new HTTP request will be used per message. But this can be improved with streaming (which is not supported yet).

## Authenticatation

Authentication is very similar to the basicAuth, but simply sending the `appId` and the `secret` over the headers as shown below.

~~~js
{ 
  'apm-app-id': 'EGTEf6YEzHTF638tb',
  'apm-app-secret': 'w4uwysCvzcxP4FnZ5'
}
~~~

## Basic Data Structure

Single message contains more than one information. So a message with empty details will looks like below.

> Each client send data per 20 secs to the engine.

Here's an annotated JSON which shows the dataStructure.

~~~js
{
  //host of the client, currently there is no way to identify multiple processes within the same host
  "host": "Arunodas-MacBook-Pro.local", 
  //contains pre-aggregated metrics of methods
  "methodMetrics": [],
  //contains raw method requests, which documented below.
  "methodRequests": []

  //contains pre-aggregated metrics of publication
  "pubMetrics": [],
  //contains hot subscriptions for a given publication/metric
  "hotSubs": []
}
~~~

## Information About Methods

APM Client sends data about the methods in two ways. 

1. As pre-aggregated metrics (of 10 secs)
2. Raw Method Requests in some special cases

Above 2 section is documeted below.

### 1.Pre-Aggregated Metrics

These are comes with `methodMetrics` array and any document within it contains some staticts of 10 secs. There could be more than 1 document depending on if something goes wrong in the previous message or sending has been delayed.

A structure of a typical document shows below.

~~~js
{
  "startTime": 1389153265729.5, //startTime in timestamp (millis)
  //object containing pre-aggregated metrics per each method executed 
  //between startTime and endTime
  "methods": {
    "hello": {
      "count": 1, //no of methods executed
      "errors": 0, //no of errors happend
      "wait": 1, //avg. wait time 
      "db": 20, //avg. db time (for all db operations)
      "http": 2331, //avg. http time for all http
      "email": 0, //avg. http time for all http
      "async": 1001, //avg. async time used (defined directly with Fibers)
      "compute": 2, //avg. total time spent on CPU itensive tasks 
      "total": 3359 //avg. total time
    }
  },
  "endTime": 1389153265729.5 //startTime in timestamp (millis)
}
~~~

#### Persistance to DB

Above data will be directly saved to DB once they arrived. Data will be saved in `rawMethodsMetrics` collection.

Format is bit different from the above. It will be used to make the map-reduce process more efficient.

~~~js
{
  //uuid.v4 - UUID is used ObjectID is not handled by SmartCollections
  "_id" : "8fa906ce-1ff7-4412-8327-6078e796806e", 
  "value" : {
    "appId" : "EGTEf6YEzHTF638tb",
    "host" : "Arunodas-MacBook-Pro.local",
    "name" : "hello", //name of the method
    //convert timestamp into the Date and store
    //there is no timezone converstion, all the servers (apm's) stay sync in clocks.
    "startTime" : ISODate("2014-01-08T03:54:25.729Z"),
    "endTime" : ISODate("2014-01-08T03:54:25.729Z"), //converted to the date
    "wait" : 1,
    "db" : 20,
    "http" : 2331,
    "email" : 0,
    "async" : 1001,
    "compute" : 2,
    "total" : 3359,
    "errors" : 0,
    "count" : 1
  }
}
~~~

#### Processing Persisted Data

There are on going incremental MapReduce over the above persisted data and the aggregation is happended on appId, name for per paticulate Date Range. (which not previously mapReduced, see `RMA` for more information)

Processed data will be saved into `methodsMetrics` collection. Sample Process data would look like below. It is looks similar to the above, but with some minor changes.

~~~js
{
  "_id" : {
    "appId" : "EGTEf6YEzHTF638tb",
    "host" : "Arunodas-MacBook-Pro.local",
    "method" : "hello",
    "time" : ISODate("2014-01-02T12:39:00Z")
  },
  "value" : {
    "host" : "Arunodas-MacBook-Pro.local",
    "method" : "hello",
    "appId" : "EGTEf6YEzHTF638tb",
    //now startTime is move to the start of the minute
    "startTime" : ISODate("2014-01-02T12:39:00Z"),
    "count" : 1,
    "errors" : 0,
    //means resolution, whether is this data about what time resoulation
    //we've two resolutions for `1min` and `3hour`
    "res" : "1min",
    "wait" : 836,
    "db" : 10,
    "http" : 574,
    "email" : 0,
    "async" : 1001,
    "compute" : 1,
    "total" : 2424
  }
}
~~~

### 2.Raw Method Requests

Raw Method Request is a log showing all the information about a particular method call. APM clients send those is two scenarois. 

1. Method call is too costly and exceeds the threshold. 
2. Method call leads to an error

Format is looks like below.

~~~js
{
  "_id": "JieF9WzC7ikLFzaLe::10",
  "name": "hello", //name of the method
  "session": "JieF9WzC7ikLFzaLe", //sessionId of the method contains
  "methodId": "10", //lowLevel methodId assigned by meteor relates to the above method
  //what is exactly happened on the message, 
  //see following Events documentation below for more info
  "events": [ 
    {
      "type": "start",
      "at": 1389157369899.5
    },
    {
      "type": "wait",
      "at": 1389157369899.5
    },
    ...
  ],
  //aggregated metrics(using above events) for this method call
  "metrics": {
    "wait": 0,
    "db": 8,
    "http": 2426,
    "async": 1001,
    "compute": 2,
    "total": 3438,
    "email": 0
  },
  //indicate the reason for sending the engine. There are two possible values
  //1. max - some costly call for given metric shown with `maxMatric` and if it execeeds the threshold
  //2. error - if there is an error
  "type": "max", 
  "maxMetric": "compute" //indicates the metric max is related to (only type == max)
  "errorCount": 1 //indicates how many time this error occured (only type == error)
}
~~~

Alternatively, we support `events` as an processed array rather than structured object. For an example old events can be written with the folloing method.

Old Events Object
~~~
[
  {type: 'start', at: 1389157369899},
  {type: 'db', at: 1389157369900, data: {coll: "abc", func: "find"}},
  {type: 'db', at: 1389157369901, data: {result: 10}},
  {type: 'complete', at: 1389157369899},
]
~~~

New Events Object

[
  ['start', 0]
  ['db', 1, {coll: "abc", func: "find", result: 10}]
  ['complete', 0]
]

If the client uses this new events model, he needs to send `isEventsProcessed: true` as well to indicate it.

#### Persistance to DB

Raw Methods Requests will be saved in `rawMethodsRequests` collection. There will be no further conversion of transformation later on.
Saved to db **as is** with some minor exceptions shown below.

* _id will be changed with UUID V4
* if type == error, there is a new field called `errorMessage` which is derived the error event (used for querying)
* all the timestamps in the events will be converted to the Date. Again there is no timezone handling, we need to make sure, all the servers are in sync with time.


#### Events

Events is a log contains what exactly happens in method call as is with some additional infomation.

Following Events are tracked

* start - start of the method
* wait - time started waiting
* waitend - end of the wait
* db - start of some db operation (could be read, write or cursor)
* dbend - end of the db operation
* http - start of the http request
* httpend - end of the http request
* async - start of some async operation
* asyncend - end of the async operation
* email - start of sending an email
* emailend - end of sending email
* error - when error happens
* complete - when the method is completed (without an error)

Events comes in an array. Following rules will be applied into them,

* There can have multiple events of the same except start, wait, waitend, error, complete. 
* Must start with start
* Must endwith error or complete but not both
* Just after these events(wait, db, http, email, async), end event should be comes.

Format of an event looks below

~~~js
{
  type: 'db', //typeof the event
  at: 1389157371800 //timestamp when the event happens
  data: {} //optional data object containing some specific information of the event
}
~~~

** Data Object for each event(if exists) shown below **

For `start`
~~~js
{
  "userId": "7sdsd5s66dsdssds" //null or the userId
}
~~~

For `wait`
wait comes with a special array called `waitOn` which has the all the DDP messages it is waiting on.
~~~js
{
  waitOn: [  
    {
      "msg" : "method", //indicate a meteor method
      "id" : "12",
      "method" : "hello" //name of the method
    },
    {
      "msg" : "sub", //indicate a subscription request
      "id" : "bZkXPjbKhJj5f2XZq",
      "name" : "getAllPosts"
    },
    {
      "msg" : "unsub", //indicate an unsubscribe request
      "id" : "XB76ryj6JaqNMgb2C"
    }
  ]
}
~~~

For `db`
~~~js
{
  "coll" : "posts", //collectionName
  "selector" : {}, //selector (does not exist for insert, _ensureIndex, _dropIndex)
  "index": {}, // only for _ensureIndex, _dropIndex
  "func" : "fetch" //write or read function from Meteor.Collection or from the Cursor
}
~~~

For `http`
~~~js
{
  method: "GET", //HTTP method
  url: "http://google.com" //URL for the HTTP Request
}
~~~

For `httpend`
~~~js
{
  statusCode: "200" //HTTP StatusCode
}
~~~

For `error`
~~~js
{
  "error" : {
    "message" : "Method not found [404]", //error message
    //stack trace
    "stack" : "Error: Method not found [404]\n    at _.extend.protocol_handlers.method (packages/livedata/livedata_server.js:517)\n    at sessionProto.protocol_handlers.method (packages/apm/lib/hijack/wrap_session.js:35)\n    at packages/livedata/livedata_server.js:439"
  }
}
~~~

## Information about Pub/Sub

APM Client send Pub/Sub information in two basic ways.

1. Pre-aggregated metrics (every 10 secs)
2. Hot subscriptions per every publication/metric

For more information about the pub/sub can be found in [this hackpad](https://hackpad.com/PubSub-Support-p2moLJNdEG6). This doc is only show how they represent in the Meteor APM. Design details are discussed on the hackpad.

### 1. Pre-aggregated Metrics

These are aggregated metrics for a 10 sec interval. This interval is relevent to the one used in the methods. Here's the sample document looks like. These data will be save into `rawPubMetrics` collection. These values are sent to the server `pubMetrics` field on the data send to the server.

~~~js
{
  "startTime": 1389153265729.5, //startTime in timestamp (millis)
  //object containing pre-aggregated metrics per each publication executed 
  //between startTime and endTime
  "pubs": {
    "postLists": {
      "subs": 10, //new subscriptions (count)
      "unsubs": 8, //new unsubscriptions (count)
      "resTime": 1045, //average response time (avg in millis)
      "bytesBeforeReady": 2322, //amount of data send before the initial ready event
      "bytesAfterReady": 34793, //amount of data send after the initial ready event
      "dataFetched": 3234, //data fetched by the observers (see hackpad for more info) (count in bytes)
      "activeSubs": 30, //total no of subscriptions exists (guage)
      "lifeTime": 8999 //average life time of a subscription (avg in millis),
      "subRoutes": { 
        route1: 6, //total no of subs from route1
        route2: 4,
      },
      "unsubRoutes": {
        route1: 2, //total no of unsubs from route1
        route2: 6,
      }
    }
  },
  "endTime": 1389153265729.5 //startTime in timestamp (millis)
}
~~~

#### Persistance to the DB

These values are stored on the DB as shown below, allowing to support mapReduce, as did with methods.

~~~js
{
  //uuid.v4 - UUID is used ObjectID is not handled by SmartCollections
  "_id" : "8fa906ce-1ff7-4412-8327-6078e796806e", 
  "value" : {
    "appId" : "EGTEf6YEzHTF638tb",
    "host" : "Arunodas-MacBook-Pro.local",
    "pub" : "hello", //name of the publication
    //convert timestamp into the Date and store
    //there is no timezone converstion, all the servers (apm's) stay sync in clocks.
    "subs": 10, //new subscriptions
    "unsubs": 8, //new unsubscriptions
    "resTime": 1045, //average response time
    "bytesBeforeReady": 2322, //amount of data send before the initial ready event
    "bytesAfterReady": 34793, //amount of data send after the initial ready event
    "dataFetched": 3234, //data fetched by the observers (see hackpad for more info)
    "activeSubs": 30, //total no of subscriptions exists
    "lifeTime": 8999 //average life time of a subscription,
    "subRoutes": [
      {name: "route1", count: 6}, 
      {name: "route2", count: 4},
    ],
    "unsubRoutes": [
      {name: "route1", count: 3}, 
      {name: "route2", count: 5},
    ]
  }
}

* `subRoutes` and `unsubRoutes` are persisted as arrays as seen above. That's how we can efficiently use the MongoDB aggregation pipelines.
~~~

#### Processing Persisted Data

There will be few processes, which does incremental aggregate the saved rawPub data. Technically they'll aggregate rawValues very effectively with incremental MapReduce. This will be much similar to the API used in methods. Processed metrics will be stored on `pubMetrics` collection.


Here's sample of a processed json.

~~~js
{
  "_id" : {
    "appId" : "EGTEf6YEzHTF638tb",
    "host" : "Arunodas-MacBook-Pro.local",
    "pub" : "hello",
    "time" : ISODate("2014-01-02T12:39:00Z")
  },
  "value" : {
    "host" : "Arunodas-MacBook-Pro.local",
    "pub" : "hello",
    "appId" : "EGTEf6YEzHTF638tb",
    //now startTime is move to the start of the minute
    "startTime" : ISODate("2014-01-02T12:39:00Z"),
    //means resolution, whether is this data about what time resoulation
    //we've two resolutions for `1min` and `3hour`
    "res" : "1min",
    "subs": 10, 
    "unsubs": 8, 
    "resTime": 1045, 
    "bytesBeforeReady": 2322, 
    "bytesAfterReady": 34793,
    "dataFetched": 3234,
    "activeSubs": 30, 
    "lifeTime": 8999,
    "subRoutes": [
      {name: "route1", count: 6}, 
      {name: "route2", count: 4},
    ],
    "unsubRoutes": [
      {name: "route1", count: 3}, 
      {name: "route2", count: 5},
    ]
  }
}
~~~

#### Persistance to the DB

This will be directly saved to the DB. Following few changes will be applied before that.

* _id will be changed with UUID V4
* all the timestamps in the events will be converted to the Date. Again there is no timezone handling, we need to make sure, all the servers are in sync with time.

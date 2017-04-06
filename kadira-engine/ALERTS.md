# Alerts

This document contains the specification for alerts. Alerts will be saved into the `alerts` collection. Alerts can be modified and deleted.

Alerts can limited by the count based on the plan.

Sample alert document:

~~~js
{
  _id: 'test-alert-1',
  appId: 'testAppId',
  name: 'test alert',
  rearmInterval: 1000*60*5, // in millis
  rules: [
    {
      type: 'methodErrorRatio',
      params: {
        threshold: 0.2
        thresholdCondition: 'greaterThan'
      },
      dataFilter: {
        type: 'continuously',
        params: {
          duration: 1000 //in millis
        }
      },
      host: "$ANY"
    }
  ],
  actions: [
    {
      type: 'email',
      params: {
        address: ['arunoda.susiripala@gmail.com']
      }
    },
    {
      type: 'webhook',
      params: {
        url: ['http://google.com']
      }
    }
  ]
}
~~~


## Rules

There could be different types of rules. Single rule can be seen as below:

~~~js
{
  type: 'pctMethodError',
  params: {
    threshold: 0.2
    thresholdCondition: 'greaterThan',
    dataFiler: {
      type: 'continuously',
      duration: 1000 //in millis
    }
  }
}
~~~

These are the default params for all the rules. But in future, there could be other params as well.

`dataFilter` is a special parameter it has few different values. They are listed below.

### List of Rule types

* pctMethodError: Method Error Percentage


### Data Filters

Data Filters used to check how we filter data for rule's action trigger.

type: continuously
~~~js
{
  type: 'continuously',
  params: {
    duration: 1000 //in millis
  }
}
~~~

type: at-least-once
{
  type: 'at-least-once'
}

### Values for Host

There can be few values for `host`. There semantics are shown below:

* $ALL - on all the hosts
* $ANY - on any host
* "the-host" - on a given host
* null - $ALL 
* undefined - $ALL

## Actions

Actions will be trigged, if rules meet their criteria. There are different types of actions. They are listed below.


type: email (for sending emails)
~~~js
{
  type: 'email',
  params: {
    address: 'arunoda.susiripala@gmail.com'
  }
}
~~~

type:wehbook (for calling webhook)
~~~js
{
  type: 'webhook',
  params: {
    url: "http://google.com"
  }
}
~~~

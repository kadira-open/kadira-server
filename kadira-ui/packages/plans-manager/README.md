# Plans Manager

In Kadira we've plans. Our features are mapped to plans. So, we need to look for two main considerations.

1. Some features are only available for given set of plans
2. Some features's capabilities changed based on the plan

Here's how we address each of these solution

## 1. Define Features

Here's how we can define a feature.

~~~js
PlansManager.defineFeature('alerts', ['startup', 'pro', 'business']);
~~~

We've just defined `alerts` feature for `['startup', 'pro', 'business']` plans.
We normally, do this in a place where it's possible to see from both client and the server. In Kadira UI, it's on `config/plans.js`.

Then, we can check this feature available for tha plan or not on anywhere in the code like this:

~~~js
if(PlansManager.allowFeature('alerts', 'pro')) {
    console.log("alerts is available for the pro plan");
}
~~~

You need to do this on both the client and server in necessory places.

There are some handy ways to define a feature. See:

#### Define a feature for all plans
~~~js
PlansManager.defineFeature('dashboard', {all: true});
~~~

#### Define a feature for all plan, but except for few
~~~js
PlansManager.defineFeature('alerts', {except: ["free"]});
~~~

## 2. Define Configurations

Some features and different places in our app requires configurations based on the plan. One such thing is the allow date range for the data. This is how to define that.

~~~js
PlansManager.setConfig("allowedRange", {
  free: 1000 * 3600 * 38, // 38 hours
  solo: 1000 * 3600 * 38, // 38 hours
  startup: 1000 * 3600 * 27 * 15, //15 days
  pro: 1000 * 3600 * 27 * 95, // 95 days
  business: 1000 * 3600 * 27 * 95 // 95 days
});
~~~

Then we can get these configurations like this.

~~~js
var allowedRange = PlansManager.getConfig("allowedRange", "pro");
~~~

These configurations are mainly required for permission checks and alerts.
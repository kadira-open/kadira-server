var EVENTS_OWNER_TO_TEMPLATE = {
  "EventTarget.addEventListener": "error_owner_addEventListener",
  "Template.event": "error_owner_templateEvent",
  "Meteor.subscribe": "error_owner_meteorSubscribe",
  "Connection.subscribe": "error_owner_meteorSubscribe",
  "Meteor.call": "error_owner_meteorCall",
  "Connection.apply": "error_owner_meteorCall",
  "MongoCursor.observe": "error_owner_mongoObserve",
  "MongoCursor.observeChanges": "error_owner_mongoObserve",
  "MongoCursor.fetch": "error_owner_mongoFetch",
  "MongoCursor.forEach": "error_owner_mongoForEach",
  "MongoCursor.map": "error_owner_mongoMap",
  "Deps.flush": "error_owner_depsFlush",
};

var EVENTS_TYPE_TO_TEMPLATE = {
  "Meteor.call": "error_event_methodCall",
  "Connection.apply": "error_event_methodCall",
  "Meteor.subscribe": "error_event_meteorSubscribe",
  "Connection.subscribe": "error_event_meteorSubscribe",
  "MongoCursor.observe": "error_event_mongoObserve",
  "MongoCursor.observeChanges": "error_event_mongoObserveChanges",
  "MongoCursor.fetch": "error_event_mongoFetch",
  "MongoCursor.forEach": "error_event_mongoForEach",
  "MongoCursor.map": "error_event_mongoMap",
  "setTimeout": "error_event_setTimeout",
  "setInterval": "error_event_setInterval",
  "Template.helper": "error_event_templateHelper",
  "Global.helper": "error_event_globalHelper",
  "Template.rendered": "error_event_templateRendered",
  "EventTarget.addEventListener": "error_event_addEventListener",
  "Session.set": "error_event_sessionSet",
  "Router.global": "error_event_ironRouterHook",
  "Router.configure": "error_event_ironRouterHook",
  "Router.route": "error_event_ironRouterHook",
  "RouteController.extend": "error_event_ironRouterHook",
};

var EVENT_TEMPLATE_TO_ARGS = {
  "error_owner_meteorCall": function (data) {
    return {args: JSON.stringify(data.owner.args)};
  },

  "error_owner_meteorSubscribe": function (data) {
    return {args: JSON.stringify(data.owner.args)};
  },

  "error_owner_mongoObserve": function (data) {
    var query = JSON.stringify(data.owner.query);
    return {query: query};
  },

  "error_owner_mongoObserveChanges": function (data) {
    var query = JSON.stringify(data.owner.query);
    return {query: query};
  },

  "error_owner_mongoFetch": function (data) {
    var query = JSON.stringify(data.owner.query);
    return {query: query};
  },

  "error_owner_mongoForEach": function (data) {
    var query = JSON.stringify(data.owner.query);
    var document = JSON.stringify(data.owner.document, null, 2);
    return {query: query, document: document};
  },

  "error_owner_mongoMap": function (data) {
    var query = JSON.stringify(data.owner.query);
    var document = JSON.stringify(data.document, null, 2);
    return {query: query, document: document};
  },

  "error_event_methodCall": function (data) {
    // args are already stringified
    return {args: data.args};
  },

  "error_event_meteorSubscribe": function (data) {
    // args are already stringified
    return {args: data.args};
  },

  "error_event_mongoObserve": function (data) {
    var query = JSON.stringify(data.query);
    return {query: query};
  },

  "error_event_mongoObserveChanges": function (data) {
    var query = JSON.stringify(data.query);
    return {query: query};
  },

  "error_event_mongoFetch": function (data) {
    var query = JSON.stringify(data.query);
    return {query: query};
  },

  "error_event_mongoForEach": function (data) {
    var query = JSON.stringify(data.query);
    var document = JSON.stringify(data.document, null, 2);
    return {query: query, document: document};
  },

  "error_event_mongoMap": function (data) {
    var query = JSON.stringify(data.query);
    var document = JSON.stringify(data.document, null, 2);
    return {query: query, document: document};
  },

  "error_event_sessionSet": function (data) {
    var value = JSON.stringify(data.value);
    return {value: value};
  },

  "error_event_ironRouterHook": function (data) {
    return {route: data.name, path: data.path};
  },
};

Template.methodExpClientEventsDetails.helpers({
  "ownerTemplate": function() {
    // merge both events and info
    // also events cannot be used inside blaze.
    // That's why we are using $events
    this.$events = _.union(this.events, this.info);
    this.$events = _.compact(this.$events);
    _.sortBy(this.$events, function(a, b) {
      a.time = a.time || 0;
      b.time = b.time || 0;
      return a.time - b.time;
    });
    if(this.owner && this.owner.type){
      return EVENTS_OWNER_TO_TEMPLATE[this.owner.type] || "error_owner_default";
    }
  },
  "eventsTemplate": function() {
    return EVENTS_TYPE_TO_TEMPLATE[this.type] || "error_event_default";
  }

});


Template.methodExpEventsShowArgs.helpers({
  "getArgs": function (template, eventInfo) {
    var getArgs = template && EVENT_TEMPLATE_TO_ARGS[template];
    var args = getArgs ? getArgs(eventInfo.data) : [];
    return _(args).map(function (value, key) {
      return {key: key, value: value || ""};
    });
  }
});
/* eslint max-len: 0 */

var helpData = {
  "polled-documents": {
    title: "About Fetched Documents",
    message: "This is the number of documents fetched from MongoDB via observers.",
    url: "http://support.kadira.io/knowledgebase/articles/772737-fetched-documents",
    options: {
      placement: "top"
    }
  },
  "observer-changes": {
    title: "About Observer Changes",
    message: "This is distribution of all the events fired from observers.",
    url: "http://support.kadira.io/knowledgebase/articles/772740-observer-changes",
    options: {
      placement: "top"
    }
  },
  "oplog-notifications": {
    title: "About Oplog Notification",
    message: "This is the number of oplog notifications process by your observers.",
    url: "http://support.kadira.io/knowledgebase/articles/772746-oplog-notifications",
    options: {
      placement: "top"
    }
  },
  "active-subs": {
    title: "About Active Subs",
    message: "This is the number of subscriptions available in the selected time range.",
    options: {
      placement: "top"
    }
  },
  "total-reused-observer-handlers": {
    title: "About Total/Reused Observer Handlers",
    message: "This is number observer handlers created in your app, compared with the reused handlers amoung them.",
    url: "http://support.kadira.io/knowledgebase/articles/772749-total-reused-observer-handlers",
    options: {
      placement: "top"
    }
  },
  "livequery-life-time": {
    title: "About Observer Lifetime",
    message: "This is the lifetime of the observer from the time it was created to its destruction.",
    options: {
      placement: "top"
    }
  }
};

InlineHelp.initHelp(helpData);

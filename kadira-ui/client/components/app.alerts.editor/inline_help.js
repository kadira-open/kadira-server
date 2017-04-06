/* eslint max-len: 0 */

var helpData = {
  "alerts-webhook-help": {
    title: "About Webhooks",
    message: "Webhooks allow different services to communicate each other very easily. You can integrate with services like Slack and Zapier to get notifications when the alert tiggered.",
    url: "http://support.kadira.io/knowledgebase/articles/387372",
    options: {
      placement: "top"
    }
  },
  "alerts-rearm-help": {
    title: "About Rearm",
    message: "After kadira triggers an action for your rules, it will wait few minutes before checking again. When we started to check again, that event is called as Rearm.",
    options: {
      placement: "top"
    }
  },
};

InlineHelp.initHelp(helpData);

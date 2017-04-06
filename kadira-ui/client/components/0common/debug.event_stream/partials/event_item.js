/* eslint max-len: 0 */

var Formatters = {
  "route": function(info) {
    return color("Route", "#4D920A") + " to " + em(info.path);
  },
  "event": function(info) {
    var templateName = info.view.replace(/Template\./, "");
    return color("Fire", "#E14949") + " " + em(info.name) + " on template " + em(templateName);
  },
  "log": function(info) {
    return color("Log: ", "#BA9E9E") + info.message;
  },
  "ddp-method": function(info) {
    var additionInfoText = additionalInfo(_.pick(info, "id"));
    return color("Call", "#28ACDF") + " meteor method " + em(info.name) + additionInfoText;
  },
  "ddp-updated": function(info) {
    var methodNames = em(info.methods.join(", "));
    return color("Receive", "#28ACDF") + " DDP <em>updated</em> message for methods: " + methodNames;
  },
  "ddp-sub": function(info) {
    var additionInfoText = additionalInfo(_.pick(info, "id"));
    return color("Subscribe", "#D22BA1") + " to " + em(info.name) + additionInfoText;
  },
  "ddp-ready": function(info) {
    var subIds = em(info.subs.join(", "));
    return color("Receive", "#D22BA1") + " DDP <em>ready</em> message for subscriptions: " + subIds;
  },
  "ddp-unsub": function(info) {
    return color("Unsubscribe", "#D7832A") + " subscription: " + em(info.id);
  },
  "ddp-nosub": function(info) {
    var msg = color("Subscription", "#D7832A") + " " + em(info.id) + " stopped";
    if(info.error) {
      msg += " with error: " + em(info.error);
    }

    return msg;
  },
  "hcr": function(info) {
    // fixes for typo issue from kadira:debug package
    // fixed it on new versions, but, for users who use older versions
    // will check both for while
    var elapsedTime = (info.elapsedTime) ? info.elapsedTime : info.elasedTime;

    var elapsedTimeInSecs = (elapsedTime/1000).toFixed(2);
    return color("Hot Code Reload", "#3241FF") + " for " + em(elapsedTimeInSecs) + " seconds";
  },
  "live-updates": function(info) {
    var msg =
      color("Live Updates", "#B708DE") + " to collection " + em(info.collection) + ": " +
      em(info.type) + " " + em(info.count) + " docs";

    return msg;
  }
};

Template["kadiraDebug.eventItem"].onRendered(function() {
  Meteor.defer(function() {
    var mydiv = $(".event-stream");
    mydiv.scrollTop(mydiv.prop("scrollHeight"));
  });
});

Template["kadiraDebug.eventItem"].helpers({
  date: function() {
    return moment(this.baseTimestamp).format("hh:mm:ss");
  },
  infoText: function() {
    var eventType = this.type;
    var formatter = Formatters[eventType];
    if(formatter) {
      var infoToFormat = this.info || {};
      return formatter(infoToFormat, this.e);
    } else {
      var info = this.type + " - " + JSON.stringify(this.info);
      return info;
    }
  },
  selectedClass: function() {
    var tab = FlowRouter.getQueryParam("tab");
    var currentActivityTime = FlowComponents.getState("currentActivityTime");
    var currentTraceId = FlowComponents.getState("currentTraceId");

    // multiple selection only allowed 
    // when blaze tab on activities page
    if(tab === "blaze") {
      if(currentActivityTime === this.baseTimestamp) {
        return "selected-item";
      } else {
        return "";
      }
    } else {
      if(currentTraceId === this._id) {
        return "selected-item";
      } else {
        return "";
      }
    }
  },

  // this is use for keep track the item by unique ID
  // for now this use for select the event-item when 
  // trace dialog apears
  id: function() {
    var id = generateUniqueId(this.baseTimestamp + 
      this.type + JSON.stringify(this.info));
    return id;
  }
});

function em(word) {
  return "<em>" + word + "</em>";
}

function additionalInfo(doc) {
  var str = "( ";
  var items = [];
  _.each(doc, function(value, key) {
    items.push(key + ": " + em(value));
  });

  str += items.join(",") + " )";
  return str;
}

function color(text, c) {
  var css = "font-weight: 600;" + "color:" + c;
  var str = "<span style='" + css + " '>" + text + "</span>";
  return str;
}

function generateUniqueId(str){
  var hash = 0;
  if (str.length === 0) {
    return hash;
  }
  
  for (i = 0; i < str.length; i++) {
    char = str.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
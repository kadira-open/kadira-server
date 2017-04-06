TimelineComponent.logics = {
  buildSections(itemTimeline) {
    var times = {};
    itemTimeline.forEach(function(obj) {
      times[obj.event] = obj.timestamp;
    });

    diff = function(one, two) {
      if(typeof times[one] !== "number" || typeof times[two] !== "number") {
        return 0;
      }

      var value = times[one] - times[two];
      // This could be an issue with time diffs
      // Even with that case, we should not return a minus value
      value = (value < 0)? 0 : value;
      return value;
    };

    var initialNetworkTime = diff('server-received', 'start');
    var waitTime = diff('server-waitend', 'server-received');
    var serverTime = diff('server-processed', 'server-waitend');
    var networkTimeForResponse = 0;

    if(times["ready"] !== undefined) {
      networkTimeForResponse = diff('ready', 'server-processed');
    } else if(times["nosub"]) {
      networkTimeForResponse = diff('nosub', 'server-processed');
    } else if(times["updated"]) {
      networkTimeForResponse = diff('updated', 'server-processed');
    }

    var sections = [
      {
        name: "initial-network-time",
        time: initialNetworkTime,
      },
      {
        name: "wait-time",
        time: waitTime,
      },
      {
        name: "server-time",
        time: serverTime,
      },
      {
        name: "network-time-for-response",
        time: networkTimeForResponse,
      }
    ];

    return sections;
  }
};
var _1HOUR = 60 * 60 * 1000;
var _24HOUR = 24 * _1HOUR;

KadiraData.Ranges = {};
KadiraData.Ranges.all = {
  "1hour": {
    value: _1HOUR,
    label: "ranges.range_1hour",
    resolution: "1min"
  },
  "3hour":{
    value: 3 * _1HOUR,
    label: "ranges.range_3hour",
    resolution: "1min"
  },
  "8hour": {
    value: 8 * _1HOUR,
    label: "ranges.range_8hour",
    resolution: "1min"
  },
  "24hour": {
    value: _24HOUR,
    label: "ranges.range_24hour",
    resolution: "30min"
  },
  "3day": {
    value: 3 * _24HOUR,
    label: "ranges.range_3day",
    resolution: "30min"
  },
  "7day": {
    value: 7 * _24HOUR,
    label: "ranges.range_1week",
    resolution: "3hour"
  },
  "30day": {
    value: 30 * _24HOUR,
    label: "ranges.range_30day",
    resolution: "3hour"
  }
};

KadiraData.Ranges.getValue = function(range) {
  var value = KadiraData.Ranges.all[range].value;
  throwErrorIfEmpty(value);
  return value;
};

KadiraData.Ranges.getLabel = function(range) {
  var label = KadiraData.Ranges.all[range].label;
  throwErrorIfEmpty(label);
  return KadiraData.Ranges.all[range].label;
};

KadiraData.Ranges.getResolution = function(range) {
  var resolution = KadiraData.Ranges.all[range].resolution;
  throwErrorIfEmpty(resolution);
  return KadiraData.Ranges.all[range].resolution;
};

KadiraData.Ranges.getRange = function(value) {
  var currentRange;
  for(var range in KadiraData.Ranges.all){
    if(KadiraData.Ranges.all[range].value === value){
      currentRange = range;
      break;
    }
  }
  throwErrorIfEmpty(currentRange);
  return currentRange;
};


function throwErrorIfEmpty(val) {
  if(!val){
    throw new Meteor.Error(403, "unknown range");
  }
}
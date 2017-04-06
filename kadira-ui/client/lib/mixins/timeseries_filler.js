Mixins.TimeseriesFiller = {};
Mixins.TimeseriesFiller.prototype = {};

Mixins.TimeseriesFiller.prototype.addFillerData = function(data, endTime) {
  data = data || [];
  data[0] = data[0] || [];
  // add filler data so chart will always have space for full billing cycle
  var latest = _.last(data)[0];
  if(latest < endTime) {
    var fillersRequired = Math.floor((endTime - latest)/(1000*60*60*24));
    for(;fillersRequired-->0;) {
      latest += (1000*60*60*24);
      data.push([latest, null]);
    }
  }
  return data;
};
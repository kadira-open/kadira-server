var component = FlowComponents.define("debug.activityChart", 
function(props) {
  this.props = props;
  this.set("title", props.title);
  this.set("helperId", props.helperId);
  this.setFn("summary", props.summaryFn);
  this.set("stripTemplate", props.stripTemplate === undefined? true: false);

  this.autorun(this.setScoreBarWidth);
  this.autorun(this.setData);
});

component.state.time = function() {
  var data = this.get("data");
  if(data) {
    return this.cleanTime(data.elapsedTime);
  } else {
    return 0;
  }
};

component.state.count = function() {
  var data = this.get("data");
  if(data) {
    return data.count;
  } else {
    return 0;
  }
};

component.state.tooltip = function() {
  var tooltip = 
    "Spent sum of " +
    this.get("time") + "ms for " + 
    this.get("count") + " activities";

  return tooltip;
};

component.state.items = function() {
  var self = this;
  var data = this.get("data");
  if(data) {
    var items = data.items;
    if(!this.get("showAll")) {
      items = _.first(data.items, 5);
    }
    _.each(items, function(item) {
      item.elapsedTime = self.cleanTime(item.elapsedTime);
    });
    return items;
  } else {
    return [];
  }
};

component.state.hasMore = function() {
  var data = this.get("data");
  if(data) {
    return (data.items.length > 5);
  } else {
    return false;
  }
};  

component.action.toggleShowAll = function() {
  this.set("showAll", !this.get("showAll"));
};

component.prototype.cleanTime = function(time) {
  if(time) {
    return time.toFixed(2);
  } else {
    return 0;
  }
};

component.prototype.setScoreBarWidth = function() {
  var summary = this.get("summary");
  var data = this.get("data");
  var pct = 0;
  if(summary && summary.count >  0 && data) {
    pct = Math.ceil(data.elapsedTime/summary.elapsedTime * 100);
  } else {
    pct = 0; 
  }
  
  this.$(".score-bar").css("width", pct + "%");
};

component.prototype.setData = function() {
  var data = this.props.dataFn();
  this.set("data", data);
  this.set("showAll", false);
};
var _1hourRange = KadiraData.Ranges.getValue("1hour");
var _7dayRange = KadiraData.Ranges.getValue("7day");
var _24hourRange = KadiraData.Ranges.getValue("24hour");

var component = FlowComponents.define("app.datebar", function() {
  this.onRendered(function() {
    this.autorun(function() {
      // liveMode
      var date = FlowRouter.getQueryParam("date");
      var range = this.getRange();

      if(date === undefined) {
        this.set("selectedDateOrMode", "Live Mode");

        $("button#real-time-indicator").attr("disabled", "true");
        $("button#real-time-indicator span.glyphicon").css("color", "red");
        $("button.filter-next").attr("disabled", "true");
      } else {
        date = parseInt(date);
        date = new Date(date);

        this.set("selectedDateOrMode", timeFrame(date, range));
        $("#real-time-indicator").removeAttr("disabled");
        $("button#real-time-indicator span.glyphicon").css("color", "black");
        $("button.filter-next").removeAttr("disabled");
      }
    });
  });
});

component.state.date = function() {
  var date = FlowRouter.getQueryParam("date");
  if(date === undefined) {
    date = Date.now();
  }
  date = parseInt(date);
  date = new Date(date);
  return date;
};

component.state.canShowTimeSlider = function() {
  var range = this.getRange();
  return range <= KadiraData.Ranges.getValue("24hour");
};

component.action.changeDate = function(date) {
  var appId = FlowRouter.getParam("appId");
  $("#date-select-popover-wrap").hide();
  date = moment(date).valueOf();
  var range = this.getRange();
  setDateQueryParam(date, range, appId);
};

component.action.switchToLiveMode = function() {
  FlowRouter.setQueryParams({date: null});
};

component.action.changeUrlFilter = function(param) {
  var appId = FlowRouter.getParam("appId");
  var date = FlowRouter.getQueryParam("date");
  var range = this.getRange();

  date = parseInt(date) || moment().valueOf();

  if(param === "prev") {
    date -= range;
  }
  if(param === "next") {
    date += range;
  }

  setDateQueryParam(date, range, appId);
};

function timeFrame(date, range) {
  var plus = date.getTime() + (range / 2);
  var minus = date.getTime() - (range /2);
  if(range <= _1hourRange){
    return moment(minus).format("MMM Do YYYY HH:mm") + " - " +
      moment(plus).format("HH:mm"); 
  } else if(range > _1hourRange && range < _7dayRange){
    return moment(minus).format("MMM Do YYYY HH:mm") + " - " +
      moment(plus).format("Do HH:mm"); 
  } else if(range >= _7dayRange){
    return moment(minus).format("MMM Do YYYY") + " - " +
      moment(plus).format("MMM Do");
  }
}

function setDateQueryParam(date, range, appId) {

  //remove seconds/hours/minutes according to resolution
  var mDate = moment(date);

  if(range < _24hourRange) {
    mDate = mDate.startOf("minute");
  } else if(range >= _24hourRange && range <= _7dayRange) {
    mDate = mDate.startOf("day");
  } else {
    mDate = mDate.startOf("minute");
  }

  date = mDate.valueOf();

  var plan = Utils.getPlanForTheApp(appId);
  var allowedRange = PlansManager.getConfig("allowedRange", plan);
  var today = moment().valueOf();
  var limit = today - allowedRange;

  if(date > limit ) {
    if(today < date) {
      FlowRouter.setQueryParams({date: null});
    } else {
      FlowRouter.setQueryParams({date: date});
    }
  } else {
    FlowRouter.setQueryParams({date: null});
    FlowRouter.setQueryParams({"denied": "date"});
  }
}

component.extend(Mixins.Params);
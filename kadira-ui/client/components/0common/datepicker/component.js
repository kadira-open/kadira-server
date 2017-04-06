var component = FlowComponents.define("datepicker", function(params) {
  this.setFn("currentDate", params.currentDateFn);
  this.setFn("canShowTimeSlider", params.canShowTimeSliderFn);
  this.isInitComplete = false;
  this.autorun(function() {
    var currentDate = params.currentDateFn() || new Date();
    if(this.isInitComplete){
      var hour = currentDate.getHours();
      this.set("dateHour", hour);

      var minute = currentDate.getMinutes();
      this.set("dateMinutes", minute);

      this.$(".time-slider .hour").slider("setValue", hour);
      this.$(".time-slider .minute").slider("setValue", minute);
    }
  });
});

component.action.onInit = function() {
  var options = {
    showMeridian: true,
    todayBtn: false,
    todayHighlight: true,
    minView: "month"
  };

  var hourSliderOptions = {min: 0, max: 23, value: this.get("dateHour")};
  var hourSlider = this.$(".time-slider .hour").slider(hourSliderOptions);
  var minuteSliderOptions = {min: 0, max: 59, value: this.get("dateMinutes")};
  var minuteSlider = this.$(".time-slider .minute").slider(minuteSliderOptions);

  this.$(".date-select-popover")
    .datetimepicker(options)
    .on("changeDate", this.onDateChanged.bind(this));

  minuteSlider.on("slideStop", this.onMinutesChanged.bind(this));
  hourSlider.on("slideStop", this.onHoursChanged.bind(this));
  this.isInitComplete = true;
};

component.prototype.onDateChanged = function(event) {
  var mDate = moment(event.date);
  var hour = this.get("dateHour") || 0;
  var minute = this.get("dateMinutes") || 0;
  mDate = mDate.startOf("day").add(hour, "hours").add(minute, "minutes");
  date = mDate.toDate();

  this.set("currentDate", date);
};

component.prototype.onHoursChanged = function(event) {
  var date = this.get("currentDate");
  date.setHours(event.value || 0 );
  this.set("dateHour", event.value || 0 );
  this.set("currentDate", date);
};

component.prototype.onMinutesChanged = function(event) {
  var date = this.get("currentDate");
  this.set("dateMinutes", event.value || 0 );
  date.setMinutes(event.value || 0 );
  this.set("currentDate", date);
};

component.state.stringifyValue = function(valueLabel) {
  return addZeroToValue(this.get(valueLabel));
};

function addZeroToValue(value){
  return (value < 10) ? "0" + value : value;
}
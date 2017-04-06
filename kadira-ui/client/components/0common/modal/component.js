var component = FlowComponents.define("modal", function(props) {
  this.modalId = props.id || Meteor.uuid();

  this.set("modalId", this.modalId);
  this.modalClass = props.modalClass || "";
  this.set("modalClass", this.modalClass);
  this.setFn("title", props.titleFn);
  this.setFn("canShow", props.canShowFn);

  this.onClose = props.onClose;

  this.onRendered(function() {
    this.autorun(this.show);
    this.$("#" + this.modalId).on("hidden.bs.modal", this.onHide.bind(this));
  });

  this.onDestroyed(function() {
    // force remove backdrop if it's there.
    $(".modal-backdrop").remove();
  });
});

component.prototype.show = function() {
  var canShow = this.get("canShow") || false;
  if(canShow){
    this.hideOtherWindowObjects();
    $("#" + this.modalId).modal("show");
  } else {
    $("#" + this.modalId).modal("hide");
    this.resetOtherWindowObjects();
  }
};

component.prototype.onHide = function() {
  this.onClose();
};

component.prototype.hideOtherWindowObjects = function() {
  $("#intercom-container").hide();
};

component.prototype.resetOtherWindowObjects = function() {
  $("#intercom-container").show();
};
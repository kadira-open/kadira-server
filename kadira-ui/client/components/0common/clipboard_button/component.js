import ZeroClipboard from 'zeroclipboard'

FlowComponents.define("clipboardButton", function(params) {
  this.set("text", params.text);
  this.set("label", params.label);

  var glyphicon = params.glyphicon || "glyphicon glyphicon-floppy-disk";
  this.set("glyphicon", glyphicon);

  var cssClasses = params.cssClasses || "input-group-addon tool-tip";
  this.set("cssClasses", cssClasses);

  this.onRendered(function() {
    var newClipboard = new ZeroClipboard(this.find(".copy-button"));
    newClipboard.on("load", function() {
      newClipboard.on("complete", function() {
        var message = i18n("common.copied_to_clipboard", params.label);
        growlAlert.success(message + "\n");
      });
    });
  });
});

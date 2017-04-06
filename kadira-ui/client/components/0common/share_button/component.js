import ZeroClipboard from 'zeroclipboard'

var component = FlowComponents.define("shareButton", function(props) {
  this.setFn("shareLink", props.shareLinkFn);
  this.set("className", props.className);

  this.onRendered(function() {
    this.autorun(function() {
      this.initZeroClipboard(props.buttonName, props.className);
    });
  });
});

component.prototype.initZeroClipboard = function (buttonName, className) {
  var client = new ZeroClipboard($("." + className + " .copy-button"));
  client.on( "load", function(client) {
    client.on( "complete", function() {
      var copiedMessage = i18n("common.copied_to_clipboard", buttonName) + "\n";
      growlAlert.success(copiedMessage);
    });
  });
};

function showAlert(messageType,message) {
  $.bootstrapGrowl(parseForXSS(message), {type: messageType});
}

growlAlert = {};

growlAlert.error = function (message) {
  showAlert("danger",message);
};

growlAlert.success = function (message) {
  showAlert("success",message);
};

growlAlert.info = function (message) {
  showAlert("info",message);
};

function parseForXSS(message) {
  return _.escape(message);
}
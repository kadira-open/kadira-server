/* eslint max-len: 0 */

Validations = {};
Validations.checkAppName = function(appName, callback) {
  var err;
  if(!isAlphaNumeric(appName)) {
    err = new Meteor.Error(403, i18n("validations.app_name_validation_failed"));
  }

  if(!(appName && appName.length <= 50)) {
    err = new Meteor.Error(403, i18n("validations.app_name_too_long"));
  }
  throwError(err, callback);
};

Validations.checkName = function(name){
  return isAlphaNumeric(name);
};

Validations.checkUrl = function(url, callback) {
  var regex = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  var isValid = regex.test(url);
  var errorString = i18n("validations.url_validation_failed");
  var err = isValid ? null : new Meteor.Error(403, errorString);
  throwError(err, callback);
};

Validations.checkEmail = function(email, callback) {
  var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var isValid = regex.test(email);
  var errorString = i18n("validations.email_validation_failed");
  var err = isValid ? null : new Meteor.Error(403, errorString);
  throwError(err, callback);
};

Validations.isValidEmailList = function(list) {
  var listArr = list.split("\n");
  var retVal = true;
  for (var i = 0; i < listArr.length; i++) {
    var email = $.trim(listArr[i]);
    if (!isValidEmail(email)){
      retVal = false;
    }
  }
  return retVal;
};

Validations.isValidUrllList = function(list) {
  var listArr = list.split("\n");
  var retVal = true;
  for (var i = 0; i < listArr.length; i++) {
    var url = $.trim(listArr[i]);
    if (!isValidUrl(url)){
      retVal = false;
    }
  } 
  return retVal;
};

function isValidEmail(email) {
  var regExp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return regExp.test(email);
}

function isValidUrl(url) {
  var regExp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return regExp.test(url);
}

function isAlphaNumeric(string) {
  var regex = /^[a-zA-Z0-9\-\s]+$/;
  return regex.test(string);
}

function throwError(error, callback) {
  if(Meteor.isServer && error) {
    throw error;
  } else if(Meteor.isClient){
    var result = error ? false : true;
    callback(error, result);
  }
}
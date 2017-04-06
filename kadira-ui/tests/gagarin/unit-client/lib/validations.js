describe("lib.validations.client", function() {
  it("valid app name", function() {
    // adopted from http://goo.gl/39IhWN
    var appName = Math.random().toString(36).substring(7);
    validateValue(appName, "checkAppName", true);
  });

  it("invalid app name", function() {
    validateValue("&*(@&$*@$", "checkAppName", false);
  });
  
  it("valid url", function() {
    validateValue("http://meteorhacks.com", "checkUrl", true);
  });

  it("invalid url", function() {
    validateValue("www.meteorhacks.com", "checkUrl", false);
  });

  it("valid email", function() {
    validateValue("pahan123@gmail.com", "checkEmail", true);
  });

  it("invalid email", function() {
    validateValue("111@$@$", "checkEmail", false);
  });  
});


function validateValue(value, validator, expectedResult) {
  
  var validate = function(resolve, reject, value, validator) {
    var validatorFunction = Validations[validator];
    validatorFunction(value, function(error, isValid) {
      resolve(isValid);
    });
  };

  var result = GlobalClient.promise(validate, [value, validator]);
  expect(result).to.be.equal(expectedResult);
}

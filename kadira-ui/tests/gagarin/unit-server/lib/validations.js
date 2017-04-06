describe("lib.validations.server", function() {
  it("valid app name", function() {
    // adopted from http://goo.gl/39IhWN
    var appName = Math.random().toString(36).substring(7);
    var result = validateValue(appName, "checkAppName");
    expect(result).to.be.equal(true);
  });

  it("invalid app name", function() {
    var result = validateValue("1313$", "checkAppName");
    expect(result).to.be.equal(false);
  });

  it("valid url", function() {
    var result = validateValue("http://meteorhacks.com", 
      "checkUrl");
    expect(result).to.be.equal(true);
  });

  it("invalid url", function() {
    var result = validateValue("www.meteorhacks.com", "checkUrl");
    expect(result).to.be.equal(false);
  });

  it("valid email", function() {
    var result = validateValue("pahan123@gmail.com", "checkEmail");
    expect(result).to.be.equal(true);
  });

  it("invalid email", function() {
    var result = validateValue("111@$@$", "checkEmail");
    expect(result).to.be.equal(false);
  });
});

function validateValue(value, validator){
  var result = GlobalServer.execute( function(value, validator) {
    try {
      Validations[validator](value);
      return true;
    } catch(e) {
      return false;
    }
  }, [value, validator]);
  return result;
}

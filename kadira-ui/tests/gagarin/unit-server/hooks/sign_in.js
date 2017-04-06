/* eslint max-len: 0 */

var serviceData = {
  id: "6db27ac2-8a72-43ed-92ee-38063f562350",
  "emails": [{
    "address": "pahan123@gmail.com",
    "primary": true,
    "verified": true
  }]
};

describe("hooks.login", function() {

  beforeEach(function() {
    GlobalServer.execute(function() {
      Meteor.users.remove({});
    });
  });

  it("user wants to merge his meteor developer account", function() {
    var result = GlobalServer.execute(function(serviceData) {
      var mock = sinon.mock(Meteor);
      mock.expects("userId").returns("user1");

      Meteor.users.insert({
        _id: "user1"
      });
      Accounts.updateOrCreateUserFromExternalService("meteor-developer",
        serviceData);

      mock.restore();
      return Meteor.users.findOne({
        _id: "user1"
      });
    }, [serviceData]);

    expect(result).to.be.eql({
      _id: "user1",
      services: {
        "meteor-developer": serviceData
      }
    });
  });

  it("create account when user login for first time", function() {
    var result = GlobalServer.execute(function(serviceData) {
      Accounts.updateOrCreateUserFromExternalService("meteor-developer", serviceData);

      return Meteor.users.findOne({
        "services.meteor-developer.emails.address": "pahan123@gmail.com"
      });
    }, [serviceData]);

    var serviceInfo = result.services["meteor-developer"];
    expect(serviceInfo).to.be.eql(serviceData);
  });

  it("user logs in again with his meteor developer account", function() {
    var result = GlobalServer.execute(function(serviceData) {
      Accounts.updateOrCreateUserFromExternalService("meteor-developer", serviceData);
      Accounts.updateOrCreateUserFromExternalService("meteor-developer", serviceData);

      return Meteor.users.find({
        "services.meteor-developer.emails.address": "pahan123@gmail.com"
      }).count();
    }, [serviceData]);

    expect(result).to.be.equal(1);
  });

  it("user wants to login with meteor account but email is already registered", function() {
    var result = GlobalServer.execute(function(serviceData) {
      Meteor.users.insert({
        _id: "user2",
        "emails": [{
          "address": "pahan123@gmail.com"
        }]
      });

      try {
        Accounts.updateOrCreateUserFromExternalService("meteor-developer", serviceData);
      } catch (e) {
        return true;
      }
      return false;
    }, serviceData);
    expect(true).to.be.eql(result);
  });

  it("user wants to merge meteor account but that account is connected with another login", function() {
    var result = GlobalServer.execute(function(serviceData) {

      var mock = sinon.mock(Meteor);
      mock.expects("userId").returns("user1");

      Meteor.users.insert({
        _id: "user3",
        services: {
          "meteor-developer": {
            id: "6db27ac2-8a72-43ed-92ee-38063f562350",
            "emails": [{
              "address": "pahan123@gmail.com"
            }]
          }
        }
      });
      try {
        Accounts.updateOrCreateUserFromExternalService("meteor-developer", serviceData);
      } catch (e) {
        return true;
      } finally {
        mock.restore();
      } 
      return false;
    }, [serviceData]);

    expect(true).to.be.eql(result);
  });
});
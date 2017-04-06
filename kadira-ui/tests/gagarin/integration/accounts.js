/* eslint max-len: 0 */
describe("accounts.billing_info", function() {
  beforeEach(function() {
    GlobalServer.cleanUpUsers();
    GlobalServer.cleanUpApps();
  });

  it("save billing without card", function() {

    var client = createUserAndLogin();
    var billingInfo = getBillingInfoObj();

    client.call("account.update.billingInfo", [billingInfo]);
    client.sleep(200);

    var users = client.collection("users");
    var expectedBillingInfo = users[Object.keys(users)[0]].billingInfo;

    expect(billingInfo).to.deep.equal(expectedBillingInfo);
  });

  it("save billing info when already added card", function() {

    var client = createUserAndLogin();

    // create stubs
    var cardInfo = {id: "card-id"};
    createStubsForStripe();

    //add a card first
    var plan = "free"; // any string. this will reassigned in meteor method
    client.call("account.update.card", [cardInfo, plan]);

    client.sleep(200);

    var billingInfo = getBillingInfoObj();
    client.call("account.update.billingInfo", [billingInfo]);
    client.sleep(200);

    // stub expectations
    GlobalServer.execute(function(cardInfo) {
      // callCount
      expect(Stripe.tokens.retrieve.callCount)
       .to.be.equal(1);
      expect(Stripe.customers.create.callCount)
        .to.be.equal(1);
      expect(Stripe.customers.updateSubscription.callCount)
        .to.be.equal(0);
      expect(Stripe.customers.createSubscription.callCount)
        .to.be.equal(0);
      expect(Stripe.customers.update.callCount)
        .to.be.equal(1);
      expect(Stripe.customers.deleteCard.callCount)
        .to.be.equal(0);

      // args
      expect(Stripe.tokens.retrieve.args[0][0])
        .to.be.equal(cardInfo.id);
      expect(Stripe.customers.create.args[0][0].card)
        .to.be.equal("token-id");
      expect(Stripe.customers.create.args[0][0]
        .email).to.be.equal("test@email.com");

    }, [cardInfo, plan]);

    // restore stub methods
    restoreStubsForStripe();

    var users = client.collection("users");
    var expectedBillingInfo = users[Object.keys(users)[0]].billingInfo;

    expect(billingInfo).to.deep.equal(expectedBillingInfo);

  });

});

describe("accounts.manage_card", function() {
  beforeEach(function() {
    GlobalServer.cleanUpUsers();
    GlobalServer.cleanUpApps();
  });

  it("add credit card", function() {

    var client = createUserAndLogin();
    client.sleep(200);

    // create stubs
    var cardInfo = {id: "card-id"};
    createStubsForStripe();

    //planId
    var plan = "free"; // any string. this will reassigned in meteor method
    client.call("account.update.card", [cardInfo, plan]);

    // stub expectations
    GlobalServer.execute(function(cardInfo) {
      // callCount
      expect(Stripe.tokens.retrieve.callCount)
        .to.be.equal(1);
      expect(Stripe.customers.create.callCount)
        .to.be.equal(1);
      expect(Stripe.customers.updateSubscription.callCount)
        .to.be.equal(0);
      expect(Stripe.customers.createSubscription.callCount)
        .to.be.equal(0); //1
      expect(Stripe.customers.update.callCount)
        .to.be.equal(0);
      expect(Stripe.customers.deleteCard.callCount)
        .to.be.equal(0);

      // args
      expect(Stripe.tokens.retrieve.args[0][0])
        .to.be.equal(cardInfo.id);
      expect(Stripe.customers.create.args[0][0].card)
        .to.be.equal("token-id");
      expect(Stripe.customers.create.args[0][0]
        .email).to.be.equal("test@email.com");
      // expect(Stripe.customers.createSubscription.args[0][0])
      //   .to.be.equal("customers-id");
      // expect(Stripe.customers.createSubscription.args[0][1].plan)
      //   .to.be.equal(plan);
    }, [cardInfo, plan]);

    // restore stub methods
    restoreStubsForStripe();

    client.sleep(200);
    var users = client.collection("users");
    var cardFromUserObject = users[Object.keys(users)[0]].stripe.card;

    expect(cardFromUserObject).to.deep.equal({"cc": 10});
  });

  it("update credit card with custom plan", function() {

    var client = createUserAndLogin();
    client.sleep(200);

    // create stubs
    var cardInfo = {id: "card-id"};
    createStubsForStripe();

    //planId
    var plan = "solo";
    client.call("account.update.card", [cardInfo, plan]);

    // stub expectations
    GlobalServer.execute(function(cardInfo, plan) {
      // callCount
      expect(Stripe.tokens.retrieve.callCount)
        .to.be.equal(1);
      expect(Stripe.customers.create.callCount)
        .to.be.equal(1);
      expect(Stripe.customers.updateSubscription.callCount)
        .to.be.equal(0);
      expect(Stripe.customers.createSubscription.callCount)
        .to.be.equal(1);
      expect(Stripe.customers.update.callCount)
        .to.be.equal(0);
      expect(Stripe.customers.deleteCard.callCount)
        .to.be.equal(0);

      // args
      expect(Stripe.tokens.retrieve.args[0][0])
        .to.be.equal(cardInfo.id);
      expect(Stripe.customers.create.args[0][0].card)
        .to.be.equal("token-id");
      expect(Stripe.customers.create.args[0][0].email)
        .to.be.equal("test@email.com");
      expect(Stripe.customers.createSubscription.args[0][0])
        .to.be.equal("customers-id");
      expect(Stripe.customers.createSubscription.args[0][1].plan)
        .to.be.equal(plan);
    }, [cardInfo, plan]);

    // restore stub methods
    restoreStubsForStripe();

    client.sleep(200);
    var users = client.collection("users");
    var cardFromUserObject = users[Object.keys(users)[0]].stripe.card;

    expect(cardFromUserObject).to.deep.equal({"cc": 10});
  });

  it("remove card and allow it if there is no plan or free plan", function() {
    var client = createUserAndLogin();
    client.sleep(200);

    // create stubs
    var cardInfo = {id: "card-id"};
    createStubsForStripe();

    //planId
    var plan = "free";
    client.call("account.update.card", [cardInfo, plan]);
    client.sleep(200);

    var users = client.collection("users");
    var cardBeforeRemoved = users[Object.keys(users)[0]].stripe.card;

    client.sleep(200);
    client.call("account.remove.card");

    // stub expectations
    GlobalServer.execute(function(cardInfo) {
      // callCount
      expect(Stripe.tokens.retrieve.callCount)
        .to.be.equal(1);
      expect(Stripe.customers.create.callCount)
        .to.be.equal(1);
      expect(Stripe.customers.updateSubscription.callCount)
        .to.be.equal(0);
      expect(Stripe.customers.createSubscription.callCount)
        .to.be.equal(0);
      expect(Stripe.customers.update.callCount)
        .to.be.equal(0);
      expect(Stripe.customers.deleteCard.callCount)
        .to.be.equal(1);

      // args
      expect(Stripe.tokens.retrieve.args[0][0])
        .to.be.equal(cardInfo.id);
      expect(Stripe.customers.create.args[0][0].card)
        .to.be.equal("token-id");
      expect(Stripe.customers.create.args[0][0].email)
        .to.be.equal("test@email.com");

    }, [cardInfo, plan]);

    // restore stub methods
    restoreStubsForStripe();

    client.sleep(200);
    users = client.collection("users");
    var cardAfterRemoved = users[Object.keys(users)[0]].stripe.card;

    expect(cardBeforeRemoved).to.deep.not.equal(cardAfterRemoved);
  });

  it("remove card and don't allow it if a paid plan selected", function() {
    var client = createUserAndLogin();
    client.sleep(200);

    // create stubs
    var cardInfo = {id: "card-id"};
    createStubsForStripe();

    //planId
    var plan = "solo";
    client.call("account.update.card", [cardInfo, plan]);
    client.sleep(200);

    var throwedError = false;

    try {
      client.call("account.remove.card");
    }
    catch(err) {
      throwedError = true;
    }

    // stub expectations
    GlobalServer.execute(function(cardInfo, plan) {
      // callCount
      expect(Stripe.tokens.retrieve.callCount).to.be.equal(1);
      expect(Stripe.customers.create.callCount).to.be.equal(1);
      expect(Stripe.customers.updateSubscription.callCount).to.be.equal(0);
      expect(Stripe.customers.createSubscription.callCount).to.be.equal(1);
      expect(Stripe.customers.update.callCount).to.be.equal(0);
      expect(Stripe.customers.deleteCard.callCount)
        .to.be.equal(0);

      // args
      expect(Stripe.tokens.retrieve.args[0][0])
        .to.be.equal(cardInfo.id);
      expect(Stripe.customers.create.args[0][0].card)
        .to.be.equal("token-id");
      expect(Stripe.customers.create.args[0][0].email)
        .to.be.equal("test@email.com");
      expect(Stripe.customers.createSubscription.args[0][0])
        .to.be.equal("customers-id");
      expect(Stripe.customers.createSubscription.args[0][1].plan)
        .to.be.equal(plan);

    }, [cardInfo, plan]);

    // restore stub methods
    restoreStubsForStripe();

    client.sleep(200);
    expect(throwedError).to.deep.equal(true);
  });

});

describe("accounts.select_plans", function() {
  beforeEach(function() {
    GlobalServer.cleanUpUsers();
    GlobalServer.cleanUpApps();
  });

  it("select plan and enter the card", function() {

    var client = createUserAndLogin();
    client.sleep(200);

    // create stubs
    var cardInfo = {id: "card-id"};
    createStubsForStripe();

    var hasPlanAndCardBefore;
    var users = client.collection("users");

    var hasStripeObj = users[Object.keys(users)[0]].hasOwnProperty("stripe");
    var hasPlanObj = users[Object.keys(users)[0]].hasOwnProperty("plan");

    if(hasStripeObj && hasPlanObj) {
      hasPlanAndCardBefore = true;
    } else {
      hasPlanAndCardBefore = false;
    }

    // planId
    var plan = "free";
    client.call("account.update.card", [cardInfo, plan]);

    // verify stub expectations
    GlobalServer.execute(function(cardInfo, plan) {
      // callCount
      expect(Stripe.tokens.retrieve.callCount).to.be.equal(1);
      expect(Stripe.customers.create.callCount).to.be.equal(1);
      expect(Stripe.customers.updateSubscription.callCount).to.be.equal(0);

      if(plan !== "free") {
        expect(Stripe.customers.createSubscription.callCount).to.be.equal(1);
      } else {
        expect(Stripe.customers.createSubscription.callCount).to.be.equal(0);
      }

      expect(Stripe.customers.update.callCount).to.be.equal(0);

      // args
      expect(Stripe.tokens.retrieve.args[0][0])
        .to.be.equal(cardInfo.id);
      expect(Stripe.customers.create.args[0][0].card)
        .to.be.equal("token-id");
      expect(Stripe.customers.create.args[0][0].email)
        .to.be.equal("test@email.com");

      if(plan !== "free") {
        expect(Stripe.customers.createSubscription.args[0][0])
          .to.be.equal("customers-id");
        expect(Stripe.customers.createSubscription.args[0][1].plan)
          .to.be.equal(plan);
      }

    }, [cardInfo, plan]);

    // restore stub methods
    restoreStubsForStripe();

    client.sleep(200);
    var hasPlanAndCardAfter;
    users = client.collection("users");

    hasStripeObj = users[Object.keys(users)[0]].hasOwnProperty("stripe");
    isVerifiedCard = users[Object.keys(users)[0]].stripe.hasOwnProperty("verified");

    if(hasStripeObj && isVerifiedCard) {
      hasPlanAndCardAfter = true;
    } else {
      hasPlanAndCardAfter = false;
    }

    expect(hasPlanAndCardBefore).to.deep.not.equal(hasPlanAndCardAfter);
  });

  it("Select plan with the exisitng card", function() {

    var client = createUserAndLogin();
    client.sleep(200);

    var plan = "pro";
    updatePlan(plan, client);

    var users = client.collection("users");
    var expectedPlan = users[Object.keys(users)[0]].plan;

    expect(expectedPlan).to.deep.equal(plan);

  });

  it("select plan without a card and throw error", function() {

    var client = createUserAndLogin();
    client.sleep(200);

    // create stubs
    //var cardInfo = {id: "card-id"};
    createStubsForStripe();

    var throwedError = false;
    var plan = "solo";
    try {
      client.call("account.update.plan", [plan]);
    } catch(err) {
      throwedError = true;
    }

    // stub expectations
    GlobalServer.execute(function() {
      // callCount
      expect(Stripe.tokens.retrieve.callCount).to.be.equal(0);
      expect(Stripe.customers.create.callCount).to.be.equal(0);
      expect(Stripe.customers.updateSubscription.callCount).to.be.equal(0);
      expect(Stripe.customers.createSubscription.callCount).to.be.equal(0);
      expect(Stripe.customers.update.callCount).to.be.equal(0);
    });

    // restore stub methods
    restoreStubsForStripe();

    expect(throwedError).to.deep.equal(true);
  });

  it("select a plan when alerts limit less than existing counts and throw an error", function() {

    var client = createUserAndLogin();
    client.sleep(200);

    updatePlan("pro", client);

    var appId = client.createApp("myTestApp2");
    createAlerts(client, appId);

    // let's downgrade the plan to free
    createStubsForStripe();

    plan = "free";
    try {
      client.call("account.update.plan", [plan]);
    } catch(err) {
      errMsg = err.message;
    }

    // stub expectations
    GlobalServer.execute(function() {
      // callCount
      expect(Stripe.tokens.retrieve.callCount).to.be.equal(0);
      expect(Stripe.customers.create.callCount).to.be.equal(0);
      expect(Stripe.customers.updateSubscription.callCount).to.be.equal(0);
      expect(Stripe.customers.createSubscription.callCount).to.be.equal(0);
      expect(Stripe.customers.update.callCount).to.be.equal(0);
    });

    // restore stub methods
    restoreStubsForStripe();

    expect(errMsg).to.be.equal("You need remove 2 alert(s) from 'myTestApp2' to downgrade. [403]");
  });

  it("select a plan when collaborators limit less than existing counts and throw an error", function() {

    var client = createUserAndLogin();
    client.sleep(200);

    updatePlan("pro", client);

    client.subscribe("apps.userOwned");
    var appId = client.createApp("myTestApp2");

    var email = "mailtokasun@gmail.com";
    addColloaborator(client, appId, email);
    acceptPendingInvites(client, appId, email);

    // let's downgrade the plan to free
    createStubsForStripe();

    plan = "free";
    try {
      client.call("account.update.plan", [plan]);
    } catch(err) {
      errMsg = err.message;
    }

    // stub expectations
    GlobalServer.execute(function() {
      // callCount
      expect(Stripe.tokens.retrieve.callCount).to.be.equal(0);
      expect(Stripe.customers.create.callCount).to.be.equal(0);
      expect(Stripe.customers.updateSubscription.callCount).to.be.equal(0);
      expect(Stripe.customers.createSubscription.callCount).to.be.equal(0);
      expect(Stripe.customers.update.callCount).to.be.equal(0);
    });

    // restore stub methods
    restoreStubsForStripe();

    expect(errMsg).to.be.equal("You need remove 1 collaborator(s) from 'myTestApp2' to downgrade. [403]");
  });
});

describe("account.getUsage", function() {
  beforeEach(function() {
    GlobalServer.cleanUpUsers();
    GlobalServer.cleanUpApps();
  });

  it("get monthly hosts usage, when no apps created", function() {
    // login
    var client = createDdpClient(GlobalServer);
    var userId = GlobalServer.createUser({
      username: "joe",
      password: "password",
      email: "joe@meteorhacks.com",
      plan: "startup"
    });

    client.login({user: {username: "joe"}, password: "password"});
    updatePlan("startup", client);
    client.sleep(200);

    // var appId = client.createApp("myTestApp", "paid");
    client.subscribe("user.userInfo");
    client.sleep(200);

    var expectedRes = {
      usageByApp: {},
      maximum: 5
    };

    var currentUsage = client.call("account.getUsage", [userId]);
    expect(currentUsage.usageByApp).to.deep.equal(expectedRes.usageByApp);
    expect(currentUsage.maximum).to.be.equal(expectedRes.maximum);
    var now = new Date();
    expect(currentUsage.start.getDate()).to.be.equal(now.getDate());
    expect(currentUsage.start.getHours()).to.be.equal(now.getHours());

    expect(currentUsage.reset.getDate()).to.be.equal(now.getDate());
    expect(currentUsage.reset.getHours()).to.be.equal(now.getHours());
  });

  it("get monthly hosts usage, with app created", function() {
    // login
    var client = createDdpClient(GlobalServer);
    var userId = GlobalServer.createUser({
      username: "joe",
      password: "password",
      email: "joe@meteorhacks.com"
    });

    client.login({user: {username: "joe"}, password: "password"});
    updatePlan("startup", client);
    client.sleep(200);

    client.createApp("myTestApp", "paid");
    client.subscribe("user.userInfo");
    client.sleep(200);

    GlobalServer.execute(function() {
      var mock = sinon.mock(KadiraAccounts);

      mock.expects("getUsageByApp").once().returns({
        myTestApp: 6
      });

      Meteor._mock = mock;
    });
    var expectedRes = {
      usageByApp: {myTestApp: 6}
    };

    var currentUsage = client.call("account.getUsage", [userId]);
    expect(currentUsage.usageByApp).to.deep.equal(expectedRes.usageByApp);
    GlobalServer.execute(function() {
      Meteor._mock.verify();
      Meteor._mock.restore();
    });
  });

  it("get monthly hosts usage, with 2 paid apps created", function() {
    // login
    var client = createDdpClient(GlobalServer);
    var userId = GlobalServer.createUser({
      username: "joe",
      password: "password",
      email: "joe@meteorhacks.com"
    });

    client.login({user: {username: "joe"}, password: "password"});
    updatePlan("startup", client);
    client.sleep(200);
    client.subscribe("user.userInfo");
    client.sleep(200);

    GlobalServer.execute(function() {
      var mock = sinon.mock(KadiraAccounts);

      mock.expects("getUsageByApp").once().returns({
        myTestApp1: 2,
        myTestApp2: 5
      });

      Meteor._mock = mock;
    });

    var currentUsage = client.call("account.getUsage", [userId]);
    expect(currentUsage.total).to.deep.equal(7);
    GlobalServer.execute(function() {
      Meteor._mock.verify();
      Meteor._mock.restore();
    });
  });

  it("Don't check  hosts limit for free apps", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "joe",
      password: "password",
      email: "joe@meteorhacks.com",
      plan: "free"
    });

    client.login({user: {username: "joe"}, password: "password"});
    client.subscribe("user.userInfo");
    client.sleep(200);

    var appId = client.createApp("myTestApp2", "free");
    var result = client.call("account.isCloseToHitUsageLimit", [appId]);
    client.sleep(200);
    expect(result).to.be.equal(false);
  });

  it("Don't check  hosts limit for paid user - free apps", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "joe",
      password: "password",
      email: "joe@meteorhacks.com",
    });

    client.login({user: {username: "joe"}, password: "password"});
    updatePlan("startup", client);
    client.subscribe("user.userInfo");
    client.sleep(200);

    var appId = client.createApp("myTestApp1", "free");
    var result = client.call("account.isCloseToHitUsageLimit", [appId]);
    client.sleep(200);
    expect(result).to.be.equal(false);
  });

  it("hosts count lower than hosts limit", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "joe",
      password: "password",
      email: "joe@meteorhacks.com"
    });

    client.login({user: {username: "joe"}, password: "password"});
    updatePlan("startup", client);
    var appId = client.createApp("myTestApp2", "paid");
    client.subscribe("user.userInfo");
    client.sleep(200);

    GlobalServer.execute(function() {
      var mock = sinon.mock(KadiraAccounts);

      mock.expects("getUsageByApp").once().returns({
        myTestApp2: 4
      });

      Meteor._mock = mock;
    });
    var result = client.call("account.isCloseToHitUsageLimit", [appId]);
    client.sleep(200);

    expect(result).to.be.equal(false);
    GlobalServer.execute(function() {
      Meteor._mock.verify();
      Meteor._mock.restore();
    });
  });

  it("is Close to hit hosts limit", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "joe",
      password: "password",
      email: "joe@meteorhacks.com"
    });

    client.login({user: {username: "joe"}, password: "password"});
    updatePlan("startup", client);
    var appId = client.createApp("myTestApp2", "paid");
    client.subscribe("user.userInfo");
    client.sleep(200);

    GlobalServer.execute(function() {
      var mock = sinon.mock(KadiraAccounts);

      mock.expects("getUsageByApp").once().returns({
        myTestApp2: 25
      });

      Meteor._mock = mock;
    });
    var result = client.call("account.isCloseToHitUsageLimit", [appId]);
    client.sleep(200);

    expect(result).to.be.equal(true);
    GlobalServer.execute(function() {
      Meteor._mock.verify();
      Meteor._mock.restore();
    });
  });

  it("suggest a plan", function() {
    var client = createDdpClient(GlobalServer);
    var userId = GlobalServer.createUser({
      username: "joe",
      password: "password",
      email: "joe@meteorhacks.com"
    });

    client.login({user: {username: "joe"}, password: "password"});
    updatePlan("startup", client);
    client.createApp("myTestApp2", "paid");
    client.subscribe("user.userInfo");
    client.sleep(200);

    GlobalServer.execute(function() {
      var mock = sinon.mock(KadiraAccounts);

      mock.expects("getUsageByApp").once().returns({
        myTestApp2: 4
      });
      Meteor._mock = mock;
    });

    var result = client.call("account.suggestPlan", [userId]);
    client.sleep(200);

    expect(result).to.be.equal("startup");
    GlobalServer.execute(function() {
      Meteor._mock.verify();
      Meteor._mock.restore();
    });
  });
});

describe("accounts.misc", function() {
  beforeEach(function() {
    GlobalServer.cleanUpUsers();
    GlobalServer.cleanUpApps();
  });

  it("get tender authToken", function() {
    var client = createUserAndLogin();
    var email = "my@email.com";
    var secret = "secret";
    GlobalServer.execute(function(email, secret) {
      Meteor.users.update({"username": "ind"}, {$set: {
        "stripe.card.name": email
      }});

      Meteor.settings.tender = {
        secret: secret
      };

    }, [email, secret]);

    var res = client.call("account.getTenderAuthToken");
    // create auth token
    var signature = email + res.now + secret;
    var crypto = require("crypto");
    var authToken = crypto.createHash("md5").update(signature).digest("hex");

    expect(res.authToken).to.be.equal(authToken);
  });

  it("get tender authToken without a logged in user", function() {
    var client = createUserAndLogin();
    client.logout();

    try {
      client.call("account.getTenderAuthToken");
      throw new Error("need an user account");
    } catch(err) {
      expect(err.message).to.be.equal("[Unauthorized]");
    }
  });

  it("get tender authToken without a stripe card", function() {
    var client = createUserAndLogin();

    try {
      client.call("account.getTenderAuthToken");
      throw new Error("need an stripe card");
    } catch(err) {
      expect(/400/.test(err.message)).to.be.ok();
    }
  });
});

function createUserAndLogin() {
  var client = createDdpClient(GlobalServer);

  GlobalServer.createUser({
    username: "ind",
    password: "password",
    email: "me@thinkholic.com"
  });

  client.login({user: {username: "ind"}, password: "password"});
  client.subscribe("user.userInfo");

  return client;
}

function createStubsForStripe() {
  GlobalServer.execute(function() {
    // backup original functions
    Stripe._originalRetrieve = Stripe.tokens.retrieve;
    Stripe._originalCustomerCreate = Stripe.customers.create;
    Stripe._originalCustomerUpdateSubscription =
      Stripe.customers.updateSubscription;
    Stripe._originalCustomerCreateSubscription =
      Stripe.customers.createSubscription;
    Stripe._originalCustomerUpdate = Stripe.customers.update;
    Stripe._originalCustomerDeleteCard = Stripe.customers.deleteCard;

    // stubs
    Stripe.tokens.retrieve = sinon.stub();
    Stripe.customers.create = sinon.stub();
    Stripe.customers.updateSubscription = sinon.stub();
    Stripe.customers.createSubscription = sinon.stub();
    Stripe.customers.update = sinon.stub();
    Stripe.customers.deleteCard = sinon.stub();

    // stub methods declarations
    Stripe.tokens.retrieve.returns({
      id: "token-id",
      email: "test@email.com",
      card: {"cc": 10}
    });

    Stripe.customers.create.returns({
      id: "customers-id"
    });

    Stripe.customers.updateSubscription.returns({
      id: "null"
    });

    Stripe.customers.createSubscription.returns({
      id: "subscription-id",
      start: Math.floor(new Date().getTime()/1000) // unix timestamp ,no miliseconds
    });

    Stripe.customers.update
      .withArgs({
        card: "token.id",
        email: "test@email.is"
      })
      .returns({
        id: "customers-id"
      });

    Stripe.customers.deleteCard
      .withArgs("customers-id", "card-id")
      .returns({
        id: "customers-id"
      });

  });
}

function restoreStubsForStripe() {
  GlobalServer.execute(function() {
    Stripe.tokens.retrieve = Stripe._originalRetrieve;
    Stripe.customers.create = Stripe._originalCustomerCreate;
    Stripe.customers.updateSubscription =
      Stripe._originalCustomerUpdateSubscription;
    Stripe.customers.createSubscription =
      Stripe._originalCustomerCreateSubscription;
    Stripe.customers.update = Stripe._originalCustomerUpdate;
    Stripe.customers.deleteCard = Stripe._originalCustomerDeleteCard;
  });
}

function getBillingInfoObj() {
  var billingInfo = {};
  billingInfo.name = "test name";
  billingInfo.email = "test@email.com";
  billingInfo.address1 = "address1";
  billingInfo.address2 = "address2";
  billingInfo.city = "city";
  billingInfo.state = "state";
  billingInfo.zip = "zip";
  billingInfo.country = "country";
  billingInfo.other = "other";

  return billingInfo;
}

function updatePlan(newPlan, client) {
  // create stubs
  var cardInfo = {id: "card-id"};
  createStubsForStripe();

  var plan = "free"; // any string. this will reassigned in meteor method
  client.call("account.update.card", [cardInfo, plan]);
  client.sleep(200);

  //update pro plan
  plan = newPlan;
  client.call("account.update.plan", [plan]);
  client.sleep(200);

  // stub expectations
  GlobalServer.execute(function(cardInfo) {
    // callCount
    expect(Stripe.tokens.retrieve.callCount).to.be.equal(1);
    expect(Stripe.customers.create.callCount).to.be.equal(1);
    expect(Stripe.customers.createSubscription.callCount).to.be.equal(1);
    expect(Stripe.customers.update.callCount).to.be.equal(0);

    // // args
    expect(Stripe.tokens.retrieve.args[0][0])
      .to.be.equal(cardInfo.id);
    expect(Stripe.customers.create.args[0][0].card)
      .to.be.equal("token-id");
    expect(Stripe.customers.create.args[0][0].email)
      .to.be.equal("test@email.com");
    expect(Stripe.customers.createSubscription.args[0][0])
      .to.be.equal("customers-id");
  }, [cardInfo, plan]);

  // restore stub methods
  restoreStubsForStripe();
  client.sleep(200);
}

function createAlerts(client, appId) {
  client.subscribe("apps.userOwned");
  client.subscribe("alerts", [appId]);

  // create three test alerts
  var alertName = "TestAlert-1";
  var alertInfo = GlobalServer.setAlertData(alertName, appId);
  client.call("alerts.create", [alertInfo]);
  client.sleep(200);
  var alerts = client.collection("alerts");
  expect(Object.keys(alerts).length).to.equal(1);

  alertName = "TestAlert-2";
  client.call("alerts.create", [alertInfo]);
  client.sleep(200);
  alerts = client.collection("alerts");
  expect(Object.keys(alerts).length).to.equal(2);

  alertName = "TestAlert-3";
  client.call("alerts.create", [alertInfo]);
  client.sleep(200);
  alerts = client.collection("alerts");
  expect(Object.keys(alerts).length).to.equal(3);
}

function addColloaborator(client, appId, email) {
  client.call("share.addCollaborator", [appId, email]);
}

function acceptPendingInvites(client, appId, email) {
  var inviteId = getInviteId(client, email, appId);

  client.logout();

  GlobalServer.createUser({
    username: "kasun",
    password: "password",
    email: email
  });

  client.login({user: {username: "kasun"}, password: "password"});
  client.call("share.acceptInvite", [inviteId]);
  client.subscribe("apps.collaboratored");

  var apps = client.collection("apps");
  expect(Object.keys(apps).length).to.be.equal(1);

  client.logout();
  client.login({user: {username: "ind"}, password: "password"});
}

function getInviteId(client, email, appId) {
  var subId = client.subscribe("apps.pendingUsers", [appId]);
  var pendingUsers = client.collection("pendingUsers");
  var inviteId;
  for(var key in pendingUsers){
    if(pendingUsers[key].email === email){
      inviteId = key;
    }
  }
  client.unsubscribe(subId);
  return inviteId;
}

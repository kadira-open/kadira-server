Tinytest.addAsync(
  'Helpers - ._authorize - when there is no userId',
  function(test, done) {
    try {
      KadiraData._authorize(null);
    } catch(ex) {
      test.equal(ex.error, "400");
      done();
    }
  }
);

Tinytest.addAsync(
  'Helpers - ._authorize - when there is no user',
  function(test, done) {
    try {
      KadiraData._authorize("some-unknown-userId");
    } catch(ex) {
      test.equal(ex.error, "500");
      done();
    }
  }
);

Tinytest.addAsync(
  'Helpers - ._authorize - allow if no user id and query by _id',
  function(test, done) {
    try {
      var args = {query: {_id: "some-id"}};
      KadiraData._authorize(undefined, "key", args);
      done();
    } catch(ex) {
    }
  }
);

Tinytest.addAsync(
  'Helpers - ._authorize - when requested older date range',
  function(test, done) {
    var userId = CreateUserWithPlan("startup");
    var args = {time: new Date("2010 Oct 20")};
    try {
      KadiraData._authorize(userId, "some-data-key", args);
    } catch(ex) {
      test.isTrue(/date range/.test(ex.reason));
      done();
    }
  }
);

Tinytest.addAsync(
  'Helpers - ._authorize - when app is not yours',
  function(test, done) {
    var userId = CreateUserWithPlan("startup");
    var args = {realtime: true};
    try {
      KadiraData._authorize(userId, "some-data-key", args);
    } catch(ex) {
      test.equal(ex.error, "400");
      test.isTrue(/appId/.test(ex.reason));
      done();
    }
  }
);

Tinytest.addAsync(
  'Helpers - ._authorize - when you are the owner',
  function(test, done) {
    var userId = CreateUserWithPlan("startup");
    var args = {realtime: true, appId: CreateAppForUser(userId)};
    try {
      KadiraData._authorize(userId, "some-data-key", args);
      done();
    } catch(ex) {

    }
  }
);

Tinytest.addAsync(
  'Helpers - ._authorize - when you are the owner for multiple apps',
  function(test, done) {
    var userId = CreateUserWithPlan("startup");
    var appId = [CreateAppForUser(userId), CreateAppForUser(userId)];
    var args = {realtime: true, appId: appId};
    try {
      KadiraData._authorize(userId, "some-data-key", args);
      done();
    } catch(ex) {

    }
  }
);

Tinytest.addAsync(
  'Helpers - ._authorize - when you are a collaborator',
  function(test, done) {
    var userId = CreateUserWithPlan("startup");
    var appId = CreateAppForUser("other-user-id");
    Apps.update({_id: appId}, {$set: {perAppTeam: [
      {userId: userId, role: "collaborator"}
    ]}});
    var args = {realtime: true, appId: appId};
    try {
      KadiraData._authorize(userId, "some-data-key", args);
      done();
    } catch(ex) {

    }
  }
);

Tinytest.addAsync(
  'Helpers - ._authorize - when date range satisfied',
  function(test, done) {
    var userId = CreateUserWithPlan("startup");
    var tenDaysBefore = 1000 * 3600 * 24 * 10;
    var args = {
      time: new Date(Date.now() - tenDaysBefore),
      appId: CreateAppForUser(userId)
    };
    try {
      KadiraData._authorize(userId, "some-data-key", args);
      done();
    } catch(ex) {

    }
  }
);

Tinytest.addAsync(
  'Helpers - ._authorize - when query is realtime',
  function(test, done) {
    var userId = CreateUserWithPlan("startup");
    var args = {
      realtime: true,
      appId: CreateAppForUser(userId)
    };
    try {
      KadiraData._authorize(userId, "some-data-key", args);
      done();
    } catch(ex) {

    }
  }
);
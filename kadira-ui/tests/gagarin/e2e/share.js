// describe("app.share", function() {
//   it("show owner in the share dialog", function() {
//     var appId = createApp();
//     GlobalClient.goGetPath("/apps/" + appId + "/dashboard/overview");
//     GlobalClient.waitForDOM("#app-share");
//     GlobalClient.click("#app-share");
//     GlobalClient.sleep(100);
//     var path = GlobalClient.getCurrentPath();
//     var expectedPath = "/apps/" + appId + "/dashboard/overview?action=share";
//     expect(path).to.be.equal(expectedPath);
//   });

//   it("add collaborator and show pending collaborators", function() {
//     var appId = createApp();
//     var dialogPath = "/apps/" + appId + "/dashboard/overview?action=share";
//     GlobalClient.goGetPath(dialogPath);
//     GlobalClient.waitForDOM("#collaborator");
//     GlobalClient.sleep(100);
//     cleanUpPendingUsers();
//     GlobalClient.execute(function() {
//       $("#collaborator").val("test@meteorhacks.com");
//     });
//     GlobalClient.waitForDOM("#add-collaborator");
//     GlobalClient.sleep(100);
//     GlobalClient.click("#add-collaborator");
//     var emailEl = ".pending-collaborators li:nth-child(1) .email";
//     var email = GlobalClient.getText(emailEl);
//     expect(email.trim()).to.be.equal("test@meteorhacks.com");
//   });

//   it("remove pending collaborators", function() {
//     var appId = createApp();
//     cleanUpPendingUsers();
//     addPendingUser(appId, "collaborator");
//     var dialogPath = "/apps/" + appId + "/dashboard/overview?action=share";
//     GlobalClient.goGetPath(dialogPath);
//     var el = ".pending-collaborators li:nth-child(1) .remove-pending-user";
//     GlobalClient.waitForDOM(el);
//     GlobalClient.sleep(150);
//     GlobalClient.click(el);
//     GlobalClient.getText(".pending-collaborators li:nth-child(1)");
//     var waitForData = function(resolve) {
//       Tracker.autorun(function () {
//         var isReady = FlowRouter.ready("pendingUsers");
//         if(isReady) {
//           var pendingUserCount = $(".pending-collaborators li").length;
//           resolve(pendingUserCount);
//         }
//       });
//     };

//     var pendingUserCount = GlobalClient.promise(waitForData);
//     expect(pendingUserCount).to.be.equal(0);
//   });

//   it("resend pending email", function () {
//     var appId = createApp();
//     cleanUpPendingUsers();
//     addPendingUser(appId, "collaborator");
//     var dialogPath = "/apps/" + appId + "/dashboard/overview?action=share";
//     GlobalClient.goGetPath(dialogPath);
//     GlobalServer.execute(function() {
//       var mock = sinon.mock(Email);
//       mock.expects("send").once();
//       Meteor._mock = mock;
//     });

//     GlobalClient.sleep(400);

//     GlobalClient.waitForDOM(".pending-collaborators li:nth-child(1)");
//     var resendElm = ".pending-collaborators li:nth-child(1) .resend-invite";
//     GlobalClient.click(resendElm);
//     GlobalServer.execute(function() {
//       Meteor._mock.verify();
//       Meteor._mock.restore();
//     });
//   });

//   it("add collaborator and accept him", function() {
//     var appId = createApp();
//     cleanUpPendingUsers();
//     addPendingUser(appId, "collaborator");
//     GlobalClient.logout();
//     GlobalClient.goGetPath("/sign-up");

//     GlobalClient.signUp({
//       username: "collaborator",
//       password: "password",
//       email: "test@meteorhacks"
//     });

//     GlobalClient.login("collaborator", "password");
//     GlobalClient.sleep(500);
//     GlobalClient.goGetPath("/invite/" + appId);

//     GlobalClient.sleep(500);
//     var appsCount = GlobalClient.execute(function() {
//       return Apps.find().count();
//     });

//     expect(appsCount).to.be.equal(1);
//   });

//   it("change owner and show pending request", function() {
//     var appId = createApp();
//     var dialogPath = "/apps/" + appId + "/dashboard/overview?action=share";
//     GlobalClient.sleep(100);
//     GlobalClient.goGetPath(dialogPath);
//     GlobalClient.sleep(100);
//     GlobalClient.waitForDOM("#change-app-owner");
//     GlobalClient.sleep(100);
//     GlobalClient.click("#change-app-owner");
//     cleanUpPendingUsers();
//     GlobalClient.execute(function() {
//       $("#app-change-owner-text").val("test@meteorhacks.com");
//       $("#app-change-app-name-text").val("new-app");
//     });
//     GlobalClient.sleep(100);
//     GlobalClient.waitForDOM("#app-owner-change-confirm");
//     GlobalClient.click("#app-owner-change-confirm");
//     var ownerCount = GlobalClient.execute(function() {
//       return $(".shared-user-list.owner li").length
//     });
//     expect(ownerCount).to.be.equal(1);
//   });


//   it("change owner and resend email", function() {
//     var appId = createApp();
//     var dialogPath = "/apps/" + appId + "/dashboard/overview?action=share";
//     GlobalClient.goGetPath(dialogPath);
//     GlobalClient.sleep(400);
//     GlobalClient.waitForDOM("#change-app-owner");
//     GlobalClient.click("#change-app-owner");
//     cleanUpPendingUsers();
//     GlobalServer.execute(function() {
//       var mock = sinon.mock(Email);
//       mock.expects("send").once();
//       Meteor._mock = mock;
//     });

//     GlobalClient.waitForDOM("#app-change-owner-text");

//     GlobalClient.execute(function() {
//       $("#app-change-owner-text").val("test@meteorhacks.com");
//       $("#app-change-app-name-text").val("new-app");
//     });
//     GlobalClient.sleep(400);
//     GlobalClient.waitForDOM("#app-owner-change-confirm");
//     GlobalClient.click("#app-owner-change-confirm");
//     GlobalClient.sleep(400);

//     var ownerCount = GlobalClient.execute(function() {
//       return $(".shared-user-list.owner li").length
//     });
//     var demo = GlobalClient.execute(function() {
//       return $(".shared-user-list.owner").html()
//     });
//     GlobalClient.sleep(400);
//     var resendElm = ".shared-user-list.owner li:nth-child(3) .resend-invite";
//     GlobalClient.waitForDOM(resendElm);
//     GlobalClient.click(resendElm);

//     GlobalServer.execute(function() {
//       Meteor._mock.verify();
//       Meteor._mock.restore();
//     });
//   });

//   it("change owner and remove pending email", function() {
//     var appId = createApp();
//     var dialogPath = "/apps/" + appId + "/dashboard/overview?action=share";
//     GlobalClient.goGetPath(dialogPath);
//     GlobalClient.sleep(400);
//     GlobalClient.waitForDOM("#change-app-owner");
//     GlobalClient.click("#change-app-owner");
//     cleanUpPendingUsers();
//     GlobalServer.execute(function() {
//       var mock = sinon.mock(Email);
//       mock.expects("send").once();
//       Meteor._mock = mock;
//     });

//     GlobalClient.waitForDOM("#app-change-owner-text");

//     GlobalClient.execute(function() {
//       $("#app-change-owner-text").val("test@meteorhacks.com");
//       $("#app-change-app-name-text").val("new-app");
//     });
//     GlobalClient.sleep(400);
//     GlobalClient.waitForDOM("#app-owner-change-confirm");
//     GlobalClient.click("#app-owner-change-confirm");
//     GlobalClient.sleep(400);

//     var ownerCount = GlobalClient.execute(function() {
//       return $(".shared-user-list.owner li").length
//     });
//     var demo = GlobalClient.execute(function() {
//       return $(".shared-user-list.owner").html()
//     });
//     GlobalClient.sleep(400);
//     var el = ".shared-user-list.owner li:nth-child(3) .remove-owner-invite"; 
//     GlobalClient.waitForDOM(el);
//     GlobalClient.click(el);

//     GlobalServer.execute(function() {
//       Meteor._mock.verify();
//       Meteor._mock.restore();
//     });
//   });
//   it("change owner and accept");
//   it("collaborator can remove himself from the app");
// });

// function createApp(){
//   GlobalServer.cleanUpUsers();
//   GlobalClient.createUserAndLogin();
//   GlobalServer.cleanUpApps();
//   var userId = GlobalClient.userId();
//   var fields = {
//     initialDataReceived: true,
//     owner: userId
//   };
//   var appId = GlobalServer.createApp("new-app", userId, fields);
//   return appId;
// }


// function cleanUpPendingUsers(){
//   GlobalServer.execute(function() {
//     PendingUsers.remove({});
//   });
// }

// function addPendingUser(app, type) {
//   GlobalServer.execute(function(app, type) {
//     PendingUsers.insert({type: type, email: "test@meteorhacks", app: app});
//   }, [app, type]);
// }
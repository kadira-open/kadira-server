Tinytest.add('Permissions Manager - define action', function(test) {
  cleanUpValues();
  PermissionsMananger.defineAction("action1", ["collaborator", "admin"]);
  test.equal(PermissionsMananger._actions, { action1: { collaborator: true, admin: true } });
});

Tinytest.add('Permissions Manager - define action for all roles', function(test) {
  cleanUpValues();
  PermissionsMananger.defineAction("action1", ["all"]);
  test.equal(PermissionsMananger._actions, { action1: { all: true } });
});

Tinytest.add('Permissions Manager - define except role', function(test) {
  cleanUpValues();
  PermissionsMananger.defineAction("action1", {except: ["collaborator"]});
  test.equal(PermissionsMananger._actions, { action1: { except: ["collaborator"] } });
});

Tinytest.add('Permissions Manager - allow action', function(test) {
  cleanUpValues();
  PermissionsMananger.defineAction("action1", ["collaborator"]);
  var isAllowed = PermissionsMananger.allowAction("action1", "collaborator");
  test.equal(isAllowed, true);
});

Tinytest.add('Permissions Manager - allow action for all roles', function(test) {
  cleanUpValues();
  PermissionsMananger.defineAction("action1", ["all"]);
  var isAllowed = PermissionsMananger.allowAction("action1", "collaborator");
  test.equal(isAllowed, true);
});

Tinytest.add('Permissions Manager - deny action', function(test) {
  cleanUpValues();
  PermissionsMananger.defineAction("action2", ["admin"]);
  var isAllowed = PermissionsMananger.allowAction("action2", "collaborator");
  test.equal(isAllowed, false);
});

Tinytest.add('Permissions Manager - deny action from except', function(test) {
  cleanUpValues();
  PermissionsMananger.defineAction("action1", {except: ["collaborator"]});
  var isAllowed = PermissionsMananger.allowAction("action1", "collaborator");
  test.equal(isAllowed, false);
});

Tinytest.add('Permissions Manager - allow action from except', function(test) {
  cleanUpValues();
  PermissionsMananger.defineAction("action1", {except: ["collaborator"]});
  var isAllowed = PermissionsMananger.allowAction("action1", "admin");
  test.equal(isAllowed, true);
});

function cleanUpValues(){
  PermissionsMananger._actions = {};
}
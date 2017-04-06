# Permissions and Roles

In Kadira there are different things users can do for their app. We call these actions. Here are few examples for actions:

* Access data
* Change Settings
* Add collobarators

We also have a concept called roles. Actions are tighted with these roles. For an example:

* owner can change settings
* collobarator can access data

This package handle permissions and roles.

**Take attention to following notes:**

* In kadira, there is a special role called "owner". It's added automatically to the owner of an application.
* actions are based on per app basis.

## 1. Define actions

First you need to define actions in your app and map them into a set of roles.

~~~js
PermissionsMananger.defineAction("manage_collaborators", ["owner"]);
PermissionsMananger.defineAction("data_access", ["collaborator", "owner", "admin"]);
~~~

You need to define these actions in a place, where it can be seen from both client and the server. In kadira-ui we put this into `config/permissions.js`.

## 2. Then we need to put users into roles

You need to do this on per app basis. Normally, this happens when the owner added a user from our share logic.

~~~js
var appId = "some-app";
var userId = "my-user-id"
var role = "collaborator";

PermissionsMananger.roles.addRoleForApp(appId, userId, role);
~~~

## 3. Check permission before you do some action

We need to check permission before we allow someone to do an action. We need to do this in both **client and the server**.

~~~js
var action = "manage_collaborators";
var appId = "some-app";
var userId = "my-user-id"
if(PermissionsMananger.roles.isAllowed(action, appId, userId)) {
    console.log("yep, I can manage collaborators");
}
~~~

Here, we check whether `my-user-id` has permission to do action `manage_collaborators` for the app `some-app`.

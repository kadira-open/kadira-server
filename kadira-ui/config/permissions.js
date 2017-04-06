PermissionsMananger.defineAction("manage_collaborators", ["owner"]);
PermissionsMananger
  .defineAction("data_access", ["collaborator", "owner", "admin"]);
PermissionsMananger
  .defineAction("profiler", ["collaborator", "owner", "admin"]);
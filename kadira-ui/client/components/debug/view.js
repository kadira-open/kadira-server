continueSessionSave = false;

Template["debug"].events({
  "submit #debug-control": function(e) {
    e.preventDefault();
    var url = $("#debug-app-url").val();
    FlowComponents.callAction("connectToDebugApp", url);
  },

  "keypress #debug-app-url": function(e) {
    if(e.keyCode === 13) {
      e.preventDefault();
      var url = $("#debug-app-url").val();
      FlowComponents.callAction("connectToDebugApp", url);
    }
  },

  "click .btn-reset": function(e) {
    e.preventDefault();
    FlowComponents.callAction("resetDebugSession");
  },

  "click .reset-token": function() {
    FlowComponents.callAction("resetAccessToken");
  },

  "click .btn-enter-full-screen": function(e) {
    e.preventDefault();
    FlowComponents.callAction("toggleFullScreen", "enter");
  },

  "click .btn-exit-full-screen": function(e) {
    e.preventDefault();
    FlowComponents.callAction("toggleFullScreen", "exit");
  },

  "submit .auth-key-dialog": function(e) {
    e.preventDefault();
    var authKey = $.trim($("#debug-auth-key").val());
    $("#debug-auth-key").val("");
    FlowComponents.callAction("connectToDebugAppWithAuthKey", authKey);
  },

  "click .btn-save": function(e) {
    e.preventDefault();
    $(".btn-save span").removeClass("glyphicon-floppy-disk");
    $(".btn-save span").addClass("glyphicon-refresh");
    $(".btn-save span").addClass("saving");

    FlowComponents.callAction("saveDebugStore")
    .then(function(ready) {
      if (ready) {
        setTimeout(function(){
          $(".a-save")[0].click();
          $(".btn-save span").removeClass("saving");
          $(".btn-save span").removeClass("glyphicon-refresh");
          $(".btn-save span").addClass("glyphicon-floppy-disk");
        }, 0);
      }
    });
  },

  "click .btn-load": function(e) {
    e.preventDefault();
    $("#file-load-session").click();
  },

  "change #file-load-session": function(e) {
    e.stopPropagation();
    e.preventDefault();

    file = $("input[name=file-load-session]").prop("files")[0];
    FlowComponents.callAction("loadDebugStore", file);
    
    // reset
    $("input[name=file-load-session]").val('');
  }
});

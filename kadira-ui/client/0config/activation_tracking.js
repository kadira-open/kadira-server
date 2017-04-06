Deps.autorun(function(){
  var appId = FlowRouter.getParam("appId");
  if(appId){
    Apps.find({_id: appId}, {initialDataReceived: 1}).observe({
      changed: function(newDocument){
        showIntroVideo(newDocument);
      },
      added: function(doc) {
        showIntroVideo(doc);
      }
    });
  }
});

function showIntroVideo(doc) {
  if(doc.initialDataReceived) {
    UserEvents.ensureState("activated", function() {});
  }
}
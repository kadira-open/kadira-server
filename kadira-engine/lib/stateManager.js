module.exports = StateManager = {};

StateManager.setState = function(db, app, state, callback) {
  var appsCollection = db.collection('apps');

  if(app && !app[state]) {
    var appId = app._id;
    var updateFields = {};
    updateFields[state] = Date.now();
    appsCollection.update({_id: appId}, {$set: updateFields}, afterUpdated);
  } else {
    if(callback) callback();
  }

  function afterUpdated(err) {
    if(err) {
      //todo: do the error handling and re-try logic
      console.error('error on setting ' + state +' for app:', {appId: appId, error: err.message});
    }

    if(callback) callback(err);
  }
};
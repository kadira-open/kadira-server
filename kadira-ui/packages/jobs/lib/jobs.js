Jobs = {};

var subs = new SubsManager();

Jobs.subscribe = function(appId, query, options) {
  options = options || {};
  options.limit = options.limit || 20;
  query = query || {};
  var subsReady;
  if(query._id){
    subsReady = Meteor.subscribe('shareJob', query._id);
  } else {
    subsReady = Meteor.subscribe('jobsList', appId, query, options);
  }
  return subsReady;
};

Jobs.find = function(appId, query){
  query = query || {};
  query.appId = appId;
  return JobsCollection.find(query, {sort: {updatedAt: -1}});
}

Jobs.findOne = function(jobId){
  query = query || {};
  query._id = jobId;
  return JobsCollection.findOne(query);
}

Jobs.createOrUpdate = function(jobId, jobInfo, callback){
  callback = callback || function(){};
  Meteor.call('createOrUpdateJob', jobId, jobInfo, callback);
}

Jobs.delete = function(jobId, callback){
  callback = callback || function(){};
  Meteor.call('deleteJob', jobId, callback);
}
Meteor.publish('jobsList', function (appId, query, options) {
  check(appId, String);
  check(query, Match.Optional(Object));
  check(options, Match.Optional(Object));
  this.unblock();

  var plan = Utils.getPlanForTheApp(appId);
  if(!PlansManager.allowFeature('profiler', plan)){
    throw new Meteor.Error(403, i18n('profiler.profiler_denied_msg'));
  }

  var isAllowed = PermissionsMananger.roles.isAllowed('profiler', appId, this.userId);
  var user = Meteor.users.findOne({_id: this.userId}, {fields: {_id: 1, admin: 1}});
  var isAdmin = Utils.isAdmin(user);
  if(!isAllowed && !isAdmin){
    throw new Meteor.Error(403, i18n('profiler.not_authorized'));
  }

  options = _.pick(options, ['limit'])  || {};

  check(options.limit, Match.Integer);

  options.sort = {updatedAt: -1};
  options = {fields: {'data.uploadUrl': 0}}
  query = query || {};
  query.appId = appId;

  if(query._id) {
    return JobsCollection.find({_id: query._id});
  }

  var app = Apps.findOne({_id: appId}, {fields: {_id: 1}});

  if(app) {
    return JobsCollection.find(query, options);
  } else {
    this.ready();
  }

});

Meteor.publish('shareJob', function(jobId){
  check(jobId, String);
  return JobsCollection.find({_id: jobId});
});

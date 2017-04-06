Job = function (jobType, appId, jobId) {
  jobId = jobId || Random.id();
  this.data = this.data || {};
  this.appId = appId;
  this.jobId = jobId;
  if(!appId){
    throw new Meteor.Error(403, 'need a valid appId'); 
  } 
  if(!jobType){
    throw new Meteor.Error(403, 'need a valid jobType'); 
  }
  this.jobType = jobType;
}

Job.prototype.setData = function(data, callback) {
  var dataObject = {};
  data = data || {};
  if(!data.name){
    data.name = this.jobType + Math.round(Math.random()*10000)
  }
  this.data = data;
  for(var prop in data){
    dataObject["data." + prop] = data[prop];
  }

  var jobInfo = {};
  jobInfo = _.clone(dataObject);
  if(this.jobType){
    jobInfo.type =  this.jobType;
  }
  
  jobInfo.appId = this.appId;
  jobInfo.state = this.state || "created";

  Jobs.createOrUpdate(this.jobId, jobInfo, function(error, result){
    if(typeof callback === "function"){
      callback(error, result);
    }
  });
};

Job.prototype.setState = function(state, data) {
  this.state = state;
  data = data || this.data;
  this.setData(data);
};

Job.prototype.getItem = function() {
  return Jobs.findOne(this.jobId);
};

Job.prototype.getState = function(){
  var item = Jobs.findOne(this.jobId);
  return item && item.state;
}
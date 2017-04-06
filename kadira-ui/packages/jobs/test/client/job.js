Tinytest.addAsync('Job - create job', function(test, done){
  var jobId = Random.id();
  var originalCreateJob = Jobs.createOrUpdate;
  Jobs.createOrUpdate = function(_id, jobInfo){
    var expected = {
      "data.key": "test",
      'data.name': 'jobname',
      'type': "new-job",
      'appId': 'app-id',
      'state': 'created'
    }
    test.equal(_id, jobId);
    test.equal(jobInfo, expected);
    Jobs.createOrUpdate = originalCreateJob;
    done();
  }

  var job = new Job('new-job','app-id', jobId);
  job.setData({
    'key': 'test',
    'name': 'jobname'
  });
});

Tinytest.addAsync('Job - set state', function(test, done){
  var jobId = Random.id();
  var originalCreateJob = Jobs.createOrUpdate;
  Jobs.createOrUpdate = function(_id, jobInfo){
    var expected = {
      'type': "new-job2",
      'data.name': 'jobname',
      'appId': 'app-id',
      'state': "running",
      'state': 'created',
      'data.duration': 1000
    };
    test.equal(_id, jobId);
    test.equal(jobInfo, expected);
    Jobs.createOrUpdate = originalCreateJob;
  };

  var job = new Job('new-job2', 'app-id', jobId);
  job.setData({
    'name': 'jobname',
    'duration': 1000
  });

  Jobs.createOrUpdate = function(_id, jobInfo){
    var expected = {
      'type': "new-job2",
      'data.name': 'jobname',
      'appId': 'app-id',
      'state': "running",
      'data.duration': 1000
    }
    test.equal(_id, jobId);
    test.equal(jobInfo, expected);
    Jobs.createOrUpdate = originalCreateJob;
    done();
  };
  job.setState('running');
});

KadiraErrorFilters = {};
KadiraErrorFilters.filterErrorsByStatus = function () {
  return function(data, args) {
    var showIgnored = KadiraErrorFilters._canShowIgnored(args);
    var status = args.status;
    if(args.status === "all"){
      status = false;
    }
    var appId = args.appId;
    var filteredErrorsMeta = KadiraErrorFilters._getErrorsMeta(data, appId);
    if(status){
      var newData = 
      KadiraErrorFilters._includeByStatus(data, filteredErrorsMeta, status);
      return newData;
    }

    if(showIgnored){
      return KadiraErrorFilters._getAllErrors(data, filteredErrorsMeta);
    } else {
      var filteredIgnored = 
      KadiraErrorFilters._excludeByStatus(data, filteredErrorsMeta, "ignored");
      return filteredIgnored;
    }
  };

};

KadiraErrorFilters._getErrorsMeta = function getErrorsMeta(data, appId) {
  var query = {};
  query.appId = {$in: appId};
  if(data.length > 0){
    query["$or"] = [];
    data.forEach(function (d) {
      query["$or"].push({"name": d._id.name, "type": d._id.type});
    });
  }
  var fields = {fields: {name: 1, status: 1, type: 1}};
  var errorsMeta = ErrorsMeta.find(query, fields).fetch();

  var filteredErrorsMetaMap = {};
  errorsMeta.forEach(function(m) {
    filteredErrorsMetaMap[m.name + m.type] = m;
  });
  return filteredErrorsMetaMap;
};

KadiraErrorFilters._getAllErrors = 
function getAllErrors(data, filteredErrorsMetaMap) {
  var newData = [];

  data.forEach(function(d) {
    var found = filteredErrorsMetaMap[d._id.name + d._id.type];
    d = KadiraErrorFilters._setStatusForError(found, d);
    newData.push(d);
  });
  return newData;
};

KadiraErrorFilters._includeByStatus =
function includeByStatus(data, filteredErrorsMetaMap, status) {
  var newData = [];
  data.forEach(function(d) {
    var found = filteredErrorsMetaMap[d._id.name + d._id.type];
    d = KadiraErrorFilters._setStatusForError(found, d);
    if(d.status === status){
      newData.push(d);
    }
  });
  return newData;
};

KadiraErrorFilters._excludeByStatus =
function excludeByStatus(data, filteredErrorsMetaMap, status) {
  var newData = [];
  data.forEach(function(d) {
    var found = filteredErrorsMetaMap[d._id.name+d._id.type];
    d = KadiraErrorFilters._setStatusForError(found, d);
    if(d.status !== status) {
      newData.push(d);
    }
  });
  return newData;
};

KadiraErrorFilters._canShowIgnored =
function canShowIgnored(args) {
  var status = args.status;
  // if status is ignored we must show ignored errors
  if(status === "ignored") {
    return true;
  }
  //only look at status arg if it is "all"
  if(status === "all"){
    return args.showIgnored;
  }
  return false;
};

KadiraErrorFilters._setStatusForError =
function setStatusForError(found, error){
  if(found){
    error.status = found.status;
  } else {
    error.status = "new";
  }
  return error;
};
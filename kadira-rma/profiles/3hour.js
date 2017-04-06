var PROFILE = {
  name: '3hour',
  //we normally aggregate (lastTime - <xxx> time) data due to the fact some data might come late
  reverseMillis: 1000 * 60 * 60 * 3.5,
  //time range assigned for this profile
  timeRange: 1000 * 60 * 60 * 3,
  //collection where we need to read data from,
  maxAllowedRange:  1000 * 60 * 60 * 15, // 15 hours
  //collection where we need to read data from
  resolution: '30min'
};

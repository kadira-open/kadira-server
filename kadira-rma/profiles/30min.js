var PROFILE = {
  name: '30min',
  //we normally aggregate (lastTime - <xxx> time) data due to the fact some data might come late
  reverseMillis: 1000 * 60 * 31,
  //time range assigned for this profile
  timeRange: 1000 * 60 * 30,
  // only process upto
  maxAllowedRange:  1000 * 60 * 60 * 5, // 5 hours
  //collection where we need to read data from
  resolution: '1min'
};

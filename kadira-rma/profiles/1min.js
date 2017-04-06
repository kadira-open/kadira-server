var PROFILE = {
  name: '1min',
  //we normally aggregate (lastTime - <xxx> time) data due to the fact some data might come late
  //but when quering for changes in the UI, we need to take twice the time of this
  //because of time diffrences in the Browser and RMA server
  reverseMillis: 60 * 1000 * 1.5,
  //time range assigned for this profile
  timeRange: 60* 1000,
  // only process back
  maxAllowedRange:  1000 * 60 * 60 * 2, // 3hours
  //used to filter resolutions for the input
  resolution: null
};

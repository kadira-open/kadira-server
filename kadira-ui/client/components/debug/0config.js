/* eslint max-len: 0 */
kdNavigation = [
  {
    id: "activities",
    label: "Activities",
    componentName: "debug.activities",
    defaultSubNav: null
  },
  {
    id: "timeline",
    label: "Timeline",
    componentName: "debug.timeline",
    defaultSubNav: null
  },
  {
    id: "cpu-profiler",
    label: "CPU Profiler",
    componentName: "debug.cpuProfiler",
    defaultSubNav: null
  }
];

kdStatusMessages = {
  "olderVersion": "Your app is using an older version of `kadira:debug` or it doesn't have `kadira:debug` package. Install the latest version of `kadira:debug`.",
  "startDebugSession": "Click following link to start a new remote debug session:",
  "unauthorized": "Incorrect Debug Auth Key, Try again!",
  "authorizationRequired": "Authorizing...",
  "waiting": "Waiting for connection...",
  "connecting": "Connecting...",
  "openDebugSession": "Open your app in a browser."
};
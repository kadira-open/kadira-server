/* eslint max-len: 0 */

var helpData = {
  "kd-activity-view-creation": {
    title: "About View Creation",
    message: "Time taken to call onCreated callbacks of the following views.",
    options: {
      placement: "bottom"
    }
  },
  "kd-activity-dom-creation": {
    title: "About DOM Creation",
    message: "Time taken to create DOM elements for the following views.",
    options: {
      placement: "right"
    }
  },
  "kd-activity-helpers": {
    title: "About Helpers",
    message: "Time taken to execute following Blaze template helpers.",
    options: {
      placement: "top"
    }
  },
  "kd-activity-autoruns": {
    title: "About Autoruns",
    message: "Time taken to run following template autorun and no. of times they've invalidated. (First run is not included)",
    options: {
      placement: "top"
    }
  },
  "kd-activity-view-destruction": {
    title: "About View Destructions",
    message: "Time taken to destroy views and call onDestroyed callbacks.",
    options: {
      placement: "bottom"
    }
  },
  "kd-activity-dom-destruction": {
    title: "About DOM Destructions",
    message: "Time taken to destroy DOM elements of the following views.",
    options: {
      placement: "right"
    }
  },
  "kd-activity-renders": {
    title: "About View Renderes",
    message: "Time taken to run onRendered callbacks of the following views.",
    options: {
      placement: "top"
    }
  }
};

InlineHelp.initHelp(helpData);

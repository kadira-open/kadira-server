import _ from 'lodash';

export function getTestAlertData(override = {}) {
  return _.merge({
    meta: {
      appId: '7Tij2HTGqhrRE3k78',
      name: 'High Method Response Time',
      rearmInterval: 600000,
      enabled: false,
      createdBy: 'vapXLdykrravRPua8',
      appName: 'kadira-ui'
    },
    rule: {
      type: 'methodRestime',
      hosts: [
        '$ANY'
      ],
      params: {
        threshold: 500,
        condition: 'greaterThan'
      },
      duration: 300000
    },
    triggers: [
      {
        type: 'email',
        params: {
          addresses: [
            'arunoda@meteorhacks.com'
          ]
        }
      },
      {
        type: 'webhook',
        params: {
          urls: [
            'https://zapier.com/hooks/catch/oy2s0e/'
          ]
        }
      }
    ],
    appName: 'kadira-ui',
    armed: new Date()
  }, override);
}

export function sleepFor(delay) {
  const p = new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, delay);
  });

  return p;
}

export function waitForEvent(eventEmitter, ...args) {
  const p = new Promise(resolve => {
    const argsWithCallback = args.concat([ resolve ]);
    eventEmitter.once.apply(eventEmitter, argsWithCallback);
  });

  return p;
}

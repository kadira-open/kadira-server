export default {
  apiUrl: 'http://_:secret@host.com/path',
  apiBaseUrl: 'http://host.com/',
  alert: {
    getInfo() {
      return {appId: '7Tij2HTGqhrRE3k78'};
    },
    getMetric() {
      return 'methodRestime';
    }
  },
  graphqlResponse: {
    metrics: [
      {
        host: 'kadira-ui-new-3-meteor',
        points: [
          124.4,
          64.17
        ]
      },
      {
        host: 'kadira-ui-new-4-meteor',
        points: [
          78.27,
          60.73
        ]
      }
    ]
  },
  streamsResponse: {
    'kadira-ui-new-3-meteor': [
      {timestamp: 1446622320000, value: 124.4},
      {timestamp: 1446622380000, value: 64.17}
    ],
    'kadira-ui-new-4-meteor': [
      {timestamp: 1446622320000, value: 78.27},
      {timestamp: 1446622380000, value: 60.73}
    ]
  }
};

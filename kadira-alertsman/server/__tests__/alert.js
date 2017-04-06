/* eslint max-len:0 no-unused-expressions:0 */
import { describe, it } from 'mocha';
import Alert from '../alert';
import { expect } from 'chai';
import { getTestAlertData } from './test_utils';
import { parse } from 'url';

describe('Alert', () => {
  describe('getId()', () => {
    it('should give id of the alert', () => {
      const dummyInfo = getTestAlertData({_id: 'test-alert-id'});
      const alert = new Alert(dummyInfo);
      expect(alert.getId()).to.equal('test-alert-id');
    });
  });

  describe('getMetric()', () => {
    // this is a key - correct mapping to graphql queries in lists on the
    // metrics store
    it('should give the metric type defined in the alert', () => {
      const dummyInfo = getTestAlertData({rule: {type: 'test-alert'}});
      const alert = new Alert(dummyInfo);
      expect(alert.getMetric()).to.equal('test-alert');
    });
  });

  describe('getInfo()', () => {
    it('should provide meta info in the alert', () => {
      const dummyInfo = getTestAlertData();
      const alert = new Alert(dummyInfo);
      const info = alert.getInfo();
      expect(info).to.deep.equal(dummyInfo.meta);
    });
  });

  describe('getTriggers()', () => {
    it('should provide triggers in the alert', () => {
      const dummyInfo = getTestAlertData();
      const alert = new Alert(dummyInfo);
      const triggers = alert.getTriggers();
      expect(triggers).to.deep.equal(dummyInfo.triggers);
    });
  });

  describe('isArmed()', () => {
    it('should be true if armed', () => {
      const dummyInfo = getTestAlertData({armedDate: new Date()});
      const alert = new Alert(dummyInfo);
      expect(alert.isArmed()).to.be.true;
    });
    it('should be false if not armed', () => {
      const dummyInfo = getTestAlertData({armed: null});
      const alert = new Alert(dummyInfo);
      expect(alert.isArmed()).to.be.false;
    });
  });

  describe('getArmedDate()', () => {
    it('should give alert armed if armed', () => {
      const dummyDate = new Date(1955, 9, 21);
      const dummyInfo = getTestAlertData({armedDate: dummyDate});
      const alert = new Alert(dummyInfo);
      expect(alert.getArmedDate()).to.equal(dummyDate);
    });
    it('should give null if the alert is not armed', () => {
      const dummyInfo = getTestAlertData({armedDate: null});
      const alert = new Alert(dummyInfo);
      expect(alert.getArmedDate()).to.be.null;
    });
  });

  describe('getLastArmedClearedDate()', () => {
    it('should give the lastArmedClearedDate if it is in the DB', () => {
      const dummyDate = new Date(1955, 9, 21);
      const dummyInfo = getTestAlertData({lastArmedClearedDate: dummyDate});
      const alert = new Alert(dummyInfo);
      expect(alert.getLastArmedClearedDate()).to.equal(dummyDate);
    });
    it('should give null if it is in the DB', () => {
      const dummyInfo = getTestAlertData({lastArmedClearedDate: null});
      const alert = new Alert(dummyInfo);
      expect(alert.getLastArmedClearedDate()).to.be.null;
    });
  });

  describe('getPredicates()', () => {
    const dummyInfo = getTestAlertData({rule: {
      type: 'methodRestime',
      hosts: [
        '$ALL'
      ],
      params: {
        threshold: 500,
        condition: 'greaterThan'
      },
      duration: 400000
    }});
    const alert = new Alert(dummyInfo);

    it('should has the singlePoint predicate', () => {
      expect(alert.getPredicates().singlePoint).to.deep.equal({
        threshold: 500,
        condition: 'greaterThan'
      });
    });
    it('should has the singleStream predicate', () => {
      expect(alert.getPredicates().singleStream).to.deep.equal({
        duration: 400000
      });
    });
    it('should has the allStreams predicate', () => {
      expect(alert.getPredicates().allStreams).to.deep.equal({
        type: '$ALL'
      });
    });
  });

  describe('getLastCheckedDate()', () => {
    it('should get the last updated date as a timestamp', () => {
      const dummyInfo = getTestAlertData({lastCheckedDate: 140000000});
      const alert = new Alert(dummyInfo);
      expect(alert.getLastCheckedDate()).to.equal(140000000);
    });
  });

  describe('_getURL()', () => {
    it('should include correct parameters', () => {
      const dummyInfo = getTestAlertData({
        meta: {
          appId: 'the-app-id'
        }
      });
      const alert = new Alert(dummyInfo);

      const urlObj = parse(alert._getURL(1000 * 60 * 1000));
      expect(urlObj.hostname).to.equal('ui.kadira.io');
      expect(urlObj.pathname).to.contain('apps/the-app-id');
      expect(urlObj.query).to.equal('range=3600000&date=58260000');
    });
  });

  describe('_getReason()', () => {
    it('should generate reason for one time alerts', () => {
      const dummyInfo = getTestAlertData({
        rule: {
          params: {
            condition: 'greaterThan'
          },
          duration: 0
        }
      });

      const alert = new Alert(dummyInfo);
      const result = {
        success: true,
        data: {
          'test-host': {
            result: true,
            data: {
              result: true,
              data: {timestamp: 1446622320000, value: 780.27}
            }
          }
        }
      };
      expect(alert._getReason(result)).to.equal('above');
    });

    it('should generate reason for continuous alerts', () => {
      const dummyInfo = getTestAlertData({
        rule: {
          params: {
            condition: 'lessThan'
          },
          duration: 60 * 1000
        }
      });

      const alert = new Alert(dummyInfo);
      const result = {
        success: true,
        data: {
          'test-host': {
            result: true,
            data: [
              {
                result: true,
                data: {timestamp: 1446622320000, value: 780.27}
              }
            ]
          }
        }
      };
      expect(alert._getReason(result)).to.equal('continuously below');
    });
  });

  describe('_getResultData()', () => {
    it('should generate time for one time alerts', () => {
      const dummyInfo = getTestAlertData({
        rule: {
          duration: 0
        }
      });

      const alert = new Alert(dummyInfo);
      const result = {
        success: true,
        data: {
          'test-host': {
            result: true,
            data: {
              result: true,
              data: {
                timestamp: (new Date(Date.UTC(2015, 0, 1))).getTime(),
                value: 780.27
              }
            }
          }
        }
      };

      expect(alert._getResultData(result).time).to.equal(
        (new Date(Date.UTC(2015, 0, 1))).getTime());
    });

    it('should generate time for continuous alerts', () => {
      const dummyInfo = getTestAlertData({
        rule: {
          duration: 5 * 60 * 1000
        }
      });

      const alert = new Alert(dummyInfo);
      const result = {
        success: true,
        data: {
          'test-host': {
            result: true,
            data: [
              {
                result: true,
                data: {
                  timestamp: (new Date(Date.UTC(2015, 0, 1))).getTime(),
                  value: 780.27
                }
              },
              {
                result: true,
                data: {
                  timestamp: (new Date(Date.UTC(2015, 0, 2))).getTime(),
                  value: 780.27
                }
              }
            ]
          }
        }
      };

      expect(alert._getResultData(result).time).to.equal(
        (new Date(Date.UTC(2015, 0, 1))).getTime());
    });


    it('should include hosts', () => {
      const dummyInfo = getTestAlertData({
        rule: {
          hosts: [
            '$ANY'
          ]
        }
      });
      const alert = new Alert(dummyInfo);
      const result = {
        success: true,
        data: {
          'test-host-1': {
            result: true,
            data: [
              {
                result: true,
                data: {timestamp: 1446622310000, value: 1000}
              }
            ]
          },

          'test-host-2': {
            result: true,
            data: [
              {
                result: true,
                data: {timestamp: 1446622320000, value: 1000}
              }
            ]
          },

          'test-host-3': {
            result: true,
            data: [
              {
                result: true,
                data: {timestamp: 1446622320000, value: 1000}
              }
            ]
          }
        }
      };

      expect(alert._getResultData(result).hosts).to.deep.equal(
        [ 'test-host-1', 'test-host-2', 'test-host-3' ]);
    });

    it('should include value', () => {
      const dummyInfo = getTestAlertData({
        rule: {
          params: {
            threshold: 50
          },
          duration: 0
        }
      });

      const alert = new Alert(dummyInfo);
      const result = {
        success: true,
        data: {
          'test-host': {
            result: true,
            data: {
              result: true,
              data: {timestamp: 1446622320000, value: 40}
            }
          }
        }
      };
      expect(alert._getResultData(result).value).to.equal(40);
    });

    it('should give average value', () => {
      const dummyInfo = getTestAlertData({
        rule: {
          params: {
            threshold: 50
          }
        }
      });

      const alert = new Alert(dummyInfo);
      const result = {
        success: true,
        data: {
          'test-host-1': {
            result: true,
            data: [
              {
                result: true,
                data: {timestamp: 1446622320000, value: 100}
              }
            ]
          },

          'test-host-2': {
            result: true,
            data: [
              {
                result: true,
                data: {timestamp: 1446622320000, value: 80}
              },
              {
                result: true,
                data: {timestamp: 1446622320000, value: 120}
              }
            ]
          }
        }
      };
      expect(alert._getResultData(result).value).to.equal(100);
    });
  });

  describe('getEmailInfoForTriggered', () => {
    it('should get correct email subject', () => {
      const appInfo = {
        appId: 'id',
        name: 'The Alert Name',
        appName: 'name-of-the-app'
      };

      const dummyInfo = getTestAlertData({meta: {...appInfo}});
      const alert = new Alert(dummyInfo);

      const result = {
        success: true,
        data: {
          'test-host-1': {
            result: true,
            data: [
              {
                result: true,
                data: {timestamp: 1446622320000, value: 100}
              }
            ]
          },
        }
      };

      const { subject } = alert.getEmailInfoForTriggered(result);
      expect(subject).to.be.equal(`Alert ${appInfo.name} of app: "${appInfo.appName}" has triggered!`);
    });

    it('should get correct email body', () => {
      const appInfo = {
        appId: 'id',
        name: 'The Alert Name',
        appName: 'name-of-the-app'
      };

      const dummyInfo = getTestAlertData({meta: {...appInfo}});
      const alert = new Alert(dummyInfo);

      const result = {
        success: true,
        data: {
          'test-host-1': {
            result: true,
            data: [
              {
                result: true,
                data: {timestamp: 1446622320000, value: 100}
              }
            ]
          },
        }
      };

      const { body } = alert.getEmailInfoForTriggered(result);
      expect(body).to.match(new RegExp(appInfo.appName));
      expect(body).to.match(/triggered/);
    });
  });

  describe('getEmailInfoForCleared', () => {
    it('should get correct email subject', () => {
      const appInfo = {
        appId: 'id',
        name: 'The Alert Name',
        appName: 'name-of-the-app'
      };

      const dummyInfo = getTestAlertData({meta: {...appInfo}});

      const alert = new Alert(dummyInfo);
      const { subject } = alert.getEmailInfoForCleared(alert);
      expect(subject).to.be.equal(`Alert ${appInfo.name} of app: "${appInfo.appName}" has cleared!`);
    });

    it('should get correct email body', () => {
      const appInfo = {
        appId: 'id',
        name: 'The Alert Name',
        appName: 'name-of-the-app'
      };

      const dummyInfo = getTestAlertData({meta: {...appInfo}});

      const alert = new Alert(dummyInfo);
      const { body } = alert.getEmailInfoForCleared(alert);
      expect(body).to.match(new RegExp(appInfo.appName));
      expect(body).to.match(/cleared/);
    });
  });

  describe('getSlackInfoForTriggered()', () => {
    it('should get correct parameters', async () => {
      const appInfo = {
        appId: 'id',
        name: 'The Alert Name',
        appName: 'name-of-the-app'
      };

      const dummyInfo = getTestAlertData({meta: {...appInfo}});
      const alert = new Alert(dummyInfo);

      const result = {
        success: true,
        data: {
          'test-host-1': {
            result: true,
            data: [
              {
                result: true,
                data: {timestamp: 1446622320000, value: 100}
              }
            ]
          },
        }
      };

      const params = await alert.getSlackInfoForTriggered(result);
      expect(params.attachments[0].title).to.have.string('triggered');
      expect(params.attachments[0].color).to.be.equal('danger');
      expect(params.attachments[0].title).to.match(new RegExp(appInfo.appName));
    });
  });

  describe('getSlackInfoForCleared()', () => {
    it('should get correct parameters', async () => {
      const appInfo = {
        appId: 'id',
        name: 'The Alert Name',
        appName: 'name-of-the-app'
      };

      const dummyInfo = getTestAlertData({meta: {...appInfo}});

      const alert = new Alert(dummyInfo);
      const params = await alert.getSlackInfoForCleared();
      expect(params.attachments[0].title).to.have.string('cleared');
      expect(params.attachments[0].color).to.be.equal('good');
      expect(params.attachments[0].title).to.match(new RegExp(appInfo.appName));
    });
  });
});

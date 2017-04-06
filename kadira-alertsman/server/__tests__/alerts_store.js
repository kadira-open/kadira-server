/* eslint max-len:0 no-unused-expressions:0 */
import { describe, it, before, beforeEach } from 'mocha';
import { MongoClient } from 'mongodb';
import MongoOplog from 'mongo-oplog';
import { expect } from 'chai';
import AlertStore from '../alerts_store';
import {getTestAlertData, sleepFor} from './test_utils';

const {
  APP_TEST_DB_URL,
  APP_TEST_DB_OPLOG_URL
} = process.env;

describe('AlertStore', () => {
  let db;
  let oplog;
  let alerts;

  const dbUrl = APP_TEST_DB_URL || 'mongodb://127.0.0.1:27017/apm_test';
  const oplogUrl = APP_TEST_DB_OPLOG_URL || 'mongodb://127.0.0.1:27017/apm_test';

  before(async () => {
    db = await MongoClient.connect(dbUrl);
    oplog = MongoOplog(oplogUrl);
  });

  beforeEach('clear alerts', async () => {
    oplog = MongoOplog(oplogUrl); // Needed for isolation

    alerts = db.collection('alerts');
    await alerts.remove();
  });

  describe('when loaded', async () => {
    it('should get all the alerts cache them and fire them as enabled', async () => {
      const store = new AlertStore(db, oplog, {collectionName: 'alerts'});

      const alert1 = getTestAlertData(
        {meta: {enabled: true, name: 'test-alert-1'}});
      const alert2 = getTestAlertData(
        {meta: {enabled: true, name: 'test-alert-2'}});
      const alert3 = getTestAlertData(
        {meta: {enabled: true, name: 'test-alert-3'}});

      await alerts.insert([ alert1, alert2, alert3 ]);
      let firedAlerts = 0;

      store.on('enabled', () => {
        firedAlerts++;
      });

      await store.load();

      await sleepFor(100);
      expect(Object.keys(store.alerts).length).to.equal(3);
      await store.close();
    });
  });

  describe('with oplog', () => {
    describe('for new alerts', () => {
      it('should fire them as enabled alerts', async done => {
        const store = new AlertStore(db, oplog, {collectionName: 'alerts'});
        const alertData = getTestAlertData({
          meta: {enabled: true},
          rule: {type: 'to-insert'}
        });

        await store.load();

        store.once('enabled', async alert => {
          expect(alert.getMetric()).to.equal('to-insert');
          await store.close();
          done();
        });

        await alerts.insert(alertData);
      });
    });

    describe('for modified alerts', () => {
      describe('if user disabled', () => {
        it('should fire as disabled if we already have it', async done => {
          const store = new AlertStore(db, oplog, {collectionName: 'alerts'});

          const alertData = getTestAlertData({
            meta: {enabled: true},
            rule: {type: 'to-disable'}
          });

          await store.load();
          await alerts.insert(alertData);

          await sleepFor(100);

          store.once('disabled', async alert => {
            expect(alert.getMetric()).to.equal('to-disable');
            await store.close();
            done();
          });

          alerts.updateOne({'rule.type': 'to-disable'}, {$set: {'meta.enabled': false}});
        });
      });

      describe('if user enabled', () => {
        it('should fire as enabled if we already disabled it', async () => {
          const store = new AlertStore(db, oplog, {collectionName: 'alerts'});
          const alertData = getTestAlertData({
            meta: {enabled: false},
            rule: {type: 'to-enable'}
          });

          await store.load();
          await alerts.insert(alertData);

          await sleepFor(100); // Wait a moment to oplog update above insert

          expect(store.alerts[alertData._id]).to.be.undefined;

          store.once('disabled', () => {
            setTimeout(() => {throw new Error('disabled called');});
          });

          store.once('enabled', alert => {
            expect(alert.getMetric()).to.equal('to-enable');
          });

          alerts.updateOne({'rule.type': 'to-enable'}, {$set: {'meta.enabled': true}});
          sleepFor(200);
          await store.close();
        });

        it('should fire disabled and then enabled, if we already have it', async done => {
          const store = new AlertStore(db, oplog, {collectionName: 'alerts'});
          const alertData = getTestAlertData({
            meta: {enabled: false},
            rule: {type: 'test-alert'}
          });

          await store.load();
          await alerts.insert(alertData);

          await sleepFor(100);// Wait a moment to oplog update above insert

          // Mimic that we've already enabled and inside the cache.
          store.alerts[alertData._id] = alertData;
          let disabledCalled = false;

          store.once('disabled', alert => {
            expect(alert.getMetric()).to.equal('test-alert');
            disabledCalled = true;
          });

          store.once('enabled', async alert => {
            expect(alert.getMetric()).to.equal('test-alert');
            expect(disabledCalled).to.be.true;
            await store.close();
            done();
          });

          alerts.updateOne({'rule.type': 'test-alert'}, {$set: {'meta.enabled': true}});
        });
      });

      describe('for other changes', () => {
        it('should fire disabled and then enabled', async done => {
          const store = new AlertStore(db, oplog, {collectionName: 'alerts'});
          const alertData = getTestAlertData({
            meta: {enabled: true},
            rule: {type: 'to-change'}
          });

          await store.load();

          // Tests are run on enabled callback of triggers by adding the testAlert
          store.once('enabled', async alert => {
            const totalTests = 3;
            let currentTest = 0;

            expect(alert.getMetric()).to.equal('to-change');
            let disabledCalled = 0;
            let enabledCalled = 0;

            store.on('disabled', () => {
              disabledCalled++;
            });

            store.on('enabled', async () => {
              enabledCalled++;
              expect(disabledCalled).to.equal(enabledCalled);
              currentTest++;
              if (currentTest >= totalTests) {
                // Clean up
                store.removeAllListeners('enabled');
                store.removeAllListeners('disabled');
                await store.close();
                done();
              }
            });

            await alerts.updateOne(
              {_id: alert.getId()},
              {$set: {'rule.type': 'new-name'}}
            );

            await alerts.updateOne(
              {_id: alert.getId()},
              {$set: {'meta.rearmInterval': 100}}
            );

            await alerts.updateOne(
              {_id: alert.getId()},
              {$set: {'rule.duration': 4000}}
            );
          });

          await alerts.insert(alertData);
        });
      });
    });

    describe('for removed alerts', () => {
      it('should fire them as disabled', async done => {
        const store = new AlertStore(db, oplog, {collectionName: 'alerts'});
        const alertData = getTestAlertData({
          meta: {enabled: true},
          rule: {type: 'to-remove'}
        });

        await store.load();

        store.once('enabled', async () => {
          store.once('disabled', async alert => {
            expect(alert.getMetric()).to.equal('to-remove');
            await store.close();
            done();
          });

          await alerts.removeOne({'rule.type': 'to-remove'});
        });

        await alerts.insert(alertData);
      });
    });
  });

  describe('with some interval', () => {
    describe('reset alerts', () => {
      it('should disable all existing alerts', async done => {
        const store = new AlertStore(
            db, oplog, {collectionName: 'alerts', resetInterval: 200});

        const alertData = getTestAlertData({
          meta: {enabled: true},
          rule: {type: 'to-reset'}
        });
        await alerts.insert(alertData);

        let calledCount = 0;

        store.once('enabled', async () => {
          calledCount++;
          // this should be reset in the next call
          const disabledAlerts = [];

          // register another call
          store.on('disabled', alert => {
            disabledAlerts.push(alert.getId());
          });

          await sleepFor(300);
          expect(disabledAlerts).to.deep.equals([ alertData._id ]);
          store.stopReseting();
          store.removeAllListeners();
          await store.close();
          done();
        });

        await store.load();
      });

      it('should load alerts again', async done => {
        const store = new AlertStore(
            db, oplog, {collectionName: 'alerts', resetInterval: 200});

        const alertData = getTestAlertData({
          meta: {enabled: true},
          rule: {type: 'to-reset'}
        });

        await alerts.insert(alertData);

        let calledCount = 0;

        store.once('enabled', alert => {
          calledCount++;
          // this should be reset in the next call
          delete store.alerts[alert.getId()];

          // register another call
          store.on('enabled', async alertAgain => {
            expect(store.alerts[alertAgain.getId()]).to.be.not.null;
            store.stopReseting();

            await sleepFor(200); // To check if resetting is stopped
            store.removeAllListeners();
            await store.close();
            done();
          });
        });

        await store.load();
      });
    });
  });

  describe('setArmed()', () => {
    describe('is true', () => {
      it('should set the armedDate and clear lastArmedClearedDate', async done => {
        const store = new AlertStore(db, oplog, {collectionName: 'alerts'});
        const alertData = getTestAlertData({
          meta: {enabled: true},
          lastArmedClearedDate: new Date(1985, 9, 21),
          rule: {type: 'to-arm'}
        });

        await store.load();
        store.once('enabled', async alert => {
          expect(alert.getMetric()).to.equal('to-arm');

          await store.setArmed(alert, true);
          const now = new Date();
          let armedAlert = await alerts.findOne({'rule.type': 'to-arm'});

          expect(now - armedAlert.armedDate).to.be.below(50);
          expect(armedAlert.lastArmedClearedDate).to.be.null;

          await store.close();
          done();
        });

        await alerts.insert(alertData);
      });
    });

    describe('is false', () => {
      it('should clear the armedDate and set lastArmedClearedDate', async done => {
        const store = new AlertStore(db, oplog, {collectionName: 'alerts'});
        const alertData = getTestAlertData({
          meta: {enabled: true},
          armedDate: new Date(1985, 9, 21),
          rule: {type: 'to-arm'}
        });

        await store.load();
        store.once('enabled', async alert => {
          expect(alert.getMetric()).to.equal('to-arm');

          await store.setArmed(alert, false);
          const now = new Date();
          let armedAlert = await alerts.findOne({'rule.type': 'to-arm'});

          expect(armedAlert.armedDate).to.be.null;
          expect(now - armedAlert.lastArmedClearedDate).to.be.below(50);

          await store.close();
          done();
        });

        await alerts.insert(alertData);
      });
    });

    it('should fire alert as disabled and then enable is with the new data', async done => {
      const store = new AlertStore(db, oplog, {collectionName: 'alerts'});
      const alertData = getTestAlertData({
        meta: {enabled: true},
        armedDate: new Date(1985, 9, 21),
        rule: {type: 'to-arm-2'}
      });

      await store.load();

      store.once('enabled', async alert => {
        expect(alert.getMetric()).to.equal('to-arm-2');

        var disabledCalled = false;

        store.once('disabled', async alertArmed => {
          expect(alertArmed.getMetric()).to.equal('to-arm-2');
          disabledCalled = true;
        });

        store.once('enabled', async alertArmed => {
          expect(alertArmed.getMetric()).to.equal('to-arm-2');
          expect(disabledCalled).to.be.true;
          await store.close();
          done();
        });

        store.setArmed(alert, true);
      });

      alerts.insert(alertData);
    });
  });

  describe('updateLastCheckedDate()', () => {
    it('should set the `lastCheckedDate` field as the current time', async done => {
      const store = new AlertStore(db, oplog, {collectionName: 'alerts'});
      const alertData = getTestAlertData({
        meta: {enabled: true},
        rule: {type: 'to-check'}
      });

      await store.load();
      store.once('enabled', async alert => {
        expect(alert.getMetric()).to.equal('to-check');

        await store.updateLastCheckedDate(alert);
        const now = new Date();
        let checkedAlert = await alerts.findOne({'rule.type': 'to-check'});
        expect(now - checkedAlert.lastCheckedDate).to.be.below(50);

        await store.close();
        done();
      });

      await alerts.insert(alertData);
    });

    it('should set it to a custom timestamp if provided', async done => {
      const store = new AlertStore(db, oplog, {collectionName: 'alerts'});
      const alertData = getTestAlertData({
        meta: {enabled: true},
        rule: {type: 'to-check'}
      });

      await store.load();
      store.once('enabled', async alert => {
        expect(alert.getMetric()).to.equal('to-check');

        await store.updateLastCheckedDate(alert, new Date(1985, 9, 21));
        let checkedAlert = await alerts.findOne({'rule.type': 'to-check'});
        expect(checkedAlert.lastCheckedDate).to.deep.equal(new Date(1985, 9, 21));

        await store.close();
        done();
      });

      await alerts.insert(alertData);
    });

    it('should update cache trigger disabe and then enable', async done => {
      const store = new AlertStore(db, oplog, {collectionName: 'alerts'});
      const alertData = getTestAlertData({
        meta: {enabled: true},
        rule: {type: 'to-check-events'}
      });

      await store.load();
      store.once('enabled', async alert => {
        expect(alert.getMetric()).to.equal('to-check-events');

        var disabledCalled = false;

        store.once('disabled', async updatedAlert => {
          expect(updatedAlert.getMetric()).to.equal('to-check-events');
          disabledCalled = true;
        });

        store.once('enabled', async updatedAlert => {
          expect(updatedAlert.getMetric()).to.equal('to-check-events');
          expect(updatedAlert.getLastCheckedDate()).to.deep.equal(new Date(2015, 9, 21));
          expect(disabledCalled).to.be.true;
          await store.close();
          done();
        });

        await store.updateLastCheckedDate(alert, new Date(2015, 9, 21));
      });

      await alerts.insert(alertData);
    });
  });
});

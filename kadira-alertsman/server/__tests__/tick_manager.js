/* eslint no-unused-expressions:0 max-len:0 */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { getTestAlertData, sleepFor, waitForEvent } from './test_utils';
import TickManager from '../tick_manager';
import Alert from '../alert';

describe('TickManager', () => {
  it('should register alerts', () => {
    const opt = {
      triggerInterval: 50
    };

    const tickManager = new TickManager(opt);
    const alert = new Alert(getTestAlertData());
    tickManager.register(alert);
    expect(tickManager.alertTimers[alert.getId()]).to.be.ok;
    tickManager.close();
  });

  it('should unregister first if trying to register an already registered alert', done => {
    const opt = {
      triggerInterval: 50
    };

    const tickManager = new TickManager(opt);
    const alertId = Math.random();
    const alert = {getId: () => alertId};
    tickManager.register(alert);

    var original = tickManager.unregister;
    tickManager.unregister = (...args) => {
      original.apply(tickManager, args);
      setTimeout(() => {
        tickManager.close();
        expect(tickManager.alertTimers[alert.getId()]).to.be.ok;
        done();
      }, 0);
    };

    // trying to register again
    tickManager.register(alert);
  });

  it('should unregister alerts', async () => {
    const opt = {
      triggerInterval: 50
    };

    const tickManager = new TickManager(opt);
    const alert = new Alert(getTestAlertData());
    tickManager.register(alert);
    tickManager.unregister(alert);
    expect(tickManager.alertTimers[alert.getId()]).to.be.not.ok;
    tickManager.close();
  });

  describe('fire event', () => {
    it('should emit the first fire in random intervals', async () => {
      const opt = {
        triggerInterval: 50
      };

      let totalTime = 0;
      const loopCount = 10;
      for (let lc = 0; lc < loopCount; lc++) {
        const tickManager = new TickManager(opt);
        tickManager.register({getId: () => Math.random()});

        const start = Date.now();
        await waitForEvent(tickManager, 'fire');
        const diff = Date.now() - start;
        totalTime += diff;
        tickManager.close();
      }

      const meanTimeDiff = totalTime / loopCount;
      expect(meanTimeDiff).to.be.below(opt.triggerInterval);
    });

    it('should continously emit events', async () => {
      const opt = {
        triggerInterval: 50
      };

      const tickManager = new TickManager(opt);
      const alertId = Math.random();
      tickManager.register({getId: () => alertId});

      // wait for the initial random event firing
      await waitForEvent(tickManager, 'fire');

      let fireCounts = 0;
      tickManager.on('fire', alert => {
        expect(alert.getId()).to.be.equal(alertId);
        fireCounts++;
      });

      const expectedFireCounts = 4;
      await sleepFor(opt.triggerInterval * expectedFireCounts + 20);
      expect(fireCounts).to.be.equal(expectedFireCounts);
      tickManager.close();
    });
  });

  describe('kill firing', () => {
    it('should remove the initial timeout', async () => {
      const opt = {
        triggerInterval: 50
      };

      const tickManager = new TickManager(opt);
      const alertId = Math.random();
      const alert = {getId: () => alertId};

      tickManager.register(alert);

      tickManager.on('fire', () => {
        throw new Error('should not receive a fire');
      });

      tickManager.unregister(alert);
      await sleepFor(opt.triggerInterval + 20);
      tickManager.close();
    });

    it('should remove the interval', async () => {
      const opt = {
        triggerInterval: 50
      };

      const tickManager = new TickManager(opt);
      const alertId = Math.random();
      const alert = {getId: () => alertId};

      tickManager.register(alert);

      await waitForEvent(tickManager, 'fire');

      tickManager.on('fire', () => {
        throw new Error('should not receive a fire');
      });

      tickManager.unregister(alert);
      await sleepFor(opt.triggerInterval * 3);
      tickManager.close();
    });
  });
});

/* eslint max-len:0 */

import AlertsStore from './alerts_store';
import TickManager from './tick_manager';
import MetricsStore from './metrics/store';
import RuleEngine from './rules/engine';
import Messenger from './messenger';
import { processAlone } from './utils';
import { MongoClient } from 'mongodb';
import MongoOplog from 'mongo-oplog';
import librato from 'librato-node';
import * as urlShortener from './url_shortener';
const debug = require('debug')('alertsman:index');
const { info, error } = console;

const {
  NODE_ENV,
  APP_DB_URL,
  APP_DB_OPLOG_URL,
  KADIRA_API_URL,
  MAIL_URL,
  TICK_TRIGGER_INTERVAL = 1000 * 10,
  MESSENGER_LOGGING_ONLY,
  LIBRATO_EMAIL,
  LIBRATO_TOKEN,
  LIBRATO_PUSH_INTERVAL = 1000 * 60,
  LIBRATO_METRICS_PREFIX = 'alertsman.',
  GOOGLE_DEV_KEY
} = process.env;

(async () => {
  try {
    const appDb = await MongoClient.connect(APP_DB_URL);
    const oplogFilterNs = `${appDb.databaseName}.alerts`;
    const oplogConn = new MongoOplog(APP_DB_OPLOG_URL, {ns: oplogFilterNs});
    const alertsStore = new AlertsStore(appDb, oplogConn);

    const tickManager = new TickManager({triggerInterval: parseInt(TICK_TRIGGER_INTERVAL, 10)});
    const metricsStore = new MetricsStore(KADIRA_API_URL);
    const rules = new RuleEngine();
    const messenger = new Messenger(MAIL_URL, {loggingOnly: Boolean(MESSENGER_LOGGING_ONLY)});

    librato.configure({
      email: LIBRATO_EMAIL,
      token: LIBRATO_TOKEN,
      period: LIBRATO_PUSH_INTERVAL,
      prefix: LIBRATO_METRICS_PREFIX
    });
    librato.start();

    urlShortener.setGoogleDevKey(GOOGLE_DEV_KEY);

    alertsStore
      .on('enabled', alert => tickManager.register(alert))
      .on('disabled', alert => tickManager.unregister(alert));

    const handleFire = async alert => {
      const endTime = Date.now();
      const startTime = endTime - 60 * 60 * 1000;
      const data = await metricsStore.getMetrics(alert, startTime, endTime);
      const checkedResult = rules.check(alert, data);
      const armed = alert.isArmed();
      const alertId = alert.getId();

      // XXX: Use moment of a util function to normalize this
      const now = Date.now();
      const diff = now % (1000 * 60);
      const lastCheckedMinute = new Date(now - diff);
      alertsStore.updateLastCheckedDate(alert, lastCheckedMinute);

      debug(`tick firing success=${checkedResult.success} armed=${armed} id=${alertId}`);

      if (!armed && checkedResult.success) {
        // We don't need to wait until the trigger sends
        // to mark the alert as armed.
        messenger.sendTriggered(alert, checkedResult);
        librato.increment('triggers');
        await alertsStore.setArmed(alert, true);
        return;
      }

      if (armed && !checkedResult.success) {
        // We don't need to wait until the trigger sends
        // to mark the alert as cleared.
        messenger.sendCleared(alert, checkedResult);
        librato.increment('clears');
        await alertsStore.setArmed(alert, false);
        return;
      }

      librato.increment('checkes');
    };

    tickManager
      .on('fire', async alert => {
        await processAlone(alert, async () => {
          try {
            await handleFire(alert);
          } catch (ex) {
            error(ex.message);
          }
        });
      });

    await alertsStore.load();
    info('Kadira Alertsman started');
  } catch (ex) {
    setTimeout(() => {throw ex;}, 0);
  }
})();

import { EventEmitter } from 'events';
import _ from 'lodash';
const debug = require('debug')('alertsman:tickManager');
const { warn } = console;

export default class TickManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.alertTimers = {};
    this.triggerInterval = options.triggerInterval || 10000;
  }

  register(alert) {
    const alertId = alert.getId();
    debug(`register alert: id=${alertId}`);

    if (this.alertTimers[alertId]) {
      warn(`Trying to register an already registered alert: ${alertId}`);
      this.unregister(alert);
    }

    const timerInfo = {};
    this.alertTimers[alert.getId()] = timerInfo;

    const fireAlert = () => {
      this.emit('fire', alert);
    };

    timerInfo.init = setTimeout(() => {
      fireAlert();
      timerInfo.forever = setInterval(fireAlert, this.triggerInterval);
    }, this.getRandomWait());
  }

  unregister(alert) {
    const alertId = alert.getId();
    debug(`unregister alert: id=${alertId}`);
    this._killAlert(alertId);
  }

  _killAlert(alertId) {
    const timerInfo = this.alertTimers[alertId];
    if (timerInfo) {
      clearTimeout(timerInfo.init);
      clearInterval(timerInfo.forever);
    }
    delete this.alertTimers[alertId];
  }

  getRandomWait() {
    return Math.ceil(Math.random() * this.triggerInterval);
  }

  close() {
    _.each(this.alertTimers, alertId => this._killAlert(alertId));
  }
}

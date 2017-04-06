import _ from 'lodash';
import moment from 'moment';
import metricsInfoMap from './metrics/metrics_info';
import shorten from './url_shortener';

export default class Alert {
  constructor(alert) {
    this._id = alert._id;
    this.meta = alert.meta;
    this.rule = alert.rule;
    this.triggers = alert.triggers || [];
    this.appName = alert.appName;
    this.armedDate = alert.armedDate;
    this.lastCheckedDate = alert.lastCheckedDate;
    this.lastArmedClearedDate = alert.lastArmedClearedDate;
  }

  getId() {
    return this._id;
  }

  getMetric() {
    return this.rule.type;
  }

  getInfo() {
    return this.meta;
  }

  isArmed() {
    return Boolean(this.armedDate);
  }

  getArmedDate() {
    return this.armedDate;
  }

  getLastArmedClearedDate() {
    return this.lastArmedClearedDate;
  }

  getPredicates() {
    return {
      singlePoint: {
        condition: this.rule.params.condition,
        threshold: this.rule.params.threshold
      },
      singleStream: {
        duration: this.rule.duration
      },
      allStreams: {
        type: this.rule.hosts[0]
      }
    };
  }

  getTriggers() {
    return this.triggers;
  }

  getLastCheckedDate() {
    return this.lastCheckedDate;
  }

  _getResultData(result) {
    const duration = this.rule.duration;

    const hosts = [];

    let total = 0;
    let count = 0;
    let value;
    let time = Date.now();
    _.each(result.data, (hostData, host) => {
      hosts.push(host);

      if (duration > 0) {
        hostData.data.forEach(point => {
          total += point.data.value;
          if (point.data.timestamp < time) {
            time = point.data.timestamp;
          }
          count++;
        });

        value = total / count;
      } else {
        value = hostData.data.data.value;
        time = hostData.data.data.timestamp;
      }
    });

    return { hosts, value, time };
  }

  _getReason() {
    const duration = this.rule.duration;
    const condition = this.rule.params.condition;

    let reason = '';
    if (condition === 'lessThan') {
      reason = 'below';
    } else if (condition === 'greaterThan') {
      reason = 'above';
    }
    if (duration > 0) {
      reason = `continuously ${reason}`;
    }

    return reason;
  }

  _getOnHosts(hosts) {
    let onHosts = '';
    if (this.rule.hosts[0] === '$ANY') {
      if (hosts.length > 1) {
        onHosts = 'on hosts';
      } else {
        onHosts = 'on the host';
      }

      hosts.forEach((host, id) => {
        if (id === 0) {
          onHosts = `${onHosts} ${host}`;
        } else if (id === hosts.length - 1) { // last host
          onHosts = `${onHosts} and ${host}`;
        } else {
          onHosts = `${onHosts}, ${host}`;
        }
      });
    }

    return onHosts;
  }

  _getURL(time) {
    const info = metricsInfoMap[this.rule.type];
    const appId = this.meta.appId;
    // We need to get the middle of the data range (1hour).
    // That's why we need to remove 29 minutes from the time
    const midTime = time - 29 * 60 * 1000;
    /* eslint-disable max-len */
    return `https://ui.kadira.io/apps/${appId}/${info.urlTab}/?range=3600000&date=${midTime}`;
    /* eslint-enable max-len */
  }

  _getCaption() {
    const info = metricsInfoMap[this.rule.type];
    return info.caption;
  }

  getEmailInfoForTriggered(result) {
    const { name, appName } = this.meta;
    const { hosts, value, time } = this._getResultData(result);
    const threshold = this.rule.params.threshold;
    const duration = this.rule.duration;

    const formatedHosts = hosts.map(host => {return `<b>${host}</b>`;});
    const onHosts = this._getOnHosts(formatedHosts);

    let prettyTime;
    let current = 'Observed';
    if (duration > 0) {
      const datetime = moment(time).utc().format(
        '[<b>]h:mm:ss a[</b>,] [<b>]YYYY-MM-DD [GMT</b>]');
      prettyTime = `for ${(duration / 60000)} minutes from ${datetime}`;
      current = `${current} average`;
    } else {
      prettyTime = moment(time).utc().format(
        '[at <b>] h:mm:ss a [</b>, <b>] YYYY-MM-DD [GMT</b>]');
    }

    const reason = this._getReason();
    const ruleType = this._getCaption();
    const url = this._getURL(time);

    const subject = `Alert ${name} of app: "${appName}" has triggered!`;

    /* eslint-disable max-len */
    const body = `
Regarding Your App: <b>${appName}</b>.<br/>
Alert <b>${name}</b> has triggered.<br/><br/>
${ruleType} has been <b>${reason} ${threshold}</b> (${current}: <b>${value}</b>) ${prettyTime}${onHosts ? ' ' + onHosts : ''}.<br/><br/>

Visit <a href="${url}">Kadira</a> and find out more.`;
    /* eslint-enable max-len */

    return {subject, body};
  }

  getEmailInfoForCleared() {
    const { name, appName } = this.meta;

    const time = Date.now();
    const prettyTime = moment(time).utc().format(
      '[at <b>]h:mm:ss a[</b>, <b>]YYYY-MM-DD [GMT</b>]');
    const url = this._getURL(time);

    const subject = `Alert ${name} of app: "${appName}" has cleared!`;

    const body = `
Regarding Your App: <b>${appName}</b>.<br/>
Alert <b>${name}</b> has cleared ${prettyTime}.<br/><br/>
Visit <a href="${url}">Kadira</a> and find out more.`;

    return {subject, body};
  }

  getSlackInfoForTriggered(result) {
    const { name, appName } = this.meta;
    const { hosts, value, time } = this._getResultData(result);
    const threshold = this.rule.params.threshold;
    const duration = this.rule.duration;

    const formatedHosts = hosts.map(host => {return `*${host}*`;});
    const onHosts = this._getOnHosts(formatedHosts);

    const reason = this._getReason();
    const ruleType = this._getCaption();

    let prettyTime = '';
    if (duration > 0) {
      const minutes = moment.duration(duration, 'milliseconds').asMinutes();
      prettyTime = `for ${minutes} minutes`;
    }

    const title = `Alert ${name} of app: "${appName}" has triggered!`;
    const titleLink = this._getURL(time);

    const promise = shorten(titleLink)
      .then(shortUrl => {
        /* eslint-disable max-len */
        const text = `
${ruleType} has been *${reason} ${threshold}* (Observed: *${value}*) ${prettyTime}${onHosts ? ' ' + onHosts : ''}.

Visit ${shortUrl} and find out more.
        `;
        /* eslint-enable max-len */
        const fallback = `Alert ${name} of app: "${appName}" has triggered!`;
        const color = 'danger';

        /* eslint-disable camelcase */
        return {
          username: 'Kadira Alerts',
          icon_url: 'http://static.kadira.io/kadira-alert-triggered.png',
          attachments: [
            {
              fallback, // This should idealy be plain text
              color,
              title,
              title_link: titleLink,
              text,
              mrkdwn_in: [ 'text' ]
            }
          ]
        };
        /* eslint-enable camelcase */
      });

    return promise;
  }

  getSlackInfoForCleared() {
    const { name, appName } = this.meta;

    const time = Date.now();

    const title = `Alert ${name} of app: "${appName}" has cleared!`;
    const titleLink = this._getURL(time);

    const promise = shorten(titleLink)
      .then(shortUrl => {

        const text = `Visit ${shortUrl} and find out more.`;
        const fallback = `Alert ${name} of app: "${appName}" has cleared!`;
        const color = 'good';

        /* eslint-disable camelcase */
        return {
          username: 'Kadira Alerts',
          icon_url: 'http://static.kadira.io/kadira-alert-cleared.png',
          attachments: [
            {
              fallback,
              color,
              title,
              title_link: titleLink,
              text,
              mrkdwn_in: [ 'text' ]
            }
          ]
        };
        /* eslint-enable camelcase */
      });

    return promise;
  }
}

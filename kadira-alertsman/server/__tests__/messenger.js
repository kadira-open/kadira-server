/* eslint max-len:0 no-unused-expressions:0 */
import { describe, it, before } from 'mocha';
import { getTestAlertData } from './test_utils';
import Messenger from '../messenger';
import Alert from '../alert';
import { expect } from 'chai';
import librato from 'librato-node';
const mailUrl = 'smtp://testuser:testpass@smtp.test.host:465';

describe('Messenger', () => {
  before(() => {
    librato.configure({});
  });

  describe('initialization', () => {
    it('should set email options correctly', () => {
      const m = new Messenger(mailUrl);

      const options = m.transport.transporter.options;

      delete options.name; // This gets set to the name of the machine

      expect(options).to.deep.equal({
        secure: true,
        host: 'smtp.test.host',
        port: '465',
        auth: {
          user: 'testuser',
          pass: 'testpass'
        }
      });
    });
  });

  describe('_sendEmail()', () => {
    it('should send the email as instructed', async () => {
      const m = new Messenger(mailUrl);
      let sendEmailCalled = false;
      const testOptions = {
        from: 'Kadira Alerts <alerts-noreply@kadira.io>',
        to: 'foo@example.com',
        subject: 'Foo Bar Baz',
        html: '<b>foo</b> bar baz <a href="http://foobar.com"> Foo Bar </a>',
        text: 'foo bar baz Foo Bar [http://foobar.com]'
      };
      m.transport.sendMail = mailOptions => {
        expect(mailOptions).to.deep.equal(testOptions);
        sendEmailCalled = true;
        // return a promise that just fullfills
        return Promise.resolve();
      };

      await m._sendEmail(testOptions.to, testOptions.subject, testOptions.html);
      expect(sendEmailCalled).to.be.true;
    });
  });

  describe('_callWebhook()', () => {
    it('should call the webhook as instructed', async () => {
      const testOptions = {
        uri: 'http://example.com',
        params: {}
      };
      const m = new Messenger(mailUrl);

      let postCalled = false;

      m.post = webhookOptions => {
        expect(webhookOptions).to.deep.equal({
          uri: testOptions.uri,
          json: testOptions.params
        });
        postCalled = true;

        // return a promise that just fullfills
        return Promise.resolve();
      };

      await m._callWebhook(testOptions.uri, testOptions.params);
      expect(postCalled).to.be.true;
    });
  });

  describe('sendCleared()', () => {
    it('should fire all the triggers with correct info', async () => {
      const triggers = [
        {
          type: 'email',
          params: {
            addresses: [
              'foo@example.com'
            ]
          }
        },
        {
          type: 'webhook',
          params: {
            urls: [
              'http://example.com'
            ]
          }
        }
      ];

      const alertData = getTestAlertData({triggers});
      const alert = new Alert(alertData);
      const checkedResult = {
        success: true,
        data: {
          'test-host': {
            result: true,
            data: [
              {
                result: true,
                data: {timestamp: 1446622320000, value: 40}
              }
            ]
          }
        }
      };

      const m = new Messenger(mailUrl);

      let postCalled = false;
      let sendEmailCalled = false;

      m.transport.sendMail = mailOptions => {
        expect(mailOptions.to).to.equal('foo@example.com');
        sendEmailCalled = true;
        // return a promise that just fullfills
        return Promise.resolve();
      };

      m.post = webhookOptions => {
        expect(webhookOptions.uri).to.equal('http://example.com');
        postCalled = true;

        // return a promise that just fullfills
        return Promise.resolve();
      };

      await m.sendCleared(alert, checkedResult);
      expect(sendEmailCalled).to.be.true;
      expect(postCalled).to.be.true;
    });
  });

  describe('sendTriggered()', () => {
    it('should fire all the triggers with correct info', async () => {
      const triggers = [
        {
          type: 'email',
          params: {
            addresses: [
              'foo@example.com'
            ]
          }
        },
        {
          type: 'webhook',
          params: {
            urls: [
              'http://example.com'
            ]
          }
        }
      ];

      const alertData = getTestAlertData({triggers});
      const alert = new Alert(alertData);
      const checkedResult = {
        success: true,
        data: {
          'test-host': {
            result: true,
            data: [
              {
                result: true,
                data: {timestamp: 1446622320000, value: 40}
              }
            ]
          }
        }
      };

      const m = new Messenger(mailUrl);

      let postCalled = false;
      let sendEmailCalled = false;

      m.transport.sendMail = mailOptions => {
        expect(mailOptions.to).to.equal('foo@example.com');
        sendEmailCalled = true;
        // return a promise that just fullfills
        return Promise.resolve();
      };

      m.post = webhookOptions => {
        expect(webhookOptions.uri).to.equal('http://example.com');
        postCalled = true;

        // return a promise that just fullfills
        return Promise.resolve();
      };

      await m.sendTriggered(alert, checkedResult);
      expect(sendEmailCalled).to.be.true;
      expect(postCalled).to.be.true;
    });
  });

  describe('_processTriggers', () => {
    it('should process emails with multiple addresses', () => {
      const triggers = [
        {
          type: 'email',
          params: {
            addresses: [
              'arunoda@meteorhacks.com',
              'arunoda@kadira.io'
            ]
          }
        }
      ];

      const emailPayload = {subject: 'message', body: 'body'};
      const m = new Messenger();
      const foundEmails = [];

      m._sendEmail = (email, subject, body) => {
        expect(subject).to.be.equal(emailPayload.subject);
        expect(body).to.be.equal(emailPayload.body);
        foundEmails.push(email);
      };

      m._processTriggers(triggers, emailPayload);
      expect(foundEmails).to.deep.equals(triggers[0].params.addresses);
    });

    it('should process webhooks with multiples urls', () => {
      const triggers = [
        {
          type: 'webhook',
          params: {
            urls: [
              'https://zapier.com/hooks/catch/oy2s0e/',
              'https:/sdsd.com'
            ]
          }
        }
      ];

      const webHookPayload = {aa: 10};
      const m = new Messenger();
      const foundUrls = [];

      m._callWebhook = (url, params) => {
        expect(params).to.deep.equals(webHookPayload);
        foundUrls.push(url);
      };

      m._processTriggers(triggers, null, webHookPayload);
      expect(foundUrls).to.deep.equals(triggers[0].params.urls);
    });

    it('should throw error for invalid triggers', () => {
      const triggers = [
        {
          type: 'some-invalid-one'
        }
      ];

      const m = new Messenger();
      const run = () => {
        m._processTriggers(triggers);
      };

      expect(run).to.throw(/Unknown trigger/);
    });

    it('should process all of them in parrally', done => {
      const triggers = [
        {
          type: 'email',
          params: {
            addresses: []
          }
        }
      ];

      for (let lc = 0; lc < 10; lc++) {
        triggers[0].params.addresses.push(`${lc}@aa.com`);
      }

      const emailPayload = {subject: 'message', body: 'body'};
      const m = new Messenger();

      m._sendEmail = () => {
        return new Promise(resolve => setTimeout(resolve, 100));
      };

      const startAt = Date.now();
      m._processTriggers(triggers, emailPayload)
        .then(() => {
          const diff = Date.now() - startAt;
          expect(diff).to.be.within(100, 110);
          done();
        });
    });
  });
})
;

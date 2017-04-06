/* eslint max-len:0 no-unused-expressions:0 */
import { expect } from 'chai';
import { before, after, describe, it } from 'mocha';
import shorten from '../url_shortener';
import googl from 'goo.gl';

describe('URL Shortener', () => {
  let oldShorten;

  before(() => {
    oldShorten = googl.shorten;
  });

  after(() => {
    googl.shorten = oldShorten;
  });

  describe('with key', () => {
    let oldGetKey;

    before(() => {
      oldGetKey = googl.getKey;
      googl.getKey = function () {
        return 'dummykey';
      };
    });

    after(() => {
      googl.getKey = oldGetKey;
    });

    it('should return shortened url', async () => {
      googl.shorten = function (longUrl) {
        expect(longUrl).to.equal('long-long-url');
        return Promise.resolve('short-url');
      };

      const shortUrl = await shorten('long-long-url');
      expect(shortUrl).to.equal('short-url');
    });

    it('should return the original url if shortening failed', async () => {
      googl.shorten = function () {
        return Promise.reject(new Error('error'));
      };

      const shortUrl = await shorten('long-long-url');
      expect(shortUrl).to.equal('long-long-url');
    });
  });

  describe('without key', () => {
    let oldGetKey;

    before(() => {
      oldGetKey = googl.getKey;
      googl.getKey = function () {
        return '';
      };
    });

    after(() => {
      googl.getKey = oldGetKey;
    });

    it('should return the original url imediately if API key is not given', async () => {
      googl.shorten = function () {
        throw new Error('api called'); // this should not be called
      };

      const shortUrl = await shorten('long-long-url');
      expect(shortUrl).to.equal('long-long-url');
    });
  });
});

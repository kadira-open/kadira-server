import googl from 'goo.gl';
import { error } from 'console';

export function setGoogleDevKey(key) {
  googl.setKey(key);
}

export default function shorten(url) {
  if (!googl.getKey()) {
    return Promise.resolve(url);
  }

  return googl.shorten(url).then(shortUrl => {
    return shortUrl;
  })
  .catch(err => {
    error('url shortener error:', err);
    return url;
  });
}

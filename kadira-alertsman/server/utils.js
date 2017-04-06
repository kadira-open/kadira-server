import { parse } from 'url';

export function isSlackUrl(url) {
  const { hostname } = parse(url);
  return hostname === 'hooks.slack.com';
}

export async function processAlone(obj, fn) {
  if (obj.processing) {
    // If a previous run of the function is still inflight we avoid queuing
    // another one.
    return;
  }

  obj.processing = true;
  await fn();
  obj.processing = false;
}

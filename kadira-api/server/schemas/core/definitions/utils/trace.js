import Promise from 'bluebird';
import zlib from 'zlib';

// Create a promisified inflate function (avoid callbacks)
const inflate = Promise.promisify(zlib.inflate.bind(zlib));

// inflate trace events with 'zlib'
export async function inflateEvents(doc) {
  if (doc && doc.compressed) {
    const inflated = await inflate(doc.events.buffer);
    doc.events = inflated.toString();
  }
  return doc;
}

export function stringifyStacks(doc) {
  if ( typeof doc.stacks !== 'string') {
    doc.stacks = JSON.stringify(doc.stacks);
  }
  return doc;
}

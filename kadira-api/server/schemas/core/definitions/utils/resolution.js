var _1HOUR = 60 * 60 * 1000;
var _24HOUR = 24 * _1HOUR;

export function pickResolution({startTime, endTime}) {
  var range = endTime - startTime;
  if (range <= 8 * _1HOUR) {
    return '1min';
  }
  if (range > 8 * _1HOUR && range <= _24HOUR) {
    return '30min';
  }

  return '3hour';
}

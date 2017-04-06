var assert = require('assert');
var expire = require('../../lib/parsers/_expire');

suite('_expire', function() {
  test('ttl for solo plan', function() {
    var app = {plan: 'solo'};
    var ttl = expire.getTTL(app);
    assert.equal(ttl, 1000*60*60*24*4);
  });

  test('ttl for not defined plan', function() {
    var app = {};
    var ttl = expire.getTTL(app);
    assert.equal(ttl, 1000*60*60*24*2);
  });

  test('ttl for perHostBilling', function() {
    var app = {perHostBilling: true};
    var ttl = expire.getTTL(app);
    assert.equal(ttl, 1000*60*60*24*16);
  });
});
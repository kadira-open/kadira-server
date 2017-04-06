Tinytest.addAsync(
'Collection - insert and findLast',
function(test, done) {
  var c = new Collection();
  c.insert({a: 10});
  c.insert({a: 20});
  c.insert({a: 30});

  var lastItem = c.findLastItem();
  test.equal(lastItem, {a: 30});
  done();
});

Tinytest.addAsync(
'Collection - insert and findRange',
function(test, done) {
  var c = new Collection();
  c.insert({a: 10});
  c.insert({a: 20});
  c.insert({a: 30});
  c.insert({a: 40});

  var items = c.findRange('a', 20, 40);
  test.equal(items, [{a: 30}, {a: 40}]);
  done();
});

Tinytest.addAsync(
'Collection - insert with maxItems',
function(test, done) {
  var dataEmitted = [];
  var c = new Collection({maxItems: 2});
  c.on('addItem', function(item) {
    dataEmitted.push(item);
  });

  c.on('removeItem', function(item) {
    var index = dataEmitted.indexOf(item);
    dataEmitted.splice(index, 1);
  });

  c.insert({a: 10});
  c.insert({a: 20});
  c.insert({a: 30});
  c.insert({a: 40});

  test.equal(c.data, [{a: 30}, {a: 40}]);
  test.equal(dataEmitted, [{a: 30}, {a: 40}]);
  done();
});

Tinytest.addAsync(
'Collection - insert and findRange with filters',
function(test, done) {
  var c = new Collection();
  c.insert({a: 10});
  c.insert({a: 20});
  c.insert({a: 30, category: 'kadira'});
  c.insert({a: 40, category: 'meteor'});

  var items = c.addFilter('category', 'meteor').findRange('a', 20, 40);
  test.equal(items, [{a: 40, category: 'meteor'}]);
  done();
});


Tinytest.addAsync(
'Collection - insert and findRange with sorting',
function(test, done) {
  var c = new Collection();
  c.insert({a: 10});
  c.insert({a: 20});
  c.insert({a: 30});
  c.insert({a: 40});

  var items = c.findRange('a', 20, 40, -1);
  test.equal(items, [{a: 40}, {a: 30}]);
  done();
});

Tinytest.addAsync(
'Collection - insert and pickIn',
function(test, done) {
  var c = new Collection();
  c.insert({a: 10, cat: 'meteor'});
  c.insert({a: 20, cat: 'meteor'});
  c.insert({a: 30, cat: 'kadira'});
  c.insert({a: 40, cat: 'react'});

  var items = c.pickIn('cat', ['meteor', 'kadira']).fetch();
  var aValues = items.map(function(item) {
    return item.a;
  });
  test.equal(aValues, [10, 20, 30]);
  done();
});

Tinytest.addAsync(
'Collection - insert and pickIn with no all values',
function(test, done) {
  var c = new Collection();
  c.insert({a: 10, cat: 'meteor'});
  c.insert({a: 20, cat: 'meteor'});
  c.insert({a: 30, cat: 'kadira'});
  c.insert({a: 40, cat: 'react'});

  var items = c.pickIn('cat', null).fetch();
  var aValues = items.map(function(item) {
    return item.a;
  });
  test.equal(aValues, [10, 20, 30, 40]);
  done();
});

Tinytest.addAsync(
'Collection - insert and pickIn with limi',
function(test, done) {
  var c = new Collection();
  c.insert({a: 10, cat: 'meteor'});
  c.insert({a: 20, cat: 'meteor'});
  c.insert({a: 30, cat: 'kadira'});
  c.insert({a: 40, cat: 'react'});

  var items = c.pickIn('cat', ['meteor', 'kadira'], 2).fetch();
  var aValues = items.map(function(item) {
    return item.a;
  });
  test.equal(aValues, [20, 30]);
  done();
});

Tinytest.addAsync(
'Collection - dump Collection',
function(test, done) {
  var c = new Collection();
  c.insert({a: 10, cat: 'meteor'});
  c.insert({a: 30, cat: 'kadira'});

  var dumpData = c.dump();

  test.equal(dumpData.length, 2);
  test.equal(dumpData[0].a, 10);
  test.equal(dumpData[0].cat, "meteor");
  test.equal(dumpData[1].a, 30);
  test.equal(dumpData[1].cat, "kadira");

  done();
});

Tinytest.addAsync(
'Collection - load Collection',
function(test, done) {
  var c = new Collection();
  var data = [
    {
      a: 10,
      cat: "meteor"
    },
    {
      a: 30,
      cat: "kadira"
    }
  ];

  c.load(data);

  var items = c.pickIn('cat', ['meteor', 'kadira']).fetch();
  var aValues = items.map(function(item) {
    return item.a;
  });
  test.equal(aValues, [10, 30]);

  done();
});

Collection = function(options) {
  var self = this;
  this.options = options || {};

  this.data = [];
  this.lastItem = null;
  this.filter = {};
  this._dep = new Tracker.Dependency();

  var em = new EventEmitter();
  _.each(['on', 'removeListener', 'emit'], function(fnName) {
    self[fnName] = em[fnName].bind(em);
  });
};

Collection.prototype.insert = function(item) {
  // if maxItems is defined, maintain it
  var maxItems = this.options.maxItems;
  if(maxItems && this.data.length === maxItems) {
    var removedItem = this.data.shift();
    this.emit('removeItem', removedItem);
  }

  this.data.push(item);
  this.lastItem = item;
  this.emit('addItem', item);
  this._dep.changed();
};

Collection.prototype.dump = function() {
  return this.data;
};

Collection.prototype.load = function(data) {
  this.data = data;
  this._dep.changed();
};

Collection.prototype.pickIn = function(field, values, limit) {
  var valueMap = {};
  _.each(values, function(value) {
    valueMap[value] = true;
  });

  var matcher = function(item) {
    var value = item[field];
    return !values || valueMap[value];
  };

  var cursor = new Cursor(matcher, this, limit);
  return cursor
};

Collection.prototype.addFilter = function(key, value) {
  var self = this;
  this.filter[key] = value;
  var c = new Collection();
  _.each(self, function(value, field) {
    c[field] = self[field];
  });

  return c;
};

Collection.prototype.findRange = function(field, start, end, sortBy) {
  var self = this;
  sortBy = sortBy || 1;
  var filteredDocs = this.data.filter(function(item) {
    var value = item[field];
    var canSend = value > start && value <= end;
    
    // if we've filter, we need to apply it
    var satisfy = true;
    _.each(self.filter, function(value, key) {
      satisfy = satisfy && item[key] === value;
    });

    return (satisfy)? canSend : false;
  });

  filteredDocs.sort(function(a, b) {
    return (a[field] - b[field]) * sortBy;
  });

  this._dep.depend();
  return filteredDocs;
};

Collection.prototype.findLastItem = function() {
  return this.lastItem;
};

function Cursor(matcher, collection, limit) {
  var self = this;
  this.matcher = matcher;
  this.collection = collection;
  this.limit = limit;
}

Cursor.prototype.fetch = function() {
  var data = [];
  var handle = this.observe({
    addedAt: function(item) {
      data.push(item);
    },
    removedAt: function() {
      // we always remove the first time only
      data.splice(0, 1);
    }
  });
  handle.stop();

  return data;
};

Cursor.prototype.observe = function(callbacks) {
  var self = this;
  var noOfItems = 0;
  var dataSet = [];

  function removeFromDataSet(item) {
    for(var lc=0; lc<dataSet.length; lc++) {
      if(dataSet[lc]._id === item._id) {
        dataSet.splice(lc, 1);
        return lc;
      }
    }
  }

  function addItem(item) {
    if(self.matcher(item)) {
      item = EJSON.clone(item);
      if(noOfItems === self.limit) {
        if(callbacks.removedAt) {
          var position = removeFromDataSet(item);
          callbacks.removedAt(item, position);
        }
        dataSet.push(item);
        callbacks.addedAt(item, noOfItems - 1, null);
      } else {
        dataSet.push(item);
        callbacks.addedAt(item, noOfItems++, null);
      }
    }
  }

  function removeItem(item) {
    var position = removeFromDataSet(item);
    callbacks.removedAt(item, position);
    noOfItems--;
  }

  // send initial data
  _.each(this.collection.data, addItem);

  // watch for new data
  this.collection.on('addItem', addItem);

  // watch for removed items
  this.collection.on('removeItem', removeItem);

  return {
    stop: function() {
      self.collection.removeListener('addItem', addItem);
      self.collection.removeListener('removeItem', removeItem);
    }
  };
};

// To support testing
Collection.Cursor = Cursor;
TimeStore = function() {
  this._itemMap = {};
  this._itemList = [];
  this._itemsDep = new Tracker.Dependency();
};

// add an item to the timestore
// Once added we need to invalidate itemList or timeline based on the data
// XXX: These times may not be in the sorted order, so 
// We don't need to sort them with the every put, but when we are fetching 
// them reactively. 
TimeStore.prototype.putItemEvent = function(item) {
  var key = this._getItemKey(item);
  var itemInfo = this._itemMap[key];
  if(!itemInfo) {
    itemInfo = {
      key: key,
      dep: new Tracker.Dependency(),
      timeline: [],
      sorted: false,
      type: item.type,
      info: {}
    };
    this._itemMap[key] = itemInfo;
    this._itemList.push(itemInfo);
    this._itemsDep.changed();
  }

  var existingEvent = _.find(itemInfo.timeline, function(e) {
    return e.event === item.event;
  });

  // Sometimes, it's possible to receive the same event because of HCR
  // Then we need to ignore them, otherwise it'll raise more issues.
  if(existingEvent) {
    return;
  }

  if(item.event === "start" && !itemInfo.startAt) {
    itemInfo.startAt = item.timestamp;
  }

  _.extend(itemInfo.info, item.info);
  itemInfo.timeline.push(_.pick(item, 'event', 'timestamp'));
  itemInfo.sorted = false;
  itemInfo.dep.changed();
};

// Get a list of items sorted by the start time
// One item on the list have following fields
//  - name, type(pubsub, method), id
TimeStore.prototype.getItemList = function() {
  this._itemsDep.depend();
  var items = this._itemList.map(function(itemInfo) {
    return _.pick(itemInfo, ['key', 'info', 'startAt', 'type']);
  });
  
  // XXX: Remove sorting since it screw of up the order when there is 
  // HCR or app reload.
  // Fix is to identify method names with a unique using the session id as well
  // otherwise, we can reset the data when there is a HCR
  
  // items.sort(function(a, b) {
  //   return a.startAt - b.startAt;
  // });

  return items;
};

// Get a timeline of events for a given Id
TimeStore.prototype.getItemTimeline = function(itemKey) {
  var itemInfo = this._itemMap[itemKey];
  if(!itemInfo) {
    throw new Error("There is no such itemKey:" + itemKey);
  }

  itemInfo.dep.depend();
  if(!itemInfo.sorted) {
    itemInfo.timeline.sort(function(a, b) {
      return a.timestamp - b.timestamp;
    });
    itemInfo.sorted = true;
  }

  return itemInfo.timeline;
};

TimeStore.prototype._getItemKey = function(item) {
  return item.type + "-" + item.id;
};

TimeStore.prototype.dump = function() {
  return {
    itemList: this._itemList
  };
};

TimeStore.prototype.load = function(data) {
  var self = this;
  this.reset();

  if (!data || !data.itemList) {
    return;
  }

  var itemList = data.itemList;
  itemList.forEach(function(item) {
    var key = item.key.split('-');
    var type = key[0];
    var id = key[1];
    var info = item.info;

    var times = item.timeline;
    times.forEach(function(evt) {
      evt.type = type;
      evt.id = id;
      evt.info = info;
      // put item events one by one
      self.putItemEvent(evt);
    });
  });
};

TimeStore.prototype.reset = function() {
  this._itemMap = {};
  this._itemList = [];
  this._itemsDep.changed();
};
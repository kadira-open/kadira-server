TimelineComponent = new StateManager();

// States
TimelineComponent.defineStates({
  zoomScale: 100,
  selectedItem: null,
  traceKey: null,
  gridWidth() {
    return this.get("zoomScale");
  }
});

// Actions
TimelineComponent.defineActions({
  showTraceModal: function(itemId) {
    this.set("traceKey", itemId);
    this.set("selectedItem", itemId);
  },

  hideTraceModel: function() {
    this.set("traceKey", null);
  },

  changeZoomScale: function(newScale) {
    this.set("zoomScale", newScale);
  },

  selectItem: function(itemId) {
    this.set("selectedItem", itemId);
  }
});
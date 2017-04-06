StateManagerInstance = new StateManager();

Tinytest.add("State Manager Define States", function (test) {
  // define states
  StateManagerInstance.defineStates({
    zoomScale: 100
  });

  var zoomScale = StateManagerInstance.get("zoomScale");
  // assertions
  test.equal(100, zoomScale);
});

Tinytest.add("Define action and update state via the action", function(test) {
  // define states
  StateManagerInstance.defineStates({
    zoomScale: 101
  });

  // Actions
  StateManagerInstance.defineActions({
    changeZoomScale: function(newScale) {
      this.set("zoomScale", newScale);
    }
  });

  var zoomScale = StateManagerInstance.get("zoomScale");
  // assertions
  test.equal(101, zoomScale);

  StateManagerInstance.actions.changeZoomScale(200);

  var zoomScale = StateManagerInstance.get("zoomScale");
  // assertions
  test.equal(200, zoomScale);
});
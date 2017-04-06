var component = FlowComponents.define("loading", function(params) {
  this.onRendered(function() {
    // this.autorun inside this.onRendered gives a weird dom range error
    this.set("isRendered", true);
  });

  this.autorun(function() {
    var isLoading = params.isLoadingFn();

    var opacity = parseInt(params.opacity);
    if(isNaN(opacity)) {
      opacity = 0.5;
    }
    if(this.get("isRendered")){
      if(isLoading && !this.isAnimating){
        this.$(".loading-wrap").fadeTo(300, opacity);
        this.isAnimating = true;
        this.showIndicator();
      } else if(!params.isLoadingFn()){
        this.$(".loading-wrap").fadeTo(300, 1);
        this.isAnimating = false;
        this.hideIndicator();
      }
    }
  });

  this.onDestroyed(function() {
    clearTimeout(this.loadingTimeout);
  });
});

component.prototype.showIndicator = function() {
  var self = this;
  this.loadingTimeout = setTimeout(function() {
    self.$(".loading-indicator").show();
  }, 500);
};

component.prototype.hideIndicator = function() {
  this.$(".loading-indicator").hide();
  clearTimeout(this.loadingTimeout);
};
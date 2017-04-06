describe("lib.mixins.subNavigation", function() {
  it("sub navigation link", function() {
    var result = GlobalClient.execute(function() {
      var mockRouter = sinon.mock(FlowRouter);
      var params = {
        section: "dashboard",
        appId: "xxxxxx",
        subSection: "overview"
      };

      mockRouter.expects("getParam").exactly(3)
        .onCall(0).returns(params.section)
        .onCall(1).returns(params.appId)
        .onCall(2).returns(params.subSection);

      var ctx = {
        navs: [{
          section: "overview",
        }, {
          section: "pubsub",
        }],
        set: function() {}

      };
      var newNavs = Mixins.subNavigation.state.navs.call(ctx);
      mockRouter.restore();
      mockRouter.verify();
      return newNavs;
    });

    expect(result[0].active).to.be.equal(true);
    expect(result[0].url).to.be.equal("/apps/xxxxxx/dashboard/overview");
    expect(result[1].active).to.be.equal(false);
    expect(result[1].url).to.be.equal("/apps/xxxxxx/dashboard/pubsub");
  });
});
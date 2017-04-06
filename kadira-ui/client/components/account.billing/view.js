Template["account.billing"].events({
  "submit #frm-billing-info": function (e) {
    e.preventDefault();

    var billingInfo = {};
    billingInfo.name = $("#name").val();
    billingInfo.email = $("#email").val();
    billingInfo.address1 = $("#address-line-1").val();
    billingInfo.address2 = $("#address-line-2").val();
    billingInfo.city = $("#city").val();
    billingInfo.state = $("#state").val();
    billingInfo.zip = $("#zip").val();
    billingInfo.country = $("#country").val();
    billingInfo.other = $("#other-info").val();

    FlowComponents.callAction("updateBillingInfo", billingInfo);
  },
  "click #add-card": function (e) {
    e.preventDefault();
    FlowComponents.callAction("updateCard", "add");
  },
  "click #update-card": function (e) {
    e.preventDefault();
    FlowComponents.callAction("updateCard", "update");
  },
  "click #remove-card": function (e) {
    e.preventDefault();
    FlowComponents.callAction("removeCard");
  }
});

Template["account.billing"].helpers({
  "getHostsData": function () {
    return function() {
      console.log(this);
      return this.data;
    }
  }
});
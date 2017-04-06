Template["account.billing.suggest"].events({
  "click .talk-to-us": function(e) {
    e.preventDefault();
    Intercom["public_api"].show();
  }
});
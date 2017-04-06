Template.header.events({
  "click #support-link": function(e) {
    e.preventDefault();
    Intercom["public_api"].show();
  }
});
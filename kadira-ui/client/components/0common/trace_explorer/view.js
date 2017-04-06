Template["traceExplorer"].events({
  "click .trace-explorer .view-details": function(e) {
    e.preventDefault();
    if ($(e.target).html() !== "Show Less") {
      $(e.target).html("Show Less");
    } else {
      $(e.target).html("Show More");
    }
    $(e.target).parent().find(".details").toggle();
  }
});
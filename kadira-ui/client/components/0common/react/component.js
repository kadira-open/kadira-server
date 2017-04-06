FlowComponents.define("react", function(props) {
  this.onRendered(function() {
    var dom = this.find("div");
    var reactProps = _.omit(props, "component", "class");
    var reactClass = window;
    _.each(props.class.split("."), function(name) {
      reactClass = reactClass[name];
    });

    var el = React.createElement(reactClass, reactProps);
    React.render(el, dom);
  });
});
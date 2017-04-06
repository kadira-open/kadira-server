TimelineComponent.TimeChart = React.createClass({
  displayName: "TimelineComponent.TimeChart",
  propTypes: {
    // positional props
    height: React.PropTypes.number.isRequired,
    // width can be both a number or a percentage like "100%"
    width: React.PropTypes.number.isRequired,
    // width of the background grid
    gridWidth: React.PropTypes.number.isRequired,
    // Timebar list
    items: React.PropTypes.array.isRequired
  },
  _buildTimeBar(item) {
    var props = _.clone(item);
    props.itemId = item.key;
    props.key = item.key;
    props.sections = item.timeline;
    
    return (
      <TimelineComponent.TimeBar {...props} />
    );
  },
  render() {
    return (
      <svg className="svgContainer" height={this.props.height} width={this.props.width}>
        <TimelineComponent.Grid width={this.props.gridWidth} />
        {this.props.items.map(this._buildTimeBar)}
      </svg>
    );
  }
});
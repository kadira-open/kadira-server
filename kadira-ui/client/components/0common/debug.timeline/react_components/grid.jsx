TimelineComponent.Grid = React.createClass({
  displayName: "TimelineComponent.Grid",
  propTypes: {
    width: React.PropTypes.number.isRequired
  },
  _getGridPattern() {
    return "M 0 0 L 0 0 0 " + this.props.width;
  },
  render() {
    return (
      <svg width="100%" height="100%">
        <pattern id="grid" width={this.props.width} height={this.props.width} patternUnits="userSpaceOnUse">
          <path d={this._getGridPattern()} fill="none" stroke="rgb(206, 229, 239)" strokeWidth="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" stroke="gray" strokeWidth="0" />
        <text x="2" y="12" fontSize="11px" fill="gray">0 ms</text>
      </svg>
    );
  }
});
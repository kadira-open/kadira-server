TimelineComponent.Zoomer = React.createClass({
  propTypes: {
    // initial scale of the zoomer
    initialScale: React.PropTypes.number.isRequired,

    // EVENTS
    onChange: React.PropTypes.func
  },
  getInitialState() {
    var state = {scale: this.props.initialScale};
    return state;
  },
  _fireScaleChange(newScale) {
    this.setState({scale: newScale});
    if(newScale > 0) {
      TimelineComponent.actions.changeZoomScale(newScale);
    }
  },
  _changeZoom(amount) {
    var newScale = this.state.scale + amount;
    
    // set zoom limit
    if(newScale > 0 && newScale < 520) {
      this._fireScaleChange(newScale);
    }
  },
  _resetZoom() {
    this._fireScaleChange(this.props.initialScale);
  },
  render() {
    return (
      <div>
        <div className="zoom-ctrl pull-right">
          <button className="btn-zoom-in" onClick={this._changeZoom.bind(this, 20)}><span className="glyphicon glyphicon-zoom-in"></span></button>
          <div className="scale-label">{this.state.scale}%</div>
          <button className="btn-zoom-out" onClick={this._changeZoom.bind(this, -20)}><span className="glyphicon glyphicon-zoom-out"></span></button>
          <button className="btn-zoom-reset" onClick={this._resetZoom}>RESET</button>
        </div>
        <div className="clearfix"></div>
      </div>
    );
  }
});
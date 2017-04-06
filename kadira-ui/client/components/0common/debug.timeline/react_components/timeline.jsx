TimelineComponent.Timeline = React.createClass({
  displayName: "TimelineComponent.Timeline",
  mixins: [ReactMeteorData],
  getMeteorData() {
    var ds = this.props.debugStore;
    ds.resume();

    var urlState = this.props.urlState;

    var timeline = ds.getDdpTimeline(this.props.sessionId);
    var selectedItem = TimelineComponent.get("selectedItem");
    var scale = TimelineComponent.get("zoomScale");
    var data = processedTimelineData(timeline, scale, selectedItem);
    
    data.scale = scale
    data.selectedItem = selectedItem;
    data.gridWidth = TimelineComponent.get("gridWidth");
    return data;
  },
  componentDidMount() {
    // componentWillUnmount is not calling since
    // DOM is getting destroyed before that
    // That's why we need to remove all the listeners
    TimelineComponent.removeAllListeners('selectItem');
    TimelineComponent.on('selectItem', this._selectItem);
  },
  _selectItem(itemId) {
    var item = _.find(this.data.listItems, (i) => i.key === itemId);
    if(item) {
      var container = $(".chart-container");
      var scrollLeft = item.scrollLeft;
      
      container.animate({
        scrollLeft: scrollLeft
      }, 300);
    }
  },
  render() {
    // grid scale
    if(_.isEmpty(this.data.listItems)) {
      return (
        <h4 className="no-data empty">
          <small>
            <span className="glyphicon glyphicon-exclamation-sign"></span> 
            No Timeline Available.
          </small>
        </h4>
      );
    }

    return (
      <div>
        <div className="timeline-header">
          <TimelineComponent.Zoomer initialScale={100}/>
        </div>
        <div className="timeline" style={{height: "500px"}}>
          <div className="list-container">
            <TimelineComponent.ItemList 
              items={this.data.listItems}
              onClick={this.selectItem} />
          </div>
          <div className="chart-container">
            <TimelineComponent.TimeChart 
              items={this.data.listItems} 
              gridWidth={this.data.gridWidth} 
              height={this.data.svgContainerHeight} 
              width={this.data.svgContainerWidth} />
          </div>
        </div>
      </div>
    );
  }
});

function processedTimelineData(timeline, scale, selectedItem) {
  var items = timeline.getItemList();
  var listItems = [];

  const height = 20;
  var y = 20;

  // UI adjustments
  var svgContainerHeight = (height + 10) * items.length;
  var svgContainerWidth = $(".chart-container").width();

  var minWidth = ($(window).width() / 3)*2;
  if(svgContainerWidth < minWidth) {
    svgContainerWidth = minWidth;
  }

  if(items && items[0]) {
    var originalStartAt = items[0].startAt;
    var startAt = scaler(originalStartAt, scale);
  }

  items.forEach(function(item) {
    if(item.info && item.info.name) {
      var timelineItems = timeline.getItemTimeline(item.key);
      var timelineData = [];

      var sections = TimelineComponent.logics.buildSections(timelineItems);

      var initTimestamp = scaler(timelineItems[0].timestamp, scale);
      var x = initTimestamp - startAt;
      // It's possible that this might be minus values.
      // We need to find the issue for this
      x = x < 0 ? 0 : x;

      sections.forEach(function(section) {
       var d = {
          "x": x,
          "y": y + 2.5,
          "width": scaler(section.time, scale),
          "height" : height - 10,
          "fill": TimelineComponent.colorsForSections[section.name]
        };

        timelineData.push(d);
        x = x + scaler(section.time, scale);

        // set dynamic width to SVG
        if(svgContainerWidth < x ) {
          svgContainerWidth = x;
        }
      });

      var scrollLeft = scaler(item.startAt  - originalStartAt, scale) || 0;
      var scrollTop = y - 10;
      var key = item.key;

      var type = key.split("-");
      type = type[0];

      var className = "";
      var rowColor = "#F6F6F0";

      if(selectedItem === item.key) {
        className = "selected";
        rowColor = "#C8F0FE";
      }

      var itm = {
        "name": item.info.name,
        "type": type,
        "key": key,
        "startAt": item.startAt,
        "className": className,
        "rowColor" : rowColor,
        "scrollLeft": scrollLeft,
        "scrollTop": scrollTop,
        "timeline": timelineData
      };
      listItems.push(itm);

      y = y + 30;
    }
  });

  return {
    "listItems": listItems,
    "svgContainerHeight": svgContainerHeight,
    "svgContainerWidth": svgContainerWidth
  };
}

function scaler(value, scale) {
  var scaler = 100 / scale;
  return value / scaler;
}
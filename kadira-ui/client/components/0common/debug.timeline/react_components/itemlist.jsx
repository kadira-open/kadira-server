TimelineComponent.ItemList = React.createClass({
  displayName: "TimelineComponent.ItemList",
  propTypes: {
    // array of items
    items: React.PropTypes.array.isRequired,

    // EVENTS
    onClick: React.PropTypes.func
  },
  _getItemName(item) {
    var itemName = item.name;
    if(itemName.length > 25) {
      itemName = itemName.substring(0, 22) + ' ..';
    }
    
    return itemName;
  },
  _buildItem(item) {
    var spanClassName = "type-label type-" + item.type;

    return (
      <li 
        key={item.key}
        className={item.className} 
        onClick={TimelineComponent.actions.selectItem.bind(null, item.key)}>
          <span className={spanClassName}>{item.type}</span> {this._getItemName(item)}
      </li>
    );
  },
  render() {
    return (<ul>{this.props.items.map(this._buildItem)}</ul>);
  }
});

function scaler(value, scale) {
  var scaler = 100 / scale;
  return value / scaler;
}
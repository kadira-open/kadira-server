TimeSeriesSingle.SeriesRow = React.createClass({
  propTypes: {
    color: React.PropTypes.string.isRequired,
    link: React.PropTypes.string.isRequired,
    minValue: React.PropTypes.number.isRequired,
    maxValue: React.PropTypes.number.isRequired,
    activeValue: React.PropTypes.number.isRequired
  },
  render() {
    return (
      <tr>
        <td colSpan="2">
          <span>
            <a href={this.props.link} target="_blank">
              <span className="glyphicon glyphicon-new-window"></span>
            </a>
          </span>
          <span className="glyphicon glyphicon-stop" style={{color: this.props.color}}></span>
          <span>
            {this.props.name}
          </span>
        </td>
        <td>{this.props.activeValue}</td>
        <td>{this.props.minValue}</td>
        <td>{this.props.maxValue}</td>
      </tr>
    );
  },
  shouldComponentUpdate(prevProps){
    var needRender = 
      this.props.minValue != prevProps.minValue ||
      this.props.maxValue != prevProps.maxValue ||
      this.props.activeValue != prevProps.activeValue;
    return needRender;
  }
});

TimeSeriesSingle.HostsList = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData() {
    var fullscreenDataMap = this.props.fullscreenDataMapFn();
    var hostsArray = _.keys(fullscreenDataMap.hosts);
    return {
      hostsArray: hostsArray,
      hostInfoByTimestamp: fullscreenDataMap.hostInfoByTimestamp,
      hosts: fullscreenDataMap.hosts,
      activePoint: this.props.activePointFn(),
      activeSeries: this.props.activeSeriesFn()
    };
  },
  getActivePointDate(){
    var timeStamp = this.data.activePoint[0];
    if(!timeStamp){
      return ;
    }
    return moment(timeStamp).format("MMM DD, YYYY HH:mm");
  },
  getHostData(name, property){
    var hostsData = this.data.hosts[name] || {};
    return hostsData[property];
  },
  getActiveValue(name){
    var activePoint = this.data.activePoint || [];
    var hostsData = this.data.hostInfoByTimestamp[activePoint[0]] || {};
    hostsData[name] = hostsData[name] || {};

    return hostsData[name].value || 0;
  },
  getRowByHost(hostName) {
    var activeValue = this.getActiveValue(hostName);
    // Remove zero value hosts
    if(activeValue <= 0) {
      return null;
    }

    return (
      <TimeSeriesSingle.SeriesRow
        color={this.getHostData(hostName, "color")}
        link={this.getHostData(hostName, "link")}
        maxValue={this.getHostData(hostName, "maxValue")}
        minValue={this.getHostData(hostName, "minValue")}
        name={hostName}
        key={hostName}
        activeValue={activeValue}/>
    );
  },
  render() {
    var activeSeries = this.data.activeSeries;
    return (
      <div>
        <div className="panel panel-default panel-hosts">
          <p className="selected-point">
            {this.getActivePointDate()}
          </p>
          <table className="table table-condensed table-active-data">
            <thead>
              <tr>
                <th colSpan="2">Host Name</th>
                <th>Active Value</th>
                <th>Min Value</th>
                <th>Max Value</th>
              </tr>
            </thead>
            <tbody>
              {this.getRowByHost(activeSeries)}
            </tbody>
          </table>
        <div className="div-table-content">
          <table className="table table-condensed">
            <tbody>
              {this.data.hostsArray.map(this.getRowByHost)}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    );
  }
});

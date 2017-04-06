Meteor.methods({
  "traceExplorer.getIpLocation": function(ip) {
    check(ip, String);
    this.unblock();
    Match.test(ip, String);
    var result = HTTP.call("GET", "http://www.geoplugin.net/json.gp", {
      params: {
        ip: ip
      }
    });

    var parsed;
    if (result && result.content) {
      parsed = JSON.parse(result.content);
    }
    var isStatusOk =
    parsed["geoplugin_status"] === 200 || parsed["geoplugin_status"] === 206;

    if (isStatusOk) {
      var info = _.pick(
        parsed,
        "geoplugin_city",
        "geoplugin_countryName",
        "geoplugin_latitude",
        "geoplugin_longitude"
      );
      return info;
    }
  }
});
import UAParser from 'ua-parser-js'

var component =
FlowComponents.define("traceExplorer.clientError", function(params) {
  this.autorun(function() {
    var trace = params.traceFn() || {};

    if(trace.stacks && trace.stacks.length > 1) {
      this.set("canDisplayEventsTab", true);
    } else {
      this.set("canDisplayEventsTab", false);
    }
    if(trace.info && trace.info.browser) {
      trace.info.browser = this.getUserAgentInfo(trace.info.browser);
    }

    if(trace.info && trace.info.url){
      var url = trace.info.url;
      trace.info.url = "<a href=\""+ url+ "\" target=\"_blank\">" + url +"</a>";
    }

    this.set("trace", trace);
  });
});

component.action.goToMapLink = function() {
  var trace = this.get(trace);
  if(trace.info && trace.info.ip){
    var path = this.getIpLocation(trace.info.ip);
    FlowRouter.go(path);
  }
};

component.state.eventsInfo = function(trace){
  var stacks = _.clone(trace.stacks) || [];

  if(stacks[0] && stacks[1]){
    stacks[1].errorTrace = stacks[0];
    stacks[1].errorName = trace.name;
    delete stacks[0];
  }
  return stacks.reverse();
};

component.state.waitTime = function(stack) {
  if(!stack.runAt || !stack.createdAt){
    return;
  } else {
    return this.prettifyTime(stack.runAt - stack.createdAt);
  }
};

component.state.elementName = function(element) {
  if(element.name) {
    var name = element.name;
    if(element.attributes) {
      var className = element.attributes.class;
      var id = element.attributes.id;

      if(id) {
        name += "(id=" + id + ")";
      } else if(className) {
        name += "(class=" + className + ")";
      }
    }
    return name;
  } else {
    return "Unknown Element";
  }
};

component.state.isIp = function(key) {
  return key === "ip";
};


var browsers = {
  "arora": "arora",
  "chromium": "chromium",
  "flock": "flock",
  "konqueror": "konqueror",
  "rockmelt": "rockmelt",
  "camino": "camino",
  "dolfin": "dolfin",
  "iceweasel": "iceweasel",
  "midori": "midori",
  "safari": "safari",
  "chrome": "chrome",
  "firefox": "firefox",
  "ie": "ie",
  "opera": "opera",
  "fennec": "firefox"
};
var oss = {
  "android": "android",
  "chromium": "chromium",
  "kubuntu": "kubuntu",
  "pclinuxos": "pclinuxos",
  "ubuntu": "ubuntu",
  "arch": "arch",
  "debian": "debian",
  "linux": "linux",
  "redhat": "redhat",
  "webos": "webos",
  "bada": "bada",
  "fedora": "fedora",
  "lubuntu": "lubuntu",
  "slackware": "slackware",
  "windows": "windows",
  "rim": "blackberry",
  "freebsd": "freebsd",
  "mac": "mac",
  "solaris": "solaris",
  "windows phone os": "winphone",
  "bsd": "bsd",
  "gentoo": "gentoo",
  "mandriva": "mandriva",
  "suse": "suse",
  "xubuntu": "xubuntu",
  "centos": "centos",
  "ios": "mac",
  "meego": "meego",
  "symbian": "symbian"
};

component.prototype.getUserAgentInfo = function(userAgent) {
  var parser = new UAParser(userAgent);
  var browser = parser.getBrowser();
  var os = parser.getOS();
  var device = parser.getDevice();
  var engine = parser.getEngine();

  var browserDetails = "";

  if(browser.name){
    var browserString = browser.name.toLowerCase();
    var browserIcon;
    for( var b in browsers){
      if(browserString.search(b) !== -1 ){
        browserIcon = b;
      }
    }
    if(browserIcon){
      var browserIconLink = `/images/ua-parser/browser/${browserIcon}.png`;
      browserDetails += `<img src="${browserIconLink}"  class="icon"/>`
    }
    browserDetails += browser.name;
  }
  if(engine.name && engine.version){
    browserDetails += ` (${engine.name}) `;
  }
  if(browser.version){
    browserDetails += ` - ${browser.version} `;
  }
  if(os.name){
    var osString = os.name.toLowerCase();
    var osIcon;
    for(var o in oss){
      if(osString.search(o) !== -1){
        osIcon = o;
      }
    }
    if(osIcon){
      var osIconLink = `/images/ua-parser/os/${osIcon}.png`;
      browserDetails += `<img src="${osIconLink}" class="icon"/>`;
    }
    browserDetails += " "+ os.name;
  }
  if(os.version){
    browserDetails += " - " + os.version;
  }
  if(device.type){
    browserDetails += ", " + device.type;
  }
  if(device.vendor){
    browserDetails += " - " + device.vendor;
  }
  if(device.model){
    browserDetails += " " + device.model;
  }
  return browserDetails;
};

component.prototype.getIpLocation = function (ip){
  var self = this;
  Meteor.call("traceExplorer.getIpLocation", ip, function(err, data) {
    if(!err && data){
      var ipDetails = "";
      if(data["geoplugin_city"]){
        ipDetails += data["geoplugin_city"] + ", ";
      }
      if(data["geoplugin_countryName"]){
        ipDetails += data["geoplugin_countryName"];
      }
      self.set("ipLocation", ipDetails);

      var mapLink;
      if(data["geoplugin_latitude"] && data["geoplugin_longitude"]) {
        mapLink = "https://www.google.com/maps/@" +
        data["geoplugin_latitude"] + "," +
        data["geoplugin_longitude"] + ",8z";
      }
      return mapLink;
    }
  });
};

component.extend(Mixins.UiHelpers);

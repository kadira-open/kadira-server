import helmet from 'helmet'

// added HSTS headers
WebApp.connectHandlers.use(helmet.hsts({
  maxAge: 1000 * 3600 * 24 * 30, // 30 days,
  includeSubdomains: false,
  // preven sending HSTS for Kadira Debug
  setIf: function(req) {
    var host = req.headers["host"];
    if(/^debug.kadira.io/.test(host)) {
      return false;
    } else {
      return true;
    }
  }
}));

// added iexss
WebApp.connectHandlers.use(helmet.xssFilter());

// stop clickjacking
WebApp.connectHandlers.use(helmet.frameguard());

// force-ssl
WebApp.connectHandlers.use(function(req, res, next) {
  // borrowed from: https://goo.gl/PfeRc9
  var isSsl = req.connection.pair ||
    (req.headers["x-forwarded-proto"] &&
    req.headers["x-forwarded-proto"].indexOf("https") !== -1);

  var host = req.headers["host"];
  // borrowed from: https://goo.gl/PfeRc9
  // strip off the port number. If we went to a URL with a custom
  // port, we don"t know what the custom SSL port is anyway.
  host = host.replace(/:\d+$/, "");

  var isKadiraIoHost = /kadira.io/.test(host);
  if(!isSsl && isKadiraIoHost) {
    var newUrl = "https://" + host + req.url;
    res.writeHead(302, {
      "Location": newUrl
    });
    res.end();
    return;
  }

  next();
});

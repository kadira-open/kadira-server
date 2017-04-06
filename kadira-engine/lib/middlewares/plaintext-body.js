// based on stackoverflow answer below
// http://stackoverflow.com/questions/12497358/handling-text-plain-in-express-3-via-connect/12497793#12497793

module.exports = function (req, res, next) {
  // XHR sent from kadira contains a content type application/json header
  if(req.headers['content-type']) {
    next();
    return;
  }

  // XDR only supports text/plain but we are sending JSON data
  // error-manager middleware expects data on req.body
  if(!req.body || JSON.stringify(req.body) === '{}') {
    var body = ''
    req.setEncoding('utf8');

    req.on('data', function (chunk) {
      body += chunk;
    });

    req.on('end', function () {
      try {
        req.body = JSON.parse(body);
      } catch(e) {
        console.error('unable to parse data as json', body);
      }

      next();
    });

  }
}

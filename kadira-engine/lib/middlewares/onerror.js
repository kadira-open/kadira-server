module.exports = function() {
  return function onerror(err, req, res, next) {
    var appId = (req.app)? req.app._id : null;

    if(!/\/types\/json.js/.test(err.stack)) {
      // print errors other than JSON parse errors
      //  ****/types/json.js is the file which throws these errors 
      //  when invoked json middleware
      console.error("ERROR[" + appId + "] : " + err.stack);
    } else {
      console.error("ERROR[" + appId + "] : " + "JSON parse error");
    }
    res.writeHead(500);
    res.end();
  };  
};
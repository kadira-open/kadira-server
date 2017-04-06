Mixins.UiHelpers = {state: {}, prototype: {}};
Mixins.UiHelpers.state.prettifyDate = function(date) {
  return this.prettifyDate(date);
};

Mixins.UiHelpers.prototype.prettifyDate = function(date) {
  return moment(date).format("dddd, MMM DD, YYYY HH:mm:ss");
};

Mixins.UiHelpers.prototype.getTime = function(date) {
  return moment(date).format("HH:mm:ss");
};

Mixins.UiHelpers.prototype.prettifyCpuTime = function(beforeCpu) {
  beforeCpu = beforeCpu || 0;
  return (beforeCpu).toFixed(2);
};

Mixins.UiHelpers.state.prettifyCpuTime = function(beforeCpu) {
  return this.prettifyCpuTime(beforeCpu);
};

Mixins.UiHelpers.state.arrayify = function(obj) {
  var result = [];
  for (var key in obj) {
    result.push({key: key, value: obj[key]});
  }
  return result;
};

Mixins.UiHelpers.state.gravatar = function(email, size) {
  size = size || 30;
  var options = {size: size, default: "mm", secure: true};
  var imageUrl = Gravatar.imageUrl(email, options);
  return imageUrl;
};

Mixins.UiHelpers.prototype.prettifyTime = function(value, decPlaces){
  decPlaces = decPlaces || 2;
  var seconds = 1000;
  var minutes = seconds*60;
  var hours = minutes * 60;
  var days = hours * 24;
  if(value < seconds * 5){
    return value.toFixed(0) + " ms";
  } else if(value < 60 * 1000 * 2){ //2min
    return (value/seconds).toFixed(decPlaces) + " secs";
  } else if(value < minutes * 120){ //120 mins
    return (value/minutes).toFixed(decPlaces) + " min";
  } else if(value < hours * 120) {
    return (value/hours).toFixed(decPlaces) + " hrs";
  } else {
    return (value/days).toFixed(decPlaces) + " days";
  }
};

Mixins.UiHelpers.prototype.prettifyByte = function(value, decPlaces){
  decPlaces = decPlaces || 2;
  var kilobyte = 1024;
  var megabyte = kilobyte * 1024;
  var gigabyte = megabyte * 1024;
  if(value < 5000*1024){
    return (value / kilobyte).toFixed(decPlaces) +" KB";
  } else if(value < 5000*1024*1024){
    return (value / megabyte).toFixed(decPlaces) + " MB";
  } else if(value < 5000*1024*1024*1024){
    return (value / gigabyte).toFixed(decPlaces) + " GB";
  } else if(value < 5000*1024*1024*1024*1024){
    return (value / gigabyte).toFixed(decPlaces) + " GB";
  } else if(5000*1024*1024*1024*1024 <= value){
    return (value / gigabyte).toFixed(decPlaces) + " TB";
  }
};

/*
  taken from
  http://goo.gl/nvuC0N
*/
Mixins.UiHelpers.prototype.abbrNum = function(number, decPlaces) {
    // 2 decimal places => 100, 3 => 1000, etc
  decPlaces = Math.pow(10,decPlaces);

    // Enumerate number abbreviations
  var abbrev = [ "k", "m", "b", "t" ];

    // Go through the array backwards, so we do the largest first
  for (var i = abbrev.length-1; i>=0; i--) {

        // Convert array index to "1000", "1000000", etc
    var size = Math.pow(10,(i+1)*3);

        // If the number is bigger or equal do the abbreviation
    if(size <= number) {
             // Here, we multiply by decPlaces, round, and then divide by
             // decPlaces.
             // This gives us nice rounding to a particular decimal place.
      number = Math.round(number*decPlaces/size)/decPlaces;

             // Handle special case where we round up to the next abbreviation
      if((number === 1000) && (i < abbrev.length - 1)) {
        number = 1;
        i++;
      }

             // Add the letter for the abbreviation
      number += abbrev[i];

             // We are done... stop
      break;
    }
  }

  return number;
};

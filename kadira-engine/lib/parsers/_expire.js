var ttls = {
  'free': 1000*60*60*24*2, // 2days
  'solo': 1000*60*60*24*4, // 2days
  'startup': 1000*60*60*24*16, //16days
  'pro': 1000*60*60*24*97, //97days since we don't show more than 93 days on the UI
  'business': 1000*60*60*24*97 //97days
};

module.exports = {
  getTTL: function (app) {
    if(app.perHostBilling) {
      return ttls['startup'];
    } else {
      var plan = app.plan || 'free';
      return ttls[plan] || ttls['free'];
    }
  }
};

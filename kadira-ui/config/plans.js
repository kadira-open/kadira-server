// Features

PlansManager.defineFeature("coreData", {all: true});
PlansManager.defineFeature("hostInfo", {except:["free"]});
PlansManager.defineFeature("shareApps", {except:["free", "solo"]});
PlansManager.defineFeature("alerts", {all: true});
PlansManager.defineFeature("remoteProfiling", {except: ["free"]});
PlansManager.defineFeature("observerInfo", {except: ["free"]});
PlansManager.defineFeature("reports", {except: ["free"]});
PlansManager.defineFeature("insights", ["pro", "business"]);
PlansManager.defineFeature("profiler", {except:["free"]});
PlansManager.defineFeature("errorStatus", {except: ["free"]});
PlansManager.defineFeature("resTimeDistribution", {except:["free"]});

// Configurations

PlansManager.setConfig("plansDef", {
  _default: "free",
  free    : { "amount": 0,   "hosts": 1 },
  solo    : { "amount": 10,  "hosts": 3 },
  startup : { "amount": 50,  "hosts": 5 },
  pro     : { "amount": 150, "hosts": 15 },
  business: { "amount": 350, "hosts": 45 }  
});

PlansManager.setConfig("allowedRange", {
  free: 1000 * 3600 * 38, // 38 hours
  solo: 1000 * 3600 * 24 * 4, // 4 days
  startup: 1000 * 3600 * 27 * 15, //15 days
  pro: 1000 * 3600 * 27 * 95, // 95 days
  business: 1000 * 3600 * 27 * 95 // 95 days
});

PlansManager.setConfig("sharedUsersPerApp", {
  free: 0,
  solo: 0,
  startup: 999999,
  pro: 999999,
  business: 99999
});

PlansManager.setConfig("alertsPerApp", {
  free: 1,
  solo: 5,
  startup: 999999,
  pro: 999999,
  business: 99999
});

PlansManager.setConfig("maxRange", {
  free: KadiraData.Ranges.getValue("24hour"),
  solo: KadiraData.Ranges.getValue("3day"),
  startup: KadiraData.Ranges.getValue("7day"),
  pro: KadiraData.Ranges.getValue("30day"),
  business: KadiraData.Ranges.getValue("30day")
});

PlansManager.setConfig("supportedReportFrequencies", {
  free: [null, "off"],
  solo: [null, "off", "daily"],
  startup: [null, "off", "daily", "weekly"],
  pro: [null, "off", "daily", "weekly"],
  business: [null, "off", "daily", "weekly"]
});

ServiceConfiguration.configurations.remove({
  service: "meteor-developer"
});

var localConfigs = {
  clientId: "HcempmSyaawiyb4G4",
  secret: "snC3snsmTebC8HHCwwhqhHaAzAFxtFsQRL"
};

var meteorDevelopersInfo = Meteor.settings.meteorDevelopers || localConfigs;

meteorDevelopersInfo = _.extend({
  service: "meteor-developer"
}, meteorDevelopersInfo);
ServiceConfiguration.configurations.insert(meteorDevelopersInfo);

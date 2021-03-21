Template.configureLoginServiceDialogForBox.siteUrl = function () {
	return Meteor.absoluteUrl();
};

Template.configureLoginServiceDialogForBox.fields = function () {
  return [
      {property: 'client_id', label: 'Client id '},
      {property: 'client_secret', label: 'Secret Key'}
  ];
};

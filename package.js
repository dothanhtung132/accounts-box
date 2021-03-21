Package.describe({
    summary: "Login service for Box accounts"
});

Package.on_use(function(api) {
    api.use('accounts-base', ['client', 'server']);
    api.imply('accounts-base', ['client', 'server']);
    api.use('accounts-oauth', ['client', 'server']);

	api.use('oauth', ['client', 'server']);
    api.use('oauth2', ['client', 'server']);
    api.use('http', ['server']);
    api.use('underscore', ['client', 'server']);
    api.use('templating', 'client');
    api.use('random', 'client');
    api.use('service-configuration', ['client', 'server']);
  	
  	api.add_files(
    ['lib/box_configure.html', 'lib/box_configure.js', 
    'lib/box_login_button.css'],
    'client');

    api.add_files("lib/accounts_box.js");
    api.add_files('lib/box_client.js', 'client');
    api.add_files('lib/box_server.js', 'server');
    api.add_files('lib/box_select.js', 'client');

    //api.export('BoxSelect', 'client');
});

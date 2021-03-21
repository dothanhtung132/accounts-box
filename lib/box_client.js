BoxOAuth = {};

BoxOAuth.requestCredential = function (options, credentialRequestCompleteCallback) {

    if (!credentialRequestCompleteCallback && typeof options === 'function') {
        credentialRequestCompleteCallback = options;
        options = {};
    }

    var config = ServiceConfiguration.configurations.findOne({service: 'box'});
    if (!config) {
        credentialRequestCompleteCallback && credentialRequestCompleteCallback(new ServiceConfiguration.ConfigError("Service not configured"));
        return;
    }

    var credentialToken = Random.id();
    var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    var display = mobile ? 'touch' : 'popup';
    var scope = '';

    if (options && options.requestPermissions) {
        scope = encodeURIComponent(options.requestPermissions.join(' '));
    }

    if(options.sa) credentialToken += '__' + options.requestPermissions.join('-');

    var loginStyle = OAuth._loginStyle('box', config, options);
    var state = Oauth._stateParam(loginStyle, credentialToken, options && options.redirectUrl);

    var loginUrl =
        'https://account.box.com/api/oauth2/authorize' +
        	'?response_type=code' +
            '&client_id=' + config.client_id +
            '&state=' + state;

    if(scope) loginUrl += '&scope=' + scope;

    loginUrl += '&redirect_uri=' + OAuth._redirectUri('box', config);

    if(options.office && typeof Office != 'undefined'){
        loginUrl += escape('&office=1');
        var fullUrl = Meteor.absoluteUrl() + 'boxLoginPopup.html';
        fullUrl += '#loginUrl='+loginUrl;
        // height and width are percentages of the size of the screen.
        var height = Crooze.isIE ? 90 : 70;
        Office.context.ui.displayDialogAsync(fullUrl, {height: height, width: 30, requireHTTPS: true}, _.bind(credentialRequestCompleteCallback, this, credentialToken));
    }else{
        //loginUrl += '%26office%3D1';//testing
        OAuth.launchLogin({
            loginService: 'box',
            loginStyle: loginStyle,
            loginUrl: loginUrl,
            credentialRequestCompleteCallback: credentialRequestCompleteCallback,
            credentialToken: credentialToken,
            popupOptions: {width: 580, height: 700}
        });
    }   
};
Accounts.oauth.registerService('box');

if (Meteor.isClient) {
    Meteor.loginWithBox = function(options, callback) {
        if(options.loginStyle == 'office') return officeLoginWithBox(options, callback);
        // support a callback without options
        if (! callback && typeof options === "function") {
            callback = options;
            options = null;
        }
        var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
        BoxOAuth.requestCredential(options, credentialRequestCompleteCallback);
    };

    var officeLoginWithBox = function(options, loginCallback){
        options = options || {};
        options.office = true;
        delete options.loginStyle;

        BoxOAuth.requestCredential(options, loginCallback);
    }
} /*else {
    Accounts.addAutopublishFields({
        forLoggedInUser: ['services.box.email'],
        forOtherUsers: ['services.box.email']
    });
}*/

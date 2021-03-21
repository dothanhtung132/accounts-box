BoxOAuth = {};

var encryptData = function(data){
    if(OAuthEncryption){
        data = OAuthEncryption.seal(data);
    }
    return data;
}
Oauth.registerService('box', 2, null, function(query) {
    var response    = getTokenResponse(query);
    var accessToken = response.accessToken;
    var refreshToken = response.refreshToken;
    var expiresIn = response.expiresIn;
    var expiresAt = (+new Date) + (1000 * expiresIn);

    var identity = getIdentity(accessToken);

    var serviceData = {
        id: identity.id,
        accessToken: encryptData(accessToken),
        expiresAt: expiresAt,
        refreshToken: encryptData(refreshToken),
        email: identity.login,
        hostname: identity.hostname
    };

    var whiteListed = ['id', 'name', 'login', 'phone', 'max_upload_size'];
    var fields = _.pick(identity, whiteListed);

    serviceData.profileInfo = fields;

    if(identity.enterprise) {
        serviceData.enterprise = identity.enterprise;
    }

    var state = Oauth._stateFromQuery(query);
    //console.log('statestate', state);
    if(state.credentialToken.indexOf('__') > 0){
        serviceData.internalData = {};
        _.forEach(['accessToken', 'expiresAt', 'refreshToken'], function(key){
            serviceData.internalData[key] = serviceData[key];
            delete serviceData[key];
        });
    }

    //console.log('Oauth.registerService', query);
    //console.log('Oauth.registerService', JSON.stringify(options));
    //console.log('Oauth.registerService', JSON.stringify(serviceData));
    
    return {
        serviceData: serviceData,
        options: {
            profile: fields
        }
    };
});

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
var getTokenResponse = function (query) {
    var config = ServiceConfiguration.configurations.findOne({service: 'box'});
    if (!config) {
        throw new ServiceConfiguration.ConfigError("Service not configured");
    }

    var responseContent;

    try {
        // Request an access token
        var params = {
            client_id:     config.client_id,
            client_secret: config.secret.client_secret,
            code:          query.code,
            grant_type:    'authorization_code'
        };
        responseContent = HTTP.post(
            "https://app.box.com/api/oauth2/token", {
                params: params
            }).content;
    } catch (err) {
        throw _.extend(new Error("Failed to complete OAuth handshake with box. " + err.message),
            {response: err.response});
    }
    // Success!  Extract the box access token and key
    // from the response
    var parsedResponse = JSON.parse(responseContent);

    var accessToken = parsedResponse.access_token;
    var expiresIn = parsedResponse.expires_in;
    var refreshToken = parsedResponse.refresh_token;

    if (!accessToken) {
        throw new Error("Failed to complete OAuth handshake with box " +
           "-- can't find access token in HTTP response. " + responseContent);
    }

    return {
        accessToken: accessToken,
        expiresIn: expiresIn,
        refreshToken: refreshToken
    };
};


var getIdentity = function (accessToken) {
    var result = HTTP.get("https://api.box.com/2.0/users/me?fields=id,name,login,max_upload_size,enterprise,status,hostname",{
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    if (result.error)
      throw result.error;
    return result.data;
};

BoxOAuth.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};


function SessionService ($q, $rootScope, $localStorage, $http) {
    var self = this;

    this.authorizeUser = function (username, password) {
        var dfd = $q.defer();
        var payload = {
            username:   username, 
            password: password,
        };
        $http.post('http://api.gabeowens.com/', payload )
            .then( function success( response ) {
                console.log('Request success');
                console.log(response);
                // var expirationTime = new Date();
                // expirationTime.setMinutes(expirationTime.getMinutes() + 30);
                
                // $localStorage.loginExpiration = expirationTime;
                // $localStorage.accessToken = response.data.access_token;
                // $localStorage.idToken = response.data.id_token;
                
                // var decryptToken = self.decryptToken(response.data.id_token);
                // $localStorage.authZeroId = decryptToken.sub;
                // $localStorage.oauthId = decryptToken.sub.split('|')[1];

                dfd.resolve({response: response});
            }).catch( function failure( err ) {
                dfd.reject(false);
            });
        
        return dfd.promise;
    };
    
    this.refreshToken = function () {
        var dfd = $q.defer();
        var payload = {
            client_id:  "3gmCaIlAdLGnWW12lbRr3s2pcki4089q",
            id_token:    $localStorage.idToken,
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            scope:      "openid",
            target:     "3gmCaIlAdLGnWW12lbRr3s2pcki4089q",
            api_type:   "app"
        };
        $http.post('https://ulytic.auth0.com/delegation', payload )
        .then( function success( response ) {
            $localStorage.idToken = response.data.id_token;
            var decryptToken = self.decryptToken(response.data.id_token);
            dfd.resolve({OauthUser: decryptToken.sub});
        }).catch( function failure( err ) {
            self.logUserOut();
            dfd.reject(err);
        });
        return dfd.promise;
    };

    this.decryptToken = function (token) {
        var partial = token.split('.');
        return JSON.parse(atob(partial[1]));
    };

    this.getJwtToken = function () {
        return $localStorage.idToken;
    };

    this.logUserOut = function () {
        var dfd = $q.defer();
        
        var rememberMe;
        if($localStorage.rememberMeName){
            rememberMe = $localStorage.rememberMeName;
        }
        $localStorage.$reset();
        if(rememberMe){
            $localStorage.rememberMeName = rememberMe;
        }
        
        dfd.resolve(false);
        return dfd.promise;
    };
}


angular.module('app').service('SessionService', SessionService);
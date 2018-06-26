function SessionService ($q, $rootScope, $localStorage, $http, envService) {
    var self = this;

    this.authorizeUser = function (username, password) {
        var dfd = $q.defer();
        var payload = {
            username:   username, 
            password: password,
        };
        $http.post(envService.read('apiUrl')+'/login.php', payload )
            .then( function success( response ) {
                if (response.data.login === true){
                    $localStorage.authorized = true;
                    var expirationTime = new Date();
                    expirationTime.setMinutes(expirationTime.getMinutes() + 30);
                    $localStorage.loginExpiration = expirationTime.getTime();
                    dfd.resolve({});
                }
                dfd.reject(false);
            }).catch( function failure( err ) {
                dfd.reject(false);
            });
        
        return dfd.promise;
    };
    
    this.refreshToken = function () {
        var expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 30);
        $localStorage.loginExpiration = expirationTime.getTime();
    };

    this.getLoginStatus = function () {
        if ($localStorage.authorized === true){
            var now = new Date();
            if ($localStorage.loginExpiration >= now.getTime()){
                return true;
            }
        }
        return false;
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
        
        dfd.resolve();
        return dfd.promise;
    };
}


angular.module('app').service('SessionService', SessionService);
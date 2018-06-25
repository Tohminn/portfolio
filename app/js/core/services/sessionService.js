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
        $localStorage.loginExpiration = expirationTime;
    };

    this.getLoginStatus = function () {
        if ($localStorage.authorized === true){
            console.log('authorized');
            var now = new Date();
            console.log($localStorage.loginExpiration);
            console.log(now.getTime());
            if ($localStorage.loginExpiration >= now.getTime()){
                console.log('not expired');
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
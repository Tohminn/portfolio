function AccountService ($http, $q, envService) {
    var self = this;

    self.getUserData = function (authZeroId) {
        var dfd = $q.defer();
        $http.post(envService.read('apiUrl')+'/info.php', {})
            .then( function (response) {
                if (response.data.result === true){
                    dfd.resolve(response.data);
                }
                dfd.resolve(false);
            }).catch(function(response){
                dfd.resolve(false);
            });
        return dfd.promise;
    };

}

angular.module('app')
    .service('AccountService', AccountService);
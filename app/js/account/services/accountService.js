function AccountService ($http, $q, $localStorage, $timeout, envService) {
    var self = this;

    self.getUserData = function () {
        var dfd = $q.defer();
        $http.post(envService.read('apiUrl')+'/info.php', {})
            .then( function (response) {
                if (response.data.result === true){
                    $timeout(function(){
                        $localStorage.homePage = {};
                        $localStorage.homePage.contact = response.data.contact;
                        $localStorage.homePage.aboutMe = response.data.aboutMe;
                        $localStorage.homePage.references = response.data.references;
                        $localStorage.projects = response.data.projects;
                        dfd.resolve(true);
                    });
                }else{
                    dfd.resolve(false);
                }
                
            }).catch(function(response){
                dfd.reject(false);
            });
        return dfd.promise;
    };

}

angular.module('app')
    .service('AccountService', AccountService);
function AccountService ($http, HttpService, $q, envService) {
    var self = this;
    var AppConstants = {};
    AppConstants.clientId = '3gmCaIlAdLGnWW12lbRr3s2pcki4089q';
    AppConstants.dbConnection = 'Username-Password-Authentication';

    self.submitEnrollment = function (emailAddress, password) {
        var payload = {
            client_id: AppConstants.clientId,
            email: emailAddress,
            password: password,
            connection: AppConstants.dbConnection
        };
        return HttpService.post('https://ulytic.auth0.com/dbconnections/signup', payload);
    };

    self.getUserData = function (authZeroId) {
        var dfd = $q.defer();
        var payload = {
            authZeroId: authZeroId
        };
        $http.post(envService.read('daarUrl')+'/dashboard/fetchUserData', payload)
            .then( function (response) {
                dfd.resolve(response.data);
            }).catch(function(response){
                dfd.resolve(false);
            });
        return dfd.promise;
    };

    self.getUserDataFromCache = function () {
        var dfd = $q.defer();
        // var userData = $cookies.getObject('user');
        // dfd.resolve(userData);
        dfd.resolve(true);
        return dfd.promise;
    };
    
    self.submitForgotPassword = function (emailAddress) {
        var dfd = $q.defer();
        var payload = {
            client_id: AppConstants.clientId,
            email: emailAddress,
            connection: AppConstants.dbConnection
        };
        $http.post('https://ulytic.auth0.com/dbconnections/change_password', payload).then( function success (response) {
            dfd.resolve(response);
        }).catch( function (err) {
            dfd.reject(err);
            console.log(err);
        });
        return dfd.promise;
    };

}

angular.module('app')
    .service('AccountService', AccountService);

function Login () {
    return {
        restrict: 'E',
        templateUrl: '/core/templates/login.html'
    };
}



angular.module('app').directive('login', Login);


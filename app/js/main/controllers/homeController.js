
function HomeController ($rootScope, $scope, $location, $localStorage, $timeout) {
    var self = this;
    if(!$localStorage.homePage){
        $localStorage.homePage = {};
        console.log('set local storage in home');
    }
    $scope.$storage = $localStorage;

    $scope.navigationChange = function(route){
        var url = '/';
        var title = 'Interactive Portfolio';
        switch(route){
            case 'login':
                url = '/login';
                title = 'Log In';
                break;
        }
        $rootScope.$emit('navChange', title);
        $location.url(url);
    };


}
angular.module('app').controller('HomeController', HomeController);

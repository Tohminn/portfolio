
function HomeController ($rootScope, $scope, $location, $localStorage) {
    var self = this;

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

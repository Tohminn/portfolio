
function HomeController ($rootScope, $scope, $location) {
    var self = this;

    $scope.logged_in = false;

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

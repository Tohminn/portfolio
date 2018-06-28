
function HomeController ($rootScope, $scope, $location, $localStorage, $timeout) {
    var self = this;
    
    if(!$localStorage.homePage){
        $localStorage.homePage = {};
    }
    if(!$localStorage.projects){
        $localStorage.projects = [];
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

    $scope.showProject = function(id, title){
        $rootScope.$emit('navChange', 'Project: '+title);
        $location.url('/projects/'+id);
    };


}
angular.module('app').controller('HomeController', HomeController);

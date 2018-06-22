
function sidebarDirective () {
    return {
        restrict: 'E',
        templateUrl: '/chrome/templates/sidebar.html',
        controllerAs: 'sidebarCtrl',
        controller: 'SidebarController'
    };
}



angular.module('app').directive('chromeSidebar', sidebarDirective);
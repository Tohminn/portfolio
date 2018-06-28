
function topNavDirective () {
    return {
        restrict: 'E',
        templateUrl: '/chrome/templates/top-nav.html',
        controllerAs: 'topNavCtrl',
        controller: function ($rootScope, $localStorage, $scope) {
            var self = this;

            self.navigationTitle = 'Interactive Portfolio';
            $rootScope.$on('navChange', function (event, data) {
                if (data != self.navigationTitle){
                    self.navigationTitle = data;
                }
            });
        }
    };
}



angular.module('app')
    .directive('topNav', topNavDirective);
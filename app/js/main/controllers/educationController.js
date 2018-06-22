
function EducationController ($rootScope, $scope, $location) {
    $rootScope.$emit('navChange', 'Education');
    var self = this;

}
angular.module('app').controller('EducationController', EducationController);
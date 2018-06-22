
function ExperienceController ($rootScope, $scope, $location) {
    $rootScope.$emit('navChange', 'Experience');
    var self = this;

}
angular.module('app').controller('ExperienceController', ExperienceController);

function SkillsController ($rootScope, $scope, $location) {
    $rootScope.$emit('navChange', 'Skills');
    var self = this;

    $scope.isCollapsed = {
        front_end : true,
        back_end : true,
        databases : true,
        dev_ops : true,
        machine_learning: true,
        code_practices: true
    };

}
angular.module('app').controller('SkillsController', SkillsController);

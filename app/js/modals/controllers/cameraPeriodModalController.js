

function CameraPeriodModalController ($scope, $uibModalInstance, camCount, timePeriods) {
    var self = this;

    $scope.camChoice = 0;
    $scope.camOptions = [1];
    for(var index = 2; index <= camCount; index++){
        $scope.camOptions.push(index);
    }

    $scope.periodChoice = 0;
    $scope.timePeriods = timePeriods;

    $scope.save = function(){
        $uibModalInstance.close({camIndex : $scope.camChoice, periodIndex : $scope.periodChoice});
    };

    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    };
}

angular.module('app')
    .controller('CameraPeriodModalController', CameraPeriodModalController);
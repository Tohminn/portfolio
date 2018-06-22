

function ClassificationModalController ($scope, $uibModalInstance, classification) {
    var self = this;
    if(!classification){
        classification = {
            option       : '',
            bikesOnRoads : false,
            crosswalks   : false,
            tandemTrucks : false,
            comments     : ''
        };
    }
    $scope.classification = classification;
    $scope.standardOptions = [
        'All Vehicles (No Classifications)',
        'Lights / Other Vehicles',
        'Motorcycles / Other Vehicles',
        'Lights / Mediums  / Articulated Trucks',
        'Lights / Buses / Trucks',
        'Motorcycles / Cars & Light Goods / Other Vehicles',
        'Only Pedestrians / Bicycles',
    ];
    $scope.premiumOptions = [
        'Lights / Buses / Single-Unit Trucks / Articulated Trucks',
        'Motorcycles / Cars / Light Goods / Buses / Single-Unit Trucks / Articulated Trucks',
    ];



    $scope.save = function(){
        $uibModalInstance.close($scope.classification);
    };

    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    };
}

angular.module('app')
    .controller('ClassificationModalController', ClassificationModalController);


function ReuploadFileSelectionModalController ($scope, $uibModalInstance, camIndex, tpIndex, vidIndex) {
    var self = this;

    $scope.errorMessage = '';
    $scope.videoFile = {
        name    : '',
        file    : undefined,
        id      : undefined,
        camIndex  : camIndex,
        tpIndex : tpIndex,
        vidIndex : vidIndex
    };

    $scope.$watch('file', function () {
        $scope.addFile($scope.file);
    });

    $scope.addFile = function(newFile){
        $scope.errorMessage = '';
        if(newFile){
            if(!newFile.type.startsWith('video/')){
                $scope.errorMessage = 'File must be of video type';
                return;
            }
            var nameArray = newFile.name.split('.').reverse();
            nameArray.splice(0,1);

            $scope.videoFile.name = nameArray.reverse().join('.');
            $scope.videoFile.file = newFile;
        }
    };

    $scope.save = function(){
        $uibModalInstance.close({videoFile : $scope.videoFile});
    };

    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    };
}

angular.module('app')
    .controller('ReuploadFileSelectionModalController', ReuploadFileSelectionModalController);


function StudySubmissionModalController ($scope, $uibModalInstance, $timeout, SubmissionService, UploadService, studyName, videoCameras, studyType, classification, dateTime, report, attachments) {
    var self = this;

    $scope.studyName = studyName;
    $scope.show = {
        submission : true,
        loading : false,
        success :  false,
        error : false
    };
    $scope.loadingText = 'Submitting Study...';
    $scope.errorText = '';

    $scope.submit = function(){
        $scope.show.submission = false;
        $scope.show.loading = true;
        $scope.show.success = false;
        $scope.show.error = false;
        SubmissionService.submitNewStudy(studyName, studyType, classification, dateTime, report)
            .then(function(result){
                if(result.result){
                    var studyId = result.studyId;
                    var submitDate = result.submitDate;
                    console.log('New Study Id: ', studyId);
                    
                    Promise.resolve().then(UploadService.prepareEvaporate())
                    .then(function(result){
                        if(attachments && Array.isArray(attachments) && attachments.length > 0){
                            $timeout(function(){
                                $scope.loadingText = 'Uploading Attachments...';
                                UploadService.uploadAttachments(studyId, attachments)
                                .then(function(response){
                                    $scope.loadingText = 'Preparing Video Files for Upload...';
                                    UploadService.uploadVideos(studyId, studyName, submitDate, videoCameras)
                                    .then(function(response){
                                        window.onbeforeunload = function(e){
                                            return 'At least one Study is still uploading. If you leave, the upload will fail. Are you sure you want to leave?';
                                        };
                                        $scope.show.success = true;
                                        $scope.show.loading = false;
                                    }).catch(function(response){
                                        console.log('Error, ', response);
                                        $scope.errorText = response;
                                        $scope.show.loading = false;
                                        $scope.show.error = true;
                                    });
                                });
                            });
                        }else{
                            $timeout(function(){
                                $scope.loadingText = 'Preparing Video Files for Upload...';
                                UploadService.uploadVideos(studyId, studyName, submitDate, videoCameras)
                                .then(function(response){
                                    window.onbeforeunload = function(e){
                                        return 'At least one Study is still uploading. If you leave, the upload will fail. Are you sure you want to leave?';
                                    };
                                    $scope.show.success = true;
                                    $scope.show.loading = false;
                                }).catch(function(response){
                                    console.log('Error, ', response);
                                    $scope.errorText = response;
                                    $scope.show.loading = false;
                                    $scope.show.error = true;
                                });
                            });
                        }
                    });
                }
                else {
                    console.log(result);
                    $scope.errorText = result;
                }
            }).catch(function(result){
                console.log('failed 2');
                console.log(result);
                $scope.errorText = result;
            });
    };

    $scope.return = function(){
        $uibModalInstance.close(true);
    };

    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    };
}

angular.module('app')
    .controller('StudySubmissionModalController', StudySubmissionModalController);
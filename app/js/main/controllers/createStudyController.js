
angular.module('app').controller('CreateStudyController', [
'$scope', '$rootScope', '$uibModal', '$timeout', '$location', 

function($scope, $rootScope, $uibModal, $timeout, $location) {

    $rootScope.$emit('navChange', 'Create New Study');
    var self = this;

    $scope.studyName = '';
    $scope.videoCameras = [];
    $scope.studyType = undefined;
    $scope.classification = undefined;
    $scope.dateTime = undefined;
    $scope.report = undefined;
    $scope.attachments = [];

    $scope.possibleCameras = [1,2];
    $scope.isCollapsed = [
        {
            camera : false,
            timePeriod : [false, false, false, false]
        },
        {
            camera : false,
            timePeriod : [false, false, false, false]
        },
    ];

    var loadTime = new Date();
    var svgBaseHtml = '<rect x="3" y="3" rx="2" ry="2" fill="dodgerblue" height="18" width="18"/>';
    var loadingCircle = '<circle  class="loader-path" cx="12" cy="12" r="6" stroke="#ffffff" stroke-width="2" fill="none"></circle>';
    var plainCircle = '<circle cx="12" cy="12" r="6" stroke="#ffffff" stroke-width="2" fill="none"></circle>';
    var animatedCheck = svgBaseHtml + '<path d="M 5.705,11.295 10,15.585 18.295,7.29" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="butt"stroke-linejoin="miter" stroke-opacity="1" stroke-miterlimit="4" stroke-dasharray="17.81" stroke-dashoffset="17.81">';
                            

    $scope.$watch('attachmentSelect', function () {
        $scope.addAttachments($scope.attachmentSelect);
    });

    $scope.$watch('files', function () {
        $scope.addFiles($scope.files);
    });

    $scope.addAttachments = function(newAttachments){
        if(newAttachments && Array.isArray(newAttachments) && newAttachments.length > 0){
            angular.forEach(newAttachments, function(newAttachment, key) {
                for(var attachmentIndex = 0; attachmentIndex < $scope.attachments.length; attachmentIndex++){
                    if(newAttachment.name === $scope.attachments[attachmentIndex].name && newAttachment.size === $scope.attachments[attachmentIndex].size){
                        return;
                    }
                }
                $scope.attachments.push(newAttachment);
            }, $scope);
        }
    };

    $scope.removeAttachment = function(attachmentIndex){
        $scope.attachments.splice(attachmentIndex, 1);
    };

    $scope.addFiles = function(newFiles){
        if(newFiles && Array.isArray(newFiles) && newFiles.length > 0){
            if($scope.videoCameras.length === 0){
                $scope.videoCameras = [[[]]];
                if($scope.studyType && $scope.studyType.roadType != 'other' && $scope.studyType.cameraCount == 2){
                    $scope.videoCameras.push([[]]);
                }
                if($scope.dateTime && $scope.dateTime.timePeriods.length > 1){
                    for(var camIndex = 0; camIndex < $scope.videoCameras.length; camIndex++){
                        while($scope.videoCameras[camIndex].length < $scope.dateTime.timePeriods.length){
                            $scope.videoCameras[camIndex].push([]);
                        }
                    }
                }
            }
            
            if($scope.videoCameras.length > 1 || $scope.videoCameras[0].length > 1){
                $uibModal.open({
                    templateUrl: "/main/templates/modals/chooseCameraPeriodModal.html",
                    size: 'sm',
                    animation: false,
                    controller: 'CameraPeriodModalController',
                    controllerAs: 'ctrl',
                    resolve: {
                        camCount : function() {
                            return $scope.videoCameras.length;
                        },
                        timePeriods : function() {
                            var clonedTimePeriods;
                            if($scope.dateTime && $scope.dateTime.timePeriods.length > 1){
                                clonedTimePeriods = JSON.parse(JSON.stringify($scope.dateTime.timePeriods));
                            }
                            return clonedTimePeriods;
                        }
                    }
                }).result.then(function(result){
                    addNewFilesToCameraPeriod(result.camIndex, result.periodIndex, newFiles);
                    
                }).catch(function(result){
                    
                });
            }
            else {
                addNewFilesToCameraPeriod(0, 0, newFiles);
            }
        }
    };

    function addNewFilesToCameraPeriod(cameraIndex, periodIndex, newFiles){
        angular.forEach(newFiles, function(newFile, key) {
            if(!newFile.type.startsWith('video/')){
                return;
            }
            if(!checkNewFileForDuplicate(this.videoCameras, newFile)){
                var nameArray = newFile.name.split('.').reverse();
                nameArray.splice(0,1);

                this.videoCameras[cameraIndex][periodIndex].push({
                    name    : nameArray.reverse().join('.'),
                    size    : Math.round(newFile.size/10000)/100,
                    file    : newFile,
                    id      : undefined,
                    camera  : (cameraIndex+1),
                    timePeriod : periodIndex
                });
            }
        }, $scope);
    }

    function checkNewFileForDuplicate(cameraLists, newFile){
        for (var cameraIndex = 0; cameraIndex < cameraLists.length; cameraIndex++) {
            for (var periodIndex = 0; periodIndex < cameraLists[cameraIndex].length; periodIndex++) {
                for (var fileIndex = 0; fileIndex < cameraLists[cameraIndex][periodIndex].length; fileIndex++) {
                    if (cameraLists[cameraIndex][periodIndex][fileIndex].file.name == newFile.name && 
                        cameraLists[cameraIndex][periodIndex][fileIndex].file.size == newFile.size) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    var droppedIndex;
    $scope.dragMoved = function(cameraIndex, timePeriodIndex, fileIndex){
        if(droppedIndex !== undefined){
            if(fileIndex <= droppedIndex){
                droppedIndex--;
            }
            var file = $scope.videoCameras[cameraIndex][timePeriodIndex].splice(fileIndex, 1)[0];
            $scope.videoCameras[cameraIndex][timePeriodIndex].splice(droppedIndex, 0, file);
            droppedIndex = undefined;
        }
    };

    $scope.dropCallback = function(index, item, external, type) {
        droppedIndex = index;
        return true;
    };

    $scope.removeVideo = function(cameraIndex, timePeriodIndex, fileIndex){
        $scope.videoCameras[cameraIndex][timePeriodIndex].splice(fileIndex, 1);
    };

    self.setStudyType = function(){
        var studyTypeSvg = document.getElementById('studyTypeSvg');
        studyTypeSvg.innerHTML = svgBaseHtml + loadingCircle;
        
        $uibModal.open({
            templateUrl: "/main/templates/modals/setStudyTypeModal.html",
            size: 'lg',
            controller: 'StudyTypeModalController',
            controllerAs: 'ctrl',
            backdrop: 'static',
            resolve: {
                studyType : function() {
                    var cloned;
                    if($scope.studyType){
                        cloned = JSON.parse(JSON.stringify($scope.studyType));
                    }
                    return cloned;
                }
            }
        }).result.then(function(result){
            $scope.studyType = result;
            if($scope.videoCameras.length > 0){
                if($scope.studyType.roadType != 'other'){
                    if($scope.studyType.cameraCount < $scope.videoCameras.length){
                        for(var periodIndex = 0; periodIndex < $scope.videoCameras[0].length; periodIndex++){
                            $scope.videoCameras[0][periodIndex] = $scope.videoCameras[0][periodIndex].concat($scope.videoCameras[1][periodIndex]);
                        }
                        $scope.videoCameras.splice(1,1);
                    }
                    else if($scope.studyType.cameraCount > $scope.videoCameras.length){
                        $scope.videoCameras.push([]);
                        if($scope.dateTime){
                            while($scope.videoCameras[1].length < $scope.dateTime.timePeriods.length ){
                                $scope.videoCameras[1].push([]);
                            }
                        }
                    }
                }
                else if($scope.videoCameras.length > 1){
                    for(var timePeriodIndex = 0; timePeriodIndex < $scope.videoCameras[0].length; timePeriodIndex++){
                        $scope.videoCameras[0][timePeriodIndex] = $scope.videoCameras[0][timePeriodIndex].concat($scope.videoCameras[1][timePeriodIndex]);
                    }
                    $scope.videoCameras.splice(1,1);
                }
            }
                
            $timeout(function(){
                var beginTime = (new Date() - loadTime);
                studyTypeSvg.innerHTML = animatedCheck + '<animate attributeName="stroke-dashoffset" to="0" dur="1s" begin="'+beginTime+'ms" repeatCount="1" fill="freeze"/></path>';
            }, 2500);
        }).catch(function(result){
            if($scope.studyType){
                var beginTime = (new Date() - loadTime);
                studyTypeSvg.innerHTML = animatedCheck + '<animate attributeName="stroke-dashoffset" to="0" dur="1s" begin="'+beginTime+'ms" repeatCount="1" fill="freeze"/></path>';
            }
            else {
                studyTypeSvg.innerHTML = svgBaseHtml + plainCircle;
            }
        });
    };

    self.setClassificationDetails = function(){
        var classificationSvg = document.getElementById('classificationSvg');
        classificationSvg.innerHTML = svgBaseHtml + loadingCircle;
        
        $uibModal.open({
            templateUrl: "/main/templates/modals/setClassificationModal.html",
            size: 'lg',
            controller: 'ClassificationModalController',
            controllerAs: 'ctrl',
            backdrop: 'static',
            resolve: {
                classification : function() {
                    var cloned;
                    if($scope.classification){
                        cloned = JSON.parse(JSON.stringify($scope.classification));
                    }
                    return cloned;
                }
            }
        }).result.then(function(result){
            $scope.classification = result;
            $timeout(function(){
                var beginTime = (new Date() - loadTime);
                classificationSvg.innerHTML = animatedCheck + '<animate attributeName="stroke-dashoffset" to="0" dur="1s" begin="'+beginTime+'ms" repeatCount="1" fill="freeze"/></path>';
            }, 2500);
        }).catch(function(result){
            if($scope.classification){
                var beginTime = (new Date() - loadTime);
                classificationSvg.innerHTML = animatedCheck + '<animate attributeName="stroke-dashoffset" to="0" dur="1s" begin="'+beginTime+'ms" repeatCount="1" fill="freeze"/></path>';
            }
            else {
                classificationSvg.innerHTML = svgBaseHtml + plainCircle;
            }
        });
    };

    self.setDateAndReportDetails = function(){
        var dateReportSvg = document.getElementById('dateReportSvg');
        dateReportSvg.innerHTML = svgBaseHtml + loadingCircle;
        
        $uibModal.open({
            templateUrl: "/main/templates/modals/setDateReportModal.html",
            size: 'lg',
            controller: 'DateAndReportModalController',
            controllerAs: 'ctrl',
            backdrop: 'static',
            resolve: {
                dateTime : function() {
                    var clonedDateTime;
                    if($scope.dateTime){
                        clonedDateTime = JSON.parse(JSON.stringify($scope.dateTime));
                    }
                    return clonedDateTime;
                },
                report : function() {
                    var clonedReport;
                    if($scope.report){
                        clonedReport = JSON.parse(JSON.stringify($scope.report));
                    }
                    return clonedReport;
                },
                roadType : function(){
                    var clonedStudyType;
                    if($scope.studyType){
                        clonedStudyType = JSON.parse(JSON.stringify($scope.studyType.roadType));
                    }
                    return clonedStudyType;
                },
                classifyOption : function(){
                    var clonedClassifications;
                    if($scope.classification){
                        clonedClassifications = JSON.parse(JSON.stringify($scope.classification.option));
                    }
                    return clonedClassifications;
                },
            }
        }).result.then(function(result){
            $scope.dateTime = result.dateTime;
            $scope.report = result.report;

            for(var cameraIndex = 0; cameraIndex < $scope.videoCameras.length; cameraIndex++){
                while($scope.videoCameras[cameraIndex].length !== $scope.dateTime.timePeriods.length){
                    if($scope.videoCameras[cameraIndex].length < $scope.dateTime.timePeriods.length){
                        $scope.videoCameras[cameraIndex].push([]);
                    }else{
                        var lastPeriod = $scope.videoCameras[cameraIndex].length - 1;
                        var secondToLastPeriod = $scope.videoCameras[cameraIndex].length - 2;
                        $scope.videoCameras[cameraIndex][secondToLastPeriod] = $scope.videoCameras[cameraIndex][secondToLastPeriod].concat($scope.videoCameras[cameraIndex][lastPeriod]);
                        $scope.videoCameras[cameraIndex].splice(lastPeriod,1);
                    }
                }
            }

            $timeout(function(){
                var beginTime = (new Date() - loadTime);
                dateReportSvg.innerHTML = animatedCheck + '<animate attributeName="stroke-dashoffset" to="0" dur="1s" begin="'+beginTime+'ms" repeatCount="1" fill="freeze"/></path>';
            }, 2500);
        }).catch(function(result){
            if($scope.date && $scope.report){
                var beginTime = (new Date() - loadTime);
                dateReportSvg.innerHTML = animatedCheck + '<animate attributeName="stroke-dashoffset" to="0" dur="1s" begin="'+beginTime+'ms" repeatCount="1" fill="freeze"/></path>';
            }
            else {
                dateReportSvg.innerHTML = svgBaseHtml + plainCircle;
            }
        });
    };

    self.changedCamera = function(cameraIndex, timePeriodIndex, fileIndex){
        if((cameraIndex + 1) == $scope.videoCameras[cameraIndex][timePeriodIndex][fileIndex].camera){
            return;
        }
        var file = $scope.videoCameras[cameraIndex][timePeriodIndex].splice(fileIndex, 1)[0];
        if(!$scope.videoCameras[(file.camera-1)]){
            $scope.videoCameras[(file.camera-1)] = [[]];
            if($scope.dateTime){
                while($scope.videoCameras[(file.camera-1)].length < $scope.dateTime.timePeriods.length ){
                    $scope.videoCameras[(file.camera-1)].push([]);
                }
            }
        }
        $scope.videoCameras[(file.camera -1)][timePeriodIndex].push(file);
    };

    self.changedTimePeriod = function(cameraIndex, timePeriodIndex, fileIndex){
        if(timePeriodIndex == $scope.videoCameras[cameraIndex][timePeriodIndex][fileIndex].timePeriod){
            return;
        }
        var file = $scope.videoCameras[cameraIndex][timePeriodIndex].splice(fileIndex, 1)[0];
        $scope.videoCameras[cameraIndex][file.timePeriod].push(file);
    };

    self.submitStudy = function(){
        $uibModal.open({
            templateUrl: "/main/templates/modals/newStudySubmissionModal.html",
            controller: 'StudySubmissionModalController',
            controllerAs: 'ctrl',
            backdrop: 'static',
            resolve: {
                studyName : function() {
                    return $scope.studyName;
                },
                videoCameras : function() {
                    return $scope.videoCameras;
                },
                studyType : function() {
                    return $scope.studyType;
                },
                classification : function() {
                    return $scope.classification;
                },
                dateTime : function() {
                    return $scope.dateTime;
                },
                report : function() {
                    return $scope.report;
                },
                attachments : function() {
                    return $scope.attachments;
                }
            }
        }).result.then(function(result){
            $rootScope.$emit('navChange', 'Your Studies');
            $location.url('/');
        }).catch(function(result){
            
        });
    };
}]);






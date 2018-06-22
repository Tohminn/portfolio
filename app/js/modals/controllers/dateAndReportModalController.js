

function DateAndReportModalController ($scope, $uibModalInstance, dateTime, report, roadType, classifyOption) {
    var self = this;

    $scope.multipleTimePeriods = undefined;
    $scope.timePeriodCount = 2;

    if(!dateTime){
        dateTime = {
            studyDate           : undefined,
            timePeriods         : [{startTime : '00:00:00', endTime : '00:00:00', duration: 24}],
            comments            : ''
        };
        $scope.dateTime = dateTime;
    }
    else{
        if(dateTime.timePeriods.length > 1){
            $scope.multipleTimePeriods = true;
        }
        else {
            $scope.multipleTimePeriods = false;
        }
        $scope.timePeriodCount = dateTime.timePeriods.length;
        $scope.dateTime = dateTime;
        $scope.dateTime.studyDate = new Date(dateTime.studyDate);
    }

    if(!report){
        report = {
            sheetType               : 'Directions',
            comments                : '',
            summaryColumn           : false,
            summarySheet            : false,
        };
    }
    $scope.roadType = undefined;
    if(roadType){
        if(roadType === 'highway'){
            $scope.roadType = 'Automated Traffic Recorder';
        }
        else{
            $scope.roadType = 'Turning Movement Count';
        }
    }

    $scope.classifyOption = undefined;
    if(classifyOption){
        $scope.classifyOption = classifyOption;
    }
    
    $scope.datePickerOptions = {
        customClass : styleDaysClass,
        formatYear  : 'yyyy',
        maxDate     : new Date(),
        showWeeks   : false
    };
    $scope.dateOpened = false;
    $scope.report = report;
    $scope.blockSave = true;
    
    $scope.sheetTypes = ['Classifications', 'Directions'];
    $scope.timePeriodCounts = [2, 3, 4];

    $scope.multipleTimePeriodsChange = function(){
        if($scope.multipleTimePeriods){
            $scope.timePeriodCount = 2;
            $scope.timePeriodCountChange();
        }else{
            $scope.timePeriodCount = 1;
            $scope.timePeriodCountChange();
        }
    };

    $scope.timePeriodCountChange = function(){
        while($scope.dateTime.timePeriods.length != $scope.timePeriodCount){
            if($scope.dateTime.timePeriods.length < $scope.timePeriodCount){
                $scope.dateTime.timePeriods.push({startTime : '00:00:00', endTime : '00:00:00', duration: 24});
            }
            else if($scope.dateTime.timePeriods.length > $scope.timePeriodCount){
                $scope.dateTime.timePeriods.pop();
            }
        }
    };

    function styleDaysClass(data){
        if (data.mode === 'day') {
            var addedClasses = ''; 
            var dayToCheck = new Date(data.date).setHours(0,0,0,0);
            if($scope.dateTime.studyDate !== undefined && dayToCheck === $scope.dateTime.studyDate.setHours(0,0,0,0)){
                addedClasses += 'selectedDate';
            }
            dayToCheck = new Date(dayToCheck);
            
            if(dayToCheck.getDay() === 6 || dayToCheck.getDay() === 0){
                addedClasses += ' weekend';
            }
            return addedClasses;
        }
        return '';
    }

    $scope.$watch('dateTime', checkCanSave, true);
    $scope.$watch('report', checkCanSave, true);

    function checkCanSave(value){
        if($scope.dateTime !== undefined && $scope.report !== undefined && $scope.dateTime.studyDate !== undefined && $scope.dateTime.timePeriods.length){
            for(var tpIndex = 0; tpIndex < $scope.dateTime.timePeriods.length; tpIndex++){
                if(!$scope.dateTime.timePeriods[tpIndex].startTime || !$scope.dateTime.timePeriods[tpIndex].duration){
                    $scope.blockSave = true;
                    return;
                }
                var startSplit = $scope.dateTime.timePeriods[tpIndex].startTime.split(':');

                if(startSplit.length < 3){
                    $scope.blockSave = true;
                    return;
                }
                if(parseInt(startSplit[0]) > 23 ){
                    $scope.blockSave = true;
                    return;
                }
                if(parseInt(startSplit[1]) > 59){
                    $scope.blockSave = true;
                    return;
                }
                if(parseInt(startSplit[2]) > 59){
                    $scope.blockSave = true;
                    return;
                }
                
                if($scope.dateTime.timePeriods[tpIndex].duration <= 0){
                    $scope.blockSave = true;
                    return;
                }
            }
            $scope.blockSave = false;
            return;
        }
        $scope.blockSave = true;
    }

    $scope.save = function(){
        for(var tpIndex = 0; tpIndex < $scope.dateTime.timePeriods.length; tpIndex++){
            var startSplit = $scope.dateTime.timePeriods[tpIndex].startTime.split(':');
            var startDate = new Date($scope.dateTime.studyDate).setHours(startSplit[0], startSplit[1], startSplit[2]);
            startDate = new Date(startDate);
            startDate.setTime(startDate.getTime() + ($scope.dateTime.timePeriods[tpIndex].duration*60*60*1000));
            $scope.dateTime.timePeriods[tpIndex].endTime = ('0'+startDate.getHours()).slice(-2)+':'+('0'+startDate.getMinutes()).slice(-2)+':'+('0'+startDate.getSeconds()).slice(-2);
        }
        $uibModalInstance.close({dateTime: $scope.dateTime, report : $scope.report});
    };

    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    };
}

angular.module('app')
    .controller('DateAndReportModalController', DateAndReportModalController);
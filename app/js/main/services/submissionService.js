
function SubmissionService ($http, $q, envService, $localStorage) {
    var self = this;

    self.submitNewStudy = function (studyName, studyType, classification, dateTime, report) {
        var dfd = $q.defer();

        var studyDate = new Date(dateTime.studyDate);
        dateTime.studyDate = studyDate.getFullYear()+'-'+(studyDate.getMonth()+1)+'-'+studyDate.getDate()+' 00:00:00';

        var payload = {
            userId          : $localStorage.user.id,
            orgId           : $localStorage.user.orgId,
            name            : studyName,
            classification  : classification,
            dateTime        : dateTime,
            report          : report,
            studyDetails    : {
                roadType      : studyType.roadType,
                cameras       : studyType.cameraDetails,
                approaches    : studyType.approachDetails,
                comments      : studyType.comments,
            },
        };

        // if(studyType.roadType === 'highway'){
        //     payload.studyDetails.approaches = studyType.lanes;
        // }
        console.log(payload);

        $http.post(envService.read('daarUrl')+'/dashboard/submitNewStudy', payload)
            .then( function (response) {
                dfd.resolve(response.data);
            }).catch(function(response){
                console.log('Failed:');
                console.log(response);
                dfd.resolve(false);
            });
        return dfd.promise;
    };

}

angular.module('app')
    .service('SubmissionService', SubmissionService);
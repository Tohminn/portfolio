
function ProjectsController ($rootScope, $scope, $routeParams, $localStorage, $q, $sce, $timeout,
                             $http, envService, SessionService, $location, OverlayService, AccountService) {
    var self = this;

    this.setupController = function() {
        if (!$localStorage.projects){
            $localStorage.projects = [];
        }
        $scope.$storage = $localStorage;
        $scope.project = {
            id       : $routeParams.projectId,
            title    : '',
            about    : $sce.trustAsHtml('<p></p>'),
            download : false,
            video    : false,
            src     : ''
        };

        if ($routeParams.projectId === undefined){
            $rootScope.$emit('navChange', 'Project Examples');
        }else{
            var title = 'Project: ';
            angular.forEach($localStorage.projects, function(project, projectIndex){
                if (project.id == $routeParams.projectId){
                    $scope.project.title = project.title;
                    $rootScope.$emit('navChange', title + project.title);
                }
            });
            OverlayService.applyOverlay();
            self.getProjectDetails().then( function(response){
                if(response.result){
                    $timeout(function() {
                        $scope.project.about = $sce.trustAsHtml(response.project.about);
                        $scope.project.download = response.project.download;
                        $scope.project.video = response.project.video;
                        $scope.project.links = response.project.links;
                        if ($scope.project.video){
                            angular.forEach($scope.project.links, function(link, linkIndex){
                                $scope.project.links[linkIndex].src = envService.read('apiUrl')+$scope.project.links[linkIndex].src;
                            });
                        }
                        OverlayService.removeOverlay();
                    });
                }else{
                    $rootScope.$emit('navChange', 'Error');
                    $location.url('/error');
                }
            });
        }
    };

    this.getProjectDetails = function(){
        var dfd = $q.defer();
        $http.post(envService.read('apiUrl')+'/projects.php', {projectId: $routeParams.projectId})
        .then( function (response) {
            dfd.resolve(response.data);
        }).catch(function(response){
            console.log('Failed:');
            console.log(response);
            dfd.resolve(false);
        });
       return dfd.promise;
    };

    $scope.showProject = function(id, title){
        $rootScope.$emit('navChange', 'Project: '+title);
        $location.url('/projects/'+id);
    };

    $scope.downloadFile = function(fileName){
        $http.post(envService.read('apiUrl')+'/download.php', {fileName: fileName})
        .then( function (response){
            if (response.data.result){
                var aDoc = document.createElement('a');
                aDoc.setAttribute('href', response.data.file);
                aDoc.setAttribute('download', fileName);
                var body = document.getElementsByTagName('body')[0];
                body.appendChild(aDoc);
                aDoc.click();
            }else{
                $rootScope.$emit('navChange', 'Error');
                $location.url('/error');
            }
        });
    };

    if (SessionService.getLoginStatus()){
        SessionService.refreshToken();
        this.setupController();
    } else {
        $rootScope.$emit('navChange', 'Interactive Portfolio');
        $location.url('/');
    }

    $scope.showProjectList = function (){
        $location.url('/projects');
    };

}
angular.module('app').controller('ProjectsController', ProjectsController);

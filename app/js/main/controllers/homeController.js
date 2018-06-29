
function HomeController ($rootScope, $scope, $location, $localStorage, $timeout, $http, envService) {
    var self = this;
    
    if(!$localStorage.homePage){
        $localStorage.homePage = {};
    }
    if(!$localStorage.projects){
        $localStorage.projects = [];
    }
    $scope.$storage = $localStorage;

    $scope.navigationChange = function(route){
        var url = '/';
        var title = 'Interactive Portfolio';
        switch(route){
            case 'login':
                url = '/login';
                title = 'Log In';
                break;
        }
        $rootScope.$emit('navChange', title);
        $location.url(url);
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
}
angular.module('app').controller('HomeController', HomeController);

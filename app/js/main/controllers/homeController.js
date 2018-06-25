
function HomeController ($rootScope, $scope, $location) {
    var self = this;

    self.contact = {
        email : 'GabeVOwens@gmail.com',
        phone : '(217) 691-8664',
        website: 'http://gabeowens.com',
        linkedIn: 'https://www.linkedin.com/in/gabeowens'
    };

    self.aboutMe = {
        intro : 'This is the intro.'
    };

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


}
angular.module('app').controller('HomeController', HomeController);

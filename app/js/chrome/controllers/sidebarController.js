
function sidebarController ($rootScope, SessionService, $location, $window) {
    var sidebarCtrl = this;

    sidebarCtrl.menu = {
        home: true,
        skills: true,
        experience: true,
        education: true
    };

    sidebarCtrl.navigationChange = function (route) {
        var url = '/';
        var title = 'Interactive Portfolio';
        switch(route){
            case '/skills':
                url = '/skills';
                title = 'Skills';
                break;
            case '/experience':
                url = '/experience';
                title = 'Experience';
                break;
            case '/education':
                url = '/education';
                title = 'Education';
                break;
            case '/projects':
                url = '/projects';
                title = 'Project Examples';
                break;
        }
        $rootScope.$emit('navChange', title);
        $location.url(url);
    };
    
}



angular.module('app')
        .controller('SidebarController', sidebarController);
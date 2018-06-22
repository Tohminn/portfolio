angular.module('app', [
    'ngRoute',
    'environment',
    'ngStorage',
    'ngMap',
    'ngCookies',
    // 'ngMaterial',
    'ngAnimate',
    'ngFileUpload',
    'dndLists',
    'ui.bootstrap',
    'localytics.directives',
    'app.templates'
]).config(['envServiceProvider', '$compileProvider', function (envServiceProvider, $compileProvider) {
    // set the domains and variables for each environment 
    envServiceProvider.config({
        domains: {
            localhost: ['localhost', 'portfolio.test', 'portfolio.local'],
            production: ['gabeowens.com'],
        },
        vars: {
            localhost: {
                apiUrl: '//daar.test',
            },
            production: {
                apiUrl: 'https://daar.datadrivin.com',
            },
            defaults: {
                apiUrl: 'https://daar.datadrivin.com',
            }
        }
    });
    // run the environment check, so the comprobation is made before controllers and services are built 
    envServiceProvider.check();
    if(envServiceProvider.get() == 'production'){
        $compileProvider.debugInfoEnabled(false);
    }
    else {
        $compileProvider.debugInfoEnabled(true);
    }
}]);

angular.module('app.templates', []);

angular.module('app').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: '/main/templates/home.html'
        }).
        when('/#/', {
            templateUrl: '/main/templates/home.html'
        }).
        when('/skills', {
            templateUrl: '/main/templates/skills.html'
        }).
        when('/experience', {
            templateUrl: '/main/templates/experience.html'
        }).
        when('/education', {
            templateUrl: '/main/templates/education.html'
        }).
        when('/profile', {
            templateUrl: '/main/templates/profile.html'
        }).
        when('/error', {
            templateUrl: '/core/templates/error.html'
        }).
        when('/logout', {
            redirectTo: '/'
        }).
        otherwise({
            redirectTo: '/error'
        });
    }]);

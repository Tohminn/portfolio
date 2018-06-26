angular.module('app', [
    'ngRoute',
    'environment',
    'ngStorage',
    'ngMap',
    'ngCookies',
    'ngAnimate',
    'ngFileUpload',
    'dndLists',
    'ui.bootstrap',
    'localytics.directives',
    'app.templates'
]).config(['envServiceProvider', '$compileProvider', function (envServiceProvider, $compileProvider) {
    envServiceProvider.config({
        domains: {
            localhost: ['localhost', 'portfolio.test', 'portfolio.local'],
            production: ['gabeowens.com', 'www.gabeowens.com'],
        },
        vars: {
            localhost: {
                apiUrl: '//portfolioApi.test',
            },
            production: {
                apiUrl: 'http://api.gabeowens.com',
            },
            defaults: {
                apiUrl: 'http://api.gabeowens.com',
            }
        }
    });
    envServiceProvider.check();
    if(envServiceProvider.get() == 'production'){
        $compileProvider.debugInfoEnabled(false);
    }
    else {
        $compileProvider.debugInfoEnabled(true);
    }
}]).config(function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
    //rest of route code
});

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
        when('/#', {
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

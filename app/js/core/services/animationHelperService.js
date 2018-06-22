function AnimationService ($q, $timeout) {
    var self = this;

    AnimationService.prototype.animate = function (element, animationType, duration) {
        var dfd = $q.defer();
        console.log('Animation Started');
        element.addClass('animated '+ animationType);
        $timeout(function () {
            element.removeClass('animated '+animationType);
            dfd.resolve();
            console.log('Animation End');
        }, duration);
        return dfd.promise;
    };

    AnimationService.prototype.fade = function (element, duration) {
        AnimationService.animate(element, 'fadeOut', duration);
    };

}


angular.module('app').service('AnimationService', AnimationService);
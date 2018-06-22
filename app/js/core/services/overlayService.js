function OverlayService ($rootScope, $compile, $timeout, $q) {
    var self = this;

    var body = angular.element(document.getElementsByTagName('body'));
    var overlay = angular.element(document.getElementsByClassName('app-overlay')[0]);
    

    this.removeOverlay = function () {
        var dfd = $q.defer();
        overlay.removeClass('fade-in');
        overlay.addClass('fade-out');
        // var wrapper = angular.element(document.getElementsByClassName('wrapper')[0]);
        // wrapper.show();
        $timeout(function () {
            overlay.addClass('hidden');
            overlay.removeClass('fade-out');
            dfd.resolve();
        }, 700);
        return dfd.promise;
    };

    self.applyOverlay = function () {
        overlay.removeClass('hidden');
        overlay.addClass('fade-in');
        // sidebar.addClass('hidden');
        // var wrapper = angular.element(document.getElementsByClassName('wrapper')[0]);
        // console.log(wrapper);
        // wrapper.hide();
    };

}

angular.module('app')
    .service('OverlayService', OverlayService);

function konamiDirective ($document, $window) {
    return {
        restrict: 'A',
        link: function () {
            var kkeys = [], konami = "38,38,40,40,37,39,37,39,66,65";
            $document.bind('keyup', function (e) {
                kkeys.push( e.keyCode );
                if ( kkeys.toString().indexOf( konami ) >= 0 ) {
                    $window.location.href = 'http://koalastothemax.com/';
                }
            });
        }
    };
}

angular.module('app').directive('konamiDirective', konamiDirective);
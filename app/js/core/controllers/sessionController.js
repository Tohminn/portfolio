
function SessionController (SessionService, OverlayService, $location, $localStorage, $uibModal, $window, $timeout) {
    var self = this;
    this.logging_in = false;
    this.authenticated = SessionService.getJwtToken() || false;
    this.username = '';
    this.rememberMe = false;
    if($localStorage.rememberMeName){
        this.username = $localStorage.rememberMeName;
        this.rememberMe = true;
    }
    this.password = '';
    this.copywriteDate = new Date();
    $localStorage.user = {};
    OverlayService.applyOverlay();

    // Uses functions within Ctrl, so is called at the end
    this.checkLoggedInStatus = function(){
        if(SessionService.getJwtToken()) {
            SessionService.refreshToken().then( function () {
                
                self.authenticated = true;
                OverlayService.removeOverlay();
                if($location.url() === ''){
                    $location.url('/');
                }

            }).catch( function () {
                console.log('Not Authed because refreshtoken failed');
                self.authenticated = false;
                self.logUserOut();
                $timeout(function() {
                    var element = $window.document.getElementById('username');
                    if(element){
                        element.focus();
                    }
                });
            });
        } else {
            console.log('Not Authed because authenticated is false');
            self.logUserOut();
            self.authenticated = false;
            $timeout(function() {
                var element = $window.document.getElementById('username');
                if(element){
                    element.focus();
                }
            });
        }
    };

    this.login = function () {
        this.logging_in = true;
    };

    this.logUserIn = function () {
        if(self.username !== '' && self.password !== '' && self.username.indexOf('@') > 0 && self.username.indexOf('.') > 0){
            
            SessionService.authorizeUser(self.username, self.password)
                .then( function ( data ) {
                    OverlayService.applyOverlay();
                    self.password = '';
                    if(self.rememberMe){
                        $localStorage.rememberMeName = self.username;
                    }
                    else{
                        self.username = '';
                        if($localStorage.rememberMeName){
                            delete $localStorage.rememberMeName;
                        }
                    }
                })
                .catch( function () {
                    self.badLoginAttempt();
                });
        }
        else{
            self.badLoginAttempt();
        }
            
    };

    this.badLoginAttempt = function(){
        var loginForm = angular.element(document.querySelector('#login-form'));
        loginForm.addClass('animated shake');
        setTimeout(function () {
            loginForm.removeClass('animated shake');
        }, 700);
    };

    this.logUserOut = function () {
        SessionService.logUserOut().then( function () {
            self.authenticated = false;
            OverlayService.removeOverlay();
        });
    };

    this.forgotPassword = function () {
        $uibModal.open({
            templateUrl: "/account/templates/passwordReset.html",
            size: 'sm',
            controllerAs: 'modalCtrl',
            controller: 'ModalController',
            resolve: {
                params : function () {
                    return {};
                }
            }
        });
    };

    this.checkLoggedInStatus();
}

angular.module('app').controller('SessionController', SessionController);
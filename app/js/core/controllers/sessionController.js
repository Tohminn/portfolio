
function SessionController (SessionService, OverlayService, AccountService, $location, $localStorage, $uibModal, $window, $timeout) {
    var self = this;
    this.logging_in = false;
    this.authenticated = false;
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
        if(SessionService.getLoginStatus()) {
            SessionService.refreshToken();
            AccountService.getUserData().then( function (response) {
                $localStorage.contact = response.contact;
                $localStorage.aboutMe = response.aboutMe;
                $localStorage.references = response.references;
                $localStorage.projects = response.projects;

                self.authenticated = true;
                OverlayService.removeOverlay().then( function () {
                    if($location.url() === ''){
                        $location.url('/');
                    }
                });
            })
            .catch( function () {
                self.badLoginAttempt();
            });
            
        } else {
            self.logUserOut();
        }
    };

    this.login = function () {
        this.logging_in = true;
    };

    this.cancelLogin = function () {
        OverlayService.applyOverlay();
        this.logging_in = false;
        OverlayService.removeOverlay().then( function () {
            $location.url('/');
        });
    };

    this.logUserIn = function () {
        if(self.username !== '' && self.password !== ''){
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
                    self.authenticated = true;
                    self.logging_in = false;
                    AccountService.getUserData().then( function (response) {
                        $localStorage.contact = response.contact;
                        $localStorage.aboutMe = response.aboutMe;

                        OverlayService.removeOverlay();
                        if($location.url() === ''){
                            $location.url('/');
                        }
                    })
                    .catch( function () {
                        self.badLoginAttempt();
                    });
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
        OverlayService.applyOverlay();
        SessionService.logUserOut().then( function () {
            OverlayService.removeOverlay().then( function () {
                self.authenticated = false;
                $location.url('/');
            });
        });
    };

    this.checkLoggedInStatus();
}

angular.module('app').controller('SessionController', SessionController);
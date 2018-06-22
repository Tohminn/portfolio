

function StudyTypeModalController ($scope, $uibModalInstance, studyType, NgMap, $timeout) {
    var self = this;

    if(!studyType){
        $scope.studyType = {
            roadType : undefined,
            cameraCount : undefined,
            cameraDetails : [],
            approaches : undefined,
            approachDetails : [],
            lanes : undefined,
            comments : '',
            
        };
    }else{
        $scope.studyType = studyType;
    }

    $scope.disableSave = true;
    $scope.carDirOptions = [
        {value: 'none', text: '~ Select ~'},
        {value: 'North', text: 'North'},
        {value: 'South', text: 'South'},
        {value: 'East', text: 'East'},
        {value: 'West', text: 'West'},
        {value: 'Northeast', text: 'Northeast'},
        {value: 'Northwest', text: 'Northwest'},
        {value: 'Southeast', text: 'Southeast'},
        {value: 'Southwest', text: 'Southwest'},
    ];
    var directionsService = new google.maps.DirectionsService();
    var camMarkerList = [];
    var approachMarkerList = [];

    self.camCountChange = function(){
        if($scope.studyType.cameraCount && $scope.studyType.cameraCount != $scope.studyType.cameraDetails.length){
            if($scope.studyType.cameraCount === 1){
                if($scope.studyType.cameraDetails.length == 2){
                    $scope.studyType.cameraDetails.pop();
                    $scope.studyType.cameraDetails[0].iconSrc = 'assets/img/mapMarkers/cam_pin.png';
                    if(camMarkerList[1] !== 'marker'){
                        camMarkerList[1].setMap(null);
                        camMarkerList.pop();
                    }
                }else{
                    $scope.studyType.cameraDetails.push({lat: undefined, lng: undefined, name: '', iconSrc: 'assets/img/mapMarkers/cam_pin.png'});
                    camMarkerList.push('marker');
                }
            }else{
                if($scope.studyType.cameraDetails.length == 1){
                    $scope.studyType.cameraDetails[0].iconSrc = 'assets/img/mapMarkers/cam_1.png';

                }else{
                    $scope.studyType.cameraDetails.push({lat: undefined, lng: undefined, name: '', iconSrc: 'assets/img/mapMarkers/cam_1.png'});
                    camMarkerList.push('marker');
                }
                $scope.studyType.cameraDetails.push({lat: undefined, lng: undefined, name: '', iconSrc: 'assets/img/mapMarkers/cam_2.png'});
                camMarkerList.push('marker');
            }
        }

        if($scope.studyType.cameraCount && $scope.studyType.approaches && $scope.map !== undefined){
            $timeout(function(){
                var center = $scope.map.getCenter();
                google.maps.event.trigger($scope.map, "resize");
                $scope.map.setCenter(center);
            });
        }
    };

    self.approachChange = function(){
        if($scope.studyType.approaches && $scope.studyType.approaches != $scope.studyType.approachDetails.length){
            while($scope.studyType.approaches != $scope.studyType.approachDetails.length){
                if($scope.studyType.approaches > $scope.studyType.approachDetails.length){
                    $scope.studyType.approachDetails.push({
                        lat: undefined, lng: undefined,
                        cardDir: 'none', name: '',
                        iconSrc: 'assets/img/mapMarkers/leg_'+($scope.studyType.approachDetails.length + 1)+'.png'
                    });
                    approachMarkerList.push('marker');
                }
                else {
                    $scope.studyType.approachDetails.pop();
                    if(approachMarkerList[(approachMarkerList.length-1)] !== 'marker'){
                        approachMarkerList[(approachMarkerList.length-1)].setMap(null);
                    }
                    approachMarkerList.pop();
                }
            }
        }

        if($scope.studyType.cameraCount && $scope.studyType.approaches && $scope.map !== undefined){
            $timeout(function(){
                var center = $scope.map.getCenter();
                google.maps.event.trigger($scope.map, "resize");
                $scope.map.setCenter(center);
            });
        }
    };

    $scope.map = undefined;
    $scope.mapOverlay = undefined;
    NgMap.getMap().then(function(map) {
        $scope.map = map;
        $scope.map.setOptions({
            fullscreenControl: false,
            scrollwheel: false,
            streetViewControl: false,
            clickableIcons: false,
            rotateControl: false,
            tilt: 0,
            zoom: 4,
            center: {lat: 39.04081, lng: -94.591948},
            mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU}
        });
        $scope.mapOverlay = new google.maps.OverlayView();
        $scope.mapOverlay.draw = function() {};
        $scope.mapOverlay.setMap($scope.map);

        if($scope.studyType.cameraDetails.length > 0 && $scope.studyType.approachDetails.length > 0){
            var markerBounds = new google.maps.LatLngBounds();
            for(var camIndex = 0; camIndex < $scope.studyType.cameraDetails.length; camIndex++){
                var camLatLng = new google.maps.LatLng($scope.studyType.cameraDetails[camIndex].lat, $scope.studyType.cameraDetails[camIndex].lng);
                var marker = new google.maps.Marker({
                    position: camLatLng,
                    map: $scope.map,
                    icon: $scope.studyType.cameraDetails[camIndex].iconSrc,
                    draggable: true
                });
                marker.addListener('dragend', function(e){
                    var ll = marker.getPosition();
                    $scope.studyType.cameraDetails[camIndex].lat = ll.lat();
                    $scope.studyType.cameraDetails[camIndex].lng = ll.lng();
                });
                camMarkerList.push(marker);
                markerBounds.extend(camLatLng);
            }
            for(var appIndex = 0; appIndex < $scope.studyType.approachDetails.length; appIndex++){
                var appLatLng = new google.maps.LatLng($scope.studyType.approachDetails[appIndex].lat, $scope.studyType.approachDetails[appIndex].lng);
                var marker2 = new google.maps.Marker({
                    position: appLatLng,
                    map: $scope.map,
                    icon: $scope.studyType.approachDetails[appIndex].iconSrc,
                    draggable: true
                });
                marker2.addListener('dragend', function(e){
                    var ll = marker2.getPosition();
                    $scope.studyType.approachDetails[appIndex].lat = ll.lat();
                    $scope.studyType.approachDetails[appIndex].lng = ll.lng();
                });
                approachMarkerList.push(marker2);
                markerBounds.extend(appLatLng);
            }
            $timeout(function(){
                $scope.map.fitBounds(markerBounds);
                var center = $scope.map.getCenter();
                google.maps.event.trigger($scope.map, "resize");
                $scope.map.setCenter(center);
            });
        }
    });

    $scope.searchChanged = function() {
        var place = this.getPlace();
        $scope.map.setCenter(place.geometry.location);
        $scope.map.setZoom(17);
    };

    $scope.camDragEnded = function(camIndex, e){
        var mapDivOffset = angular.element($scope.map.getDiv()).offset();
        var point= new google.maps.Point(Math.round(e.pageX-mapDivOffset.left), Math.round(e.pageY-mapDivOffset.top));
        var location=$scope.mapOverlay.getProjection().fromContainerPixelToLatLng(point);
        $scope.studyType.cameraDetails[camIndex].lat = location.lat();
        $scope.studyType.cameraDetails[camIndex].lng = location.lng();
        var marker = new google.maps.Marker({
            position: location,
            map: $scope.map,
            icon: $scope.studyType.cameraDetails[camIndex].iconSrc,
            draggable: true
        });
        marker.addListener('dragend', function(e){
            var ll = marker.getPosition();
            $scope.studyType.cameraDetails[camIndex].lat = ll.lat();
            $scope.studyType.cameraDetails[camIndex].lng = ll.lng();
        });
        camMarkerList[camIndex] = marker;
    };

    $scope.approachDragEnded = function(appIndex, e){
        var mapDivOffset = angular.element($scope.map.getDiv()).offset();
        var point= new google.maps.Point(Math.round(e.pageX-mapDivOffset.left), Math.round(e.pageY-mapDivOffset.top));
        var location=$scope.mapOverlay.getProjection().fromContainerPixelToLatLng(point);
        $scope.studyType.approachDetails[appIndex].lat = location.lat();
        $scope.studyType.approachDetails[appIndex].lng = location.lng();
        var marker = new google.maps.Marker({
            position: location,
            map: $scope.map,
            icon: $scope.studyType.approachDetails[appIndex].iconSrc,
            draggable: true
        });
        var request = {
            origin:location,
            destination:location,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
        directionsService.route(request, function(response, status) {
            $timeout(function(){
                $scope.studyType.approachDetails[appIndex].name = response.routes[0].summary;
            });
        });
        marker.addListener('dragend', function(e){
            var ll = marker.getPosition();
            $scope.studyType.approachDetails[appIndex].lat = ll.lat();
            $scope.studyType.approachDetails[appIndex].lng = ll.lng();
        });
        approachMarkerList[appIndex] = marker;
    };

    $scope.$watch('studyType', checkCanSave, true);

    function checkCanSave(value){
        if($scope.studyType !== undefined && $scope.studyType.roadType !== undefined){
            if($scope.studyType.roadType !== 'other'){
                if($scope.studyType.cameraCount && $scope.studyType.approaches){
                    for(var camIndex = 0; camIndex < $scope.studyType.cameraDetails.length; camIndex++){
                        if($scope.studyType.cameraDetails[camIndex].lat === undefined || $scope.studyType.cameraDetails[camIndex].lng === undefined){
                            $scope.disableSave = true;
                            return;
                        }
                    }

                    for(var appIndex = 0; appIndex < $scope.studyType.approachDetails.length; appIndex++){
                        if($scope.studyType.approachDetails[appIndex].lat === undefined || $scope.studyType.approachDetails[appIndex].lng === undefined){
                            $scope.disableSave = true;
                            return;
                        }
                        if($scope.studyType.approachDetails[appIndex].name === ''){
                            $scope.disableSave = true;
                            return;
                        }
                    }
                    if($scope.studyType.roadType === 'highway' && $scope.studyType.lanes === undefined){
                        $scope.disableSave = true;
                        return;
                    }
                    $scope.disableSave = false;
                    return;
                }
            }else if($scope.studyType.comments !== ''){
                $scope.disableSave = false;
                return;
            }
        }
        $scope.disableSave = true;
    }

    $scope.save = function(){
        $uibModalInstance.close($scope.studyType);
    };

    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    };

    $scope.$on('$destroy', function(){
        for(var camIndex = 0; camIndex < camMarkerList.length; camIndex++){
            if(camMarkerList[camIndex] !== 'marker'){
                camMarkerList[camIndex].setMap(null);
            }
        }
        camMarkerList.length = 0;
        for(var appIndex = 0; appIndex < approachMarkerList.length; appIndex++){
            if(approachMarkerList[appIndex] !== 'marker'){
                approachMarkerList[appIndex].setMap(null);
            }
        }
        approachMarkerList.length = 0;
    });

}

angular.module('app')
    .controller('StudyTypeModalController', StudyTypeModalController);
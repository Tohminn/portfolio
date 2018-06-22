
function UploadService ($http, $q, envService, $localStorage, $rootScope, $timeout) {
    var self = this;

    self.evapConfig = {
        signerUrl: envService.read('daarUrl')+'/video/generatePresignedUrl',
        aws_key: 'AKIAIPMWJ62CA7FKJYAQ',
        aws_url: 'https://s3-us-west-2.amazonaws.com',
        awsRegion: 'us-west-2',
        bucket: envService.read('videoBucket'),
        maxConcurrentParts: 5,
        onlyRetryForSameFileName: true,
        logging: false,
        computeContentMd5: true,
        cryptoMd5Method: function (data) { return AWS.util.crypto.md5(data, 'base64'); },
        cryptoHexEncodedHash256: function (data) { return AWS.util.crypto.sha256(data, 'hex'); },
    };

    self.prepareEvaporate = function(){
        if(!$rootScope._evaporate){
            var dfd = $q.defer();
            Evaporate.create(self.evapConfig)
            .then(function(_evaporate){
                $rootScope._evaporate = _evaporate;
                console.log('evaporate initialized');
                dfd.resolve(true);
            })
            .catch(function(result){
                dfd.resolve(false);
            });
            return dfd.promise;
        }
    };

    self.pauseUpload = function(fileKey){
        if($rootScope._evaporate){
            var dfd = $q.defer();
            $rootScope._evaporate.pause(fileKey)
            .then(function(){
                dfd.resolve(true);
            });
            return dfd.promise;
        }
        return;
    };

    self.resumeUpload = function(fileKey){
        if($rootScope._evaporate){
            var dfd = $q.defer();
            $rootScope._evaporate.resume(fileKey)
            .then(function(){
                dfd.resolve(true);
            });
            return dfd.promise;
        }
        return;
    };

    self.cancelUpload = function(fileKey){
        if($rootScope._evaporate){
            var dfd = $q.defer();
            $rootScope._evaporate.cancel(fileKey)
            .then(function(){
                dfd.resolve(true);
            });
            return dfd.promise;
        }
        return;
    };

    self.uploadAttachments = function(studyId, attachments){
        var attachmentPromises = attachments.map(function(attachment, attachmentIndex){
            var dfd = $q.defer();
            var fileName = 'organizationStudies/'+$localStorage.user.orgId+'/'+studyId+'/attachments/'+attachment.name;
            $rootScope._evaporate.add({
                name: fileName,
                file: attachment,
            }, {})
            .then(function (awsObjectKey) {
                dfd.resolve();
            },
            function (reason) {
                console.log('Attachment did not upload sucessfully:', reason);
            });
            return dfd.promise;
        });
        return $q.all(attachmentPromises);
    };

    self.uploadVideos = function(studyId, studyName, submitDate, videoCameras){
        if(!$localStorage.uploadingStudies){
            $localStorage.uploadingStudies = [];
        }
        $localStorage.uploadingStudies.push({
            studyId : studyId,
            name : studyName,
            finalizing : false,
            completedVideos : 0,
            percentComplete : 0,
            totalSpeed : '0 Kbps',
            videoFiles : []
        });
        $localStorage.studies.push({
            id : studyId,
            name : studyName,
            submitDate : submitDate,
            status : 'uploading',
        });
        var uploadingIndex = $localStorage.uploadingStudies.length - 1;

        var camPromises = videoCameras.map(function(camera, camIndex){
            var tpPromises = camera.map(function(timePeriod, periodIndex){
                var videoPromises = timePeriod.map(function(videoFile, fileIndex){
                    videoFile.name = videoFile.name.trim();
                    videoFile.name = videoFile.name.replace(/[\/\\#,+()$~%.'":*?<>{}]/g, '');
                    videoFile.name = videoFile.name.replace(/[&]/g, 'and');
                    if (videoFile.name.indexOf(' ') > -1){
                        videoFile.name = videoFile.name.replace(/ /g, '_');
                    }
                    var dfd = $q.defer();
                    var payload = {
                        orgId : $localStorage.user.orgId,
                        name : videoFile.name+'.'+videoFile.file.name.split('.').reverse()[0],
                        fileType : videoFile.file.type,
                        size : videoFile.file.size,
                        studyId : studyId,
                        cameraIndex : camIndex,
                        timePeriodIndex : periodIndex,
                        orderIndex : fileIndex
                    };

                    $http.post(envService.read('daarUrl')+'/dashboard/insertNewStudyVideo', payload)
                    .then(function(response){
                        if(response.data.result){
                            var folderStucture = 'organizationStudies/'+$localStorage.user.orgId+'/'+studyId+'/videos/'+response.data.videoId;
                            var fileName = folderStucture+'/'+videoFile.name+'.'+videoFile.file.name.split('.').reverse()[0];
                            var fileKey = envService.read('videoBucket')+'/'+fileName;
                            $localStorage.uploadingStudies[uploadingIndex].videoFiles.push({
                                fileKey : fileKey,
                                percentage : 0,
                                speed : 0,
                                timeRemaining : '00:00',
                                complete : false,
                                failed : false
                            });

                            callback_methods = callbacks(studyId, fileKey);

                            $rootScope._evaporate.add({
                                name: fileName,
                                file: videoFile.file,
                                progress: callback_methods.progress,
                                complete: callback_methods.complete,
                                error: callback_methods.error,
                                warn: callback_methods.warn,
                                nameChanged: callback_methods.nameChanged
                            }, {})
                            .then(function (awsObjectKey) {
                                console.log('File successfully uploaded to:', awsObjectKey);
                                var studyIndex = 0;
                                if($localStorage.uploadingStudies.length > 1){
                                    for(studyIndex = 0; studyIndex < $localStorage.uploadingStudies.length; studyIndex++){
                                        if($localStorage.uploadingStudies[studyIndex].studyId == studyId){
                                            break;
                                        }
                                    }
                                }
                                console.log(fileKey);
                                var fileIndex = 0;
                                for(fileIndex = 0; fileIndex < $localStorage.uploadingStudies[studyIndex].videoFiles.length; fileIndex++){
                                    if($localStorage.uploadingStudies[studyIndex].videoFiles[fileIndex].fileKey == fileKey){
                                        break;
                                    }
                                }
                                completeVideoUpload(fileKey)
                                .then(function(result){
                                    if(result.result){
                                        console.log('Video Updated');
                                        $localStorage.uploadingStudies[studyIndex].videoFiles[fileIndex].complete = true;
                                        $localStorage.uploadingStudies[studyIndex].videoFiles[fileIndex].speed = 0;
                                        $localStorage.uploadingStudies[studyIndex].completedVideos++;
                                        var allDone = true;
                                        for(var index = 0; index < $localStorage.uploadingStudies[studyIndex].videoFiles.length; index++){
                                            if(!$localStorage.uploadingStudies[studyIndex].videoFiles[index].complete && !$localStorage.uploadingStudies[studyIndex].videoFiles[index].failed){
                                                allDone = false;
                                                break;
                                            }
                                        }
                                        if(allDone){
                                            $localStorage.uploadingStudies[studyIndex].finalizing = true;
                                            markStudyUploadComplete($localStorage.uploadingStudies[studyIndex].studyId)
                                            .then(function(result){
                                                console.log(result);
                                                $timeout(function(){
                                                    for(var studiesListIndex = 0; studiesListIndex < $localStorage.studies.length; studiesListIndex++){
                                                        if(result.studyId == $localStorage.studies[studiesListIndex].id){
                                                            $localStorage.studies[studiesListIndex].status = 'verification';
                                                            break;
                                                        }
                                                    }
                                                });
                                                $localStorage.uploadingStudies.splice(studyIndex, 1);
                                                if($localStorage.uploadingStudies.length === 0){
                                                    window.onbeforeunload = undefined;
                                                }
                                            });
                                        }
                                    }
                                    else{
                                        console.log('Video Update Error');
                                        console.log(result);
                                    }
                                });
                            },
                            function (reason) {
                                console.log('File did not upload sucessfully:', reason);
                            });
                            dfd.resolve();
                        }
                        else{
                            console.log('insertNewStudyVideo result = false || undefined');
                            console.log(response.data);
                            dfd.reject(false);
                        }
                    })
                    .catch(function(response){
                        console.log(response);
                        dfd.reject(false);
                    });
                    return dfd.promise;
                });
                return $q.all(videoPromises);
            });
            return $q.all(tpPromises);
        });
        return $q.all(camPromises);
    };

    self.startReupload = function(studyId, studyName, videoCameras){
        var uploadingIndex;
        if(!$localStorage.uploadingStudies){
            $localStorage.uploadingStudies = [];
            $localStorage.uploadingStudies.push({
                studyId : studyId,
                name : studyName,
                finalizing : false,
                completedVideos : 0,
                percentComplete : 0,
                totalSpeed : '0 Kbps',
                videoFiles : []
            });
            uploadingIndex = 0;
        }else{
            for(var studyIndex = 0; studyIndex < $localStorage.uploadingStudies.length; studyIndex++){
                if($localStorage.uploadingStudies[studyIndex].studyId == studyId){
                    uploadingIndex = studyIndex;
                    break;
                }
            }
            if(uploadingIndex === undefined){
                $localStorage.uploadingStudies.push({
                    studyId : studyId,
                    name : studyName,
                    finalizing : false,
                    completedVideos : 0,
                    percentComplete : 0,
                    totalSpeed : '0 Kbps',
                    videoFiles : []
                });
                uploadingIndex = $localStorage.uploadingStudies.length - 1;
            }
        }
        window.onbeforeunload = function(e){
            return 'At least one Study is still uploading. If you leave, the upload will fail. Are you sure you want to leave?';
        };

        var videoPromises = videoCameras.map(function(video, fileIndex){
            video.newFile.name = video.newFile.name.trim();
            video.newFile.name = video.newFile.name.replace(/[\/\\#,+()$~%.'":*?<>{}]/g, '');
            video.newFile.name = video.newFile.name.replace(/[&]/g, 'and');
            if (video.newFile.name.indexOf(' ') > -1){
                video.newFile.name = video.newFile.name.replace(/ /g, '_');
            }
            var dfd = $q.defer();
            var payload = {
                orgId : $localStorage.user.orgId,
                oldVideoId : video.oldVideoId,
                name : video.newFile.name+'.'+video.newFile.file.name.split('.').reverse()[0],
                fileType : video.newFile.file.type,
                size : video.newFile.file.size,
                studyId : studyId,
            };

            $http.post(envService.read('daarUrl')+'/dashboard/replaceStudyVideo', payload)
            .then(function(response){
                if(response.data.result){
                    video.id = response.data.videoId;
                    var folderStucture = 'organizationStudies/'+$localStorage.user.orgId+'/'+studyId+'/videos/'+response.data.videoId;
                    var fileName = folderStucture+'/'+video.newFile.name+'.'+video.newFile.file.name.split('.').reverse()[0];
                    var fileKey = envService.read('videoBucket')+'/'+fileName;
                    $localStorage.uploadingStudies[uploadingIndex].videoFiles.push({
                        fileKey : fileKey,
                        percentage : 0,
                        speed : 0,
                        timeRemaining : '00:00',
                        complete : false,
                        failed : false
                    });

                    callback_methods = callbacks(studyId, fileKey);

                    $rootScope._evaporate.add({
                        name: fileName,
                        file: video.newFile.file,
                        progress: callback_methods.progress,
                        complete: callback_methods.complete,
                        error: callback_methods.error,
                        warn: callback_methods.warn,
                        nameChanged: callback_methods.nameChanged
                    }, {})
                    .then(function (awsObjectKey) {
                        console.log('File successfully uploaded to:', awsObjectKey);
                        var studyIndex = 0;
                        if($localStorage.uploadingStudies.length > 1){
                            for(studyIndex = 0; studyIndex < $localStorage.uploadingStudies.length; studyIndex++){
                                if($localStorage.uploadingStudies[studyIndex].studyId == studyId){
                                    break;
                                }
                            }
                        }
                        console.log(fileKey);
                        var fileIndex = 0;
                        for(fileIndex = 0; fileIndex < $localStorage.uploadingStudies[studyIndex].videoFiles.length; fileIndex++){
                            if($localStorage.uploadingStudies[studyIndex].videoFiles[fileIndex].fileKey == fileKey){
                                break;
                            }
                        }
                        completeVideoUpload(fileKey)
                        .then(function(result){
                            if(result.result){
                                console.log('Video Updated');
                                $localStorage.uploadingStudies[studyIndex].videoFiles[fileIndex].complete = true;
                                $localStorage.uploadingStudies[studyIndex].videoFiles[fileIndex].speed = 0;
                                $localStorage.uploadingStudies[studyIndex].completedVideos++;
                                var allDone = true;
                                for(var index = 0; index < $localStorage.uploadingStudies[studyIndex].videoFiles.length; index++){
                                    if(!$localStorage.uploadingStudies[studyIndex].videoFiles[index].complete){
                                        allDone = false;
                                        break;
                                    }
                                }
                                if(allDone){
                                    $localStorage.uploadingStudies[studyIndex].finalizing = true;
                                    markStudyUploadComplete($localStorage.uploadingStudies[studyIndex].studyId)
                                    .then(function(result){
                                        console.log(result);
                                        $timeout(function(){
                                            for(var studiesListIndex = 0; studiesListIndex < $localStorage.studies.length; studiesListIndex++){
                                                if(result.studyId == $localStorage.studies[studiesListIndex].id){
                                                    $localStorage.studies[studiesListIndex].status = 'verification';
                                                    break;
                                                }
                                            }
                                        });
                                        $localStorage.uploadingStudies.splice(studyIndex, 1);
                                        if($localStorage.uploadingStudies.length === 0){
                                            window.onbeforeunload = undefined;
                                        }
                                    });
                                }
                            }
                            else{
                                console.log('Video Update Error');
                                console.log(result);
                            }
                        });
                    },
                    function (reason) {
                        console.log('File did not upload sucessfully:', reason);
                    });
                    dfd.resolve(video);
                }
                else{
                    console.log('insertNewStudyVideo result = false || undefined');
                    console.log(response.data);
                    dfd.reject(false);
                }
            })
            .catch(function(response){
                console.log(response);
                dfd.reject(false);
            });
            return dfd.promise;
        });
        return $q.all(videoPromises);
        
    };

    function callbacks(studyId, fileKey){
        return {
            progress: function(progressValue, data){
                var pc = Math.round(progressValue * 100);
                if(pc < 1){
                    return;
                }

                var studyIndex = 0;
                if($localStorage.uploadingStudies.length > 1){
                    for(studyIndex = 0; studyIndex < $localStorage.uploadingStudies.length; studyIndex++){
                        if($localStorage.uploadingStudies[studyIndex].studyId == studyId){
                            break;
                        }
                    }
                }else{
                    if($localStorage.uploadingStudies[studyIndex].studyId != studyId){
                        return;
                    }
                }
                
                var fileIndex;
                var othersTotalPercent = 0;
                var othersSpeed = 0;
                for(fileLoopIndex = 0; fileLoopIndex < $localStorage.uploadingStudies[studyIndex].videoFiles.length; fileLoopIndex++){
                    if($localStorage.uploadingStudies[studyIndex].videoFiles[fileLoopIndex].fileKey == fileKey){
                        fileIndex = fileLoopIndex;
                    }
                    else {
                        othersTotalPercent += $localStorage.uploadingStudies[studyIndex].videoFiles[fileLoopIndex].percentage;
                        othersSpeed += $localStorage.uploadingStudies[studyIndex].videoFiles[fileLoopIndex].speed;
                    }
                }

                if(fileIndex !== undefined){
                    var totalPer = Math.round(((othersTotalPercent+pc) / ($localStorage.uploadingStudies[studyIndex].videoFiles.length * 100))*100);
                    $timeout(function(){
                        if(totalPer >= 100){
                            $localStorage.uploadingStudies[studyIndex].finalizing = true;
                        }
                        $localStorage.uploadingStudies[studyIndex].videoFiles[fileIndex].percentage = pc;
                        $localStorage.uploadingStudies[studyIndex].percentComplete = totalPer;
                    });

                    if(data) {
                        if(data.speed){
                            $localStorage.uploadingStudies[studyIndex].videoFiles[fileIndex].speed = Math.round(data.speed);
                            var totalSpeed = othersSpeed + Math.round(data.speed);
                            $localStorage.uploadingStudies[studyIndex].speed = totalSpeed + ' Bps';
                            if(totalSpeed >= 1000){
                                $localStorage.uploadingStudies[studyIndex].speed = Math.round(totalSpeed/10)/100 + ' Kbps';
                                if(totalSpeed >= 1000000){
                                    $localStorage.uploadingStudies[studyIndex].speed = Math.round(totalSpeed/10000)/100  + ' Mbps';
                                }
                            }
                        }
                        if(data.secondsLeft){
                            var mins = Math.round(data.secondsLeft / 60);
                            if (mins < 10){
                                mins = '0'+mins;
                            }
                            var secs = Math.round(data.secondsLeft % 60);
                            if (secs < 10){
                                secs = '0'+secs;
                            }
                            $localStorage.uploadingStudies[studyIndex].videoFiles[fileIndex].timeRemaining = mins+':'+secs;
                        }
                    }
                }
                
                    
            },
            complete: function(_xhr, awsKey, stats){
                
            },
            error: function(msg){
                var studyIndex = 0;
                if($localStorage.uploadingStudies.length > 1){
                    for(studyIndex = 0; studyIndex < $localStorage.uploadingStudies.length; studyIndex++){
                        if($localStorage.uploadingStudies[studyIndex].studyId == studyId){
                            break;
                        }
                    }
                }
                var fileIndex = 0;
                for(fileIndex = 0; fileIndex < $localStorage.uploadingStudies[studyIndex].videoFiles.length; fileIndex++){
                    if($localStorage.uploadingStudies[studyIndex].videoFiles[fileIndex].fileKey == fileKey){
                        break;
                    }
                }
                console.log('File: '+fileKey);
                console.log('Error:', msg);
                $localStorage.uploadingStudies[studyIndex].videoFiles[fileIndex].failed = true;
            },
            warn: function(msg){
                console.log('File:'+fileKey);
                console.log(msg);
            },
            nameChanged: function(awsKey){
                console.log('Evaporate will use existing S3 upload for', awsKey,
                'rather than the requested object name', fileKey);
            }
        };
    }

    function completeVideoUpload(fileKey){
        var dfd = $q.defer();
        var payload = {
            videoId : fileKey.split('/')[5],
        };
        $http.post(envService.read('daarUrl')+'/dashboard/completeVideoUpload', payload)
        .then(function(response){
            dfd.resolve(response.data);
        });
        return dfd.promise;
    }

    function markStudyUploadComplete(studyId){
        var dfd = $q.defer();
        var payload = {
            studyId : studyId,
        };
        $http.post(envService.read('daarUrl')+'/dashboard/markStudyUploadComplete', payload)
        .then(function(response){
            dfd.resolve(response.data);
        });
        return dfd.promise;
    }
}

angular.module('app')
    .service('UploadService', UploadService);
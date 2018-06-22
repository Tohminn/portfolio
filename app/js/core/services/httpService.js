function HttpService ($q, $http, $log, Cache) {
    var self = this;


    self.get = function () {
        var dfd = $q.defer();
        var cache = Cache.get(url);
        if(cache) {
            cache.payload.fromCache = true;
            dfd.resolve(cache.payload);
            $log.info('Loaded from Cache');
        } else {
            dfd.resolve(get(url));
        }
        return dfd.promise;
    };

    function get(url) {
        return $http({
            method: 'GET',
            url: url
        }).then( function success(data) {
            Cache.put(url, data);
        }).catch( function failure(error) {
            console.log(error);
        });
    }

    self.post = function (url, payload) {
        var dfd = $q.defer();
        $http({
            method: 'POST',
            url: url,
            data: payload,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            }
        }).then( function success (response) {
            Cache.put(url, response);
            dfd.resolve(response);
        }).catch( function (err) {
            dfd.reject(err);
            console.log(err);
        });
        return dfd.promise;
    };
}


angular.module('app').service('HttpService', HttpService);
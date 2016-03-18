angular.module('earlShortener', [])

.controller('mainController', function($scope, $http) {

    $scope.formData = {};
    $scope.urlData = {};

    // Get all urls
    $http.get('/api/v1/urls')
        .success(function(data) {
            console.log("in success callback  app.js  mainController  get /api/v1/urls");
            console.log("data");
            console.log(data);
            $scope.urlData = data;
            console.log(data);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });


    // Create a new url
    $scope.createUrl = function(urlID) {
        $http.post('/api/v1/urls', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                $scope.urlData = data;
                console.log(data);
            })
            .error(function(error) {
                console.log('Error: ' + error);
            });
    };

    // Delete a url
    $scope.deleteUrl = function(urlID) {
        $http.delete('/api/v1/urls/' + urlID)
            .success(function(data) {
                $scope.urlData = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };


});

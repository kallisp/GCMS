'use strict';

angular.module('myApp.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', ['$scope', function($scope) {

  $scope.center = {
    lat: 40.70,
    lon: 22.17,
    zoom: 8
};


$scope.layer = {
  "source": {
    "type": "TileWMS",
    url: 'geoserver/test_liparo/wms',
    params: {'LAYERS':'test_liparo:ASTOTA', 'TILED': true, FORMAT:'image/png', STYLES:''},
    serverType: 'geoserver'
  },

}

}]);
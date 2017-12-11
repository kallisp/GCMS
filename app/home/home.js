'use strict';

angular.module('myApp.home', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/home', {
      templateUrl: 'home/home.html',
      controller: 'HomeCtrl'
    });
  }])

  .controller('HomeCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.featureURL = '';

    
    var wmsSource = new ol.source.TileWMS({
      url: 'geoserver/GCMS/wms',
      params: { 'LAYERS': 'GCMS:graves', 'TILED': true, FORMAT: 'image/png', STYLES: '' },
      serverType: 'geoserver'
    });

    var layers = [

      /*new ol.layer.Tile({
        source: new ol.source.OSM()
      }),*/

     /* new ol.layer.Tile({
      source: new ol.source.TileWMS({
           url: 'http://gis.ktimanet.gr/wms/wmsopen/wmsserver.aspx?',
           params: {'LAYERS':'test_liparo:KTBASEMAP', 'TILED': true, FORMAT:'image/png', STYLES:''},
           serverType: 'geoserver',
         })
     }),*/

     /*new ol.layer.Tile({
      preload: Infinity,
      source: new ol.source.BingMaps({
        key: 'AvBoZth-baIvkrwdU1nL9SjZ_RTWsytAN1q-4Ze5686OmkTT4Gi9Zon1VVci82cA',
        imagerySet: 'Aerial',
      })
    }),*/

     new ol.layer.Tile({
      source: wmsSource
    }),

    ];

    var view = new ol.View({
      center: ol.proj.transform([23.48, 37.59], 'EPSG:4326', 'EPSG:3857'),
      zoom: 12,
    });

    var map = new ol.Map({
      controls: ol.control.defaults().extend([
        new ol.control.ScaleLine({
          units: 'metric'
        }),
      ]),
      loadTilesWhileInteracting: true,
      layers: layers,
      target: 'map',
      view: view,
    });

    // center the map from 3857 default projection to 2100
    map.getView().setCenter(ol.proj.transform([23.48, 37.59], 'EPSG:4326', 'EPSG:3857'));

    // set the extent of the map to use in var when zooms to extent

    var extent = ol.proj.transformExtent([23.813540691981, 37.98493284104141, 23.813803222295466, 37.98522795287264], "EPSG:4326", "EPSG:3857");

    var zoomToExtentControl = new ol.control.ZoomToExtent({
      tipLabel: 'Zoom to extent',
      extent: extent,
    });

    //add controls after the map has been created
    map.addControl(zoomToExtentControl);
    var controls = map.getControls();
    var attributionControl;
    controls.forEach(function (el) {
      console.log(el instanceof ol.control.Attribution);
      if (el instanceof ol.control.Attribution) {
        attributionControl = el;
      }
    });

    //Get Feature Info Request - when click
     map.on('singleclick', function (evt) {
      document.getElementById('info').innerHTML = '';
      var viewResolution = /* @type {number} */ (view.getResolution());
      var url = wmsSource.getGetFeatureInfoUrl(
        evt.coordinate, viewResolution, 'EPSG:3857',
        { 'INFO_FORMAT': 'application/json', 'FEATURE_COUNT': 100 });
      if (url) {
        // GET / PUT / POST / DELETE 
        $http.get(url).then(function(response){
          console.log(response);
          var myData = response.data.features; // features is an array.

          if (myData.length>0){ // element at index:0 (first item) has my data
            var item = myData[0];
              // make it available to html, through $scope
            $scope.table = item.properties;
          }
        })
    }
  })

  }]);

'use strict';

angular.module('myApp.home', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/home', {
      templateUrl: 'home/home.html',
      controller: 'HomeCtrl'
    });
  }])

  .controller('HomeCtrl', ['$scope', '$compile', function ($scope, $compile) {

    $scope.featureURL = '';

    /*new ol.layer.Tile({
      source: new ol.source.OSM()
    }),*/

    // new ol.layer.Tile({
    // source: new ol.source.TileWMS({
    //       url: 'http://gis.ktimanet.gr/wms/wmsopen/wmsserver.aspx?',
    //       params: {'LAYERS':'test_liparo:KTBASEMAP', 'TILED': true, FORMAT:'image/png', STYLES:''},
    //       serverType: 'geoserver',
    //       crossOrigin:'anonymous'
    //     })
    // }),

    var wmsSource = new ol.source.TileWMS({
      url: 'geoserver/test_liparo/wms',
      params: { 'LAYERS': 'test_liparo:ASTOTA', 'TILED': true, FORMAT: 'image/png', STYLES: '' },
      serverType: 'geoserver',
      crossOrigin: 'anonymous'
    })

    var layers = [
      new ol.layer.Tile({
        source: wmsSource
      }),
    ];
    var view = new ol.View({
      center: ol.proj.transform([346101, 4508000], 'EPSG:2100', 'EPSG:3857'),
      zoom: 12,
    });

    var map = new ol.Map({
      controls: ol.control.defaults().extend([
        new ol.control.ScaleLine({
          units: 'metric'
        }),
      ]),

      layers: layers,
      target: 'map',
      view: view,
    });

    // center the map from 3857 default projection to WGS84 - 2100
    map.getView().setCenter(ol.proj.transform([346101, 4508000], 'EPSG:2100', 'EPSG:3857'));

    // set the extent of the map to use in var when zooms to extent

    var extent = ol.proj.transformExtent([340000, 4504010, 353000, 4514000], "EPSG:2100", "EPSG:3857");

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

    map.on('click', function (evt) {
      var viewResolution = /** @type {number} */ (view.getResolution());
      var url = wmsSource.getGetFeatureInfoUrl(
        evt.coordinate, viewResolution, 'EPSG:3857',
        { 'INFO_FORMAT': 'text/html' });

        $scope.$apply(function(){
        
          $scope.featureURL = url;
          
        })
        
      // map.forEachFeatureAtPixel(evt.pixel, function(layer){ 
      //     if(layer==='ASTOTA') {
      //         console.log('layer clicked');
      //     } 
      // });
    });

  }]);
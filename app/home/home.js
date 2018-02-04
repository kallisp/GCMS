'use strict';

angular.module('myApp.home', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/home', {
      templateUrl: 'home/home.html',
      controller: 'HomeCtrl'
    });
  }])

  .controller('HomeCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.sidebarSearchOpen = false;
    $scope.sidebarEditOpen = false;
    $scope.results = [];
    $scope.searchError = false;  //error when nothing is typed in search filter
    $scope.sidebarSearchResultsOpen = false;
    $scope.whenMaponClick = true;


    // vars for ng-model in html
    $scope.name = null;
    $scope.surname = null;
    $scope.diadromos = null;
    $scope.thesi = null;
    $scope.category = null;
    $scope.availability = null;

    $scope.thematicMap = "CategoryMap";
    $scope.basemap = "OSM";

    $scope.toggleSearch = function () {
      $scope.sidebarSearchOpen = !$scope.sidebarSearchOpen;
      $scope.sidebarEditOpen = false;
      $scope.table = null;
      $scope.searchError = false;
      $scope.sidebarSearchResultsOpen = false;
      $scope.whenMaponClick = false;
    }

    $scope.returntoSearch = function () {
      $scope.sidebarSearchOpen = true;
      $scope.sidebarSearchResultsOpen = false;
      $scope.sidebarEditOpen = false;
      $scope.table = null;
    }

    $scope.toggleEdit = function () {
      $scope.sidebarEditOpen = !$scope.sidebarEditOpen;
      $scope.sidebarSearchOpen = false;
    }

    $scope.closeSidebar = function () {
      $scope.table = !$scope.table;
      $scope.sidebarSearchResultsOpen = true;
    }

    $scope.closeEditSidebar = function () {
      $scope.sidebarEditOpen = !$scope.sidebarEditOpen;
    }

    $scope.showListResults = function (r) {
      $scope.sidebarSearchOpen = false;
      $scope.table = r;  //r is row from ng-repeat - returns table (response.data.features) for each row of results
      $scope.sidebarSearchResultsOpen = false;
    }

    $scope.searchFilter = function () {

      $scope.searchError = false;

      var filter = ol.format.ogc.filter;

      var filters = [];

      var dynamicFilter = null;

      if ($scope.name) {
        filters.push(filter.like('name', $scope.name.toUpperCase() + '*'))  //push is append for angular
      }

      if ($scope.surname) {
        filters.push(filter.like('surname', $scope.surname.toUpperCase() + '*'))
      }

      if ($scope.diadromos) {
        filters.push(filter.equalTo('diadromos', $scope.diadromos))
      }

      if (filters.length == 2) {
        dynamicFilter = filter.or(
          filters[0], filters[1]
        )
      }
      else if (filters.length == 3) {
        dynamicFilter = filter.οr(
          filters[0], filters[1], filters[2]
        )
      }
      else {
        dynamicFilter = filters[0];
      }

      if (dynamicFilter == undefined) {
        return $scope.searchError = true; // return exits function - για να μην επιστρεψει πχ κενα αποτελεσματα
        // return alert('Παρακαλω προσθεστε τουλαχιστον 1 φιλτρο αναζήτησης');
      }

      var featureRequest = new ol.format.WFS().writeGetFeature({
        srsName: 'EPSG:3857',
        featureNS: 'geoserver',
        featurePrefix: 'GCMS',
        featureTypes: ['persons_graves'],
        outputFormat: 'application/json',
        filter: dynamicFilter,
      });

      var bodySearch = new XMLSerializer().serializeToString(featureRequest);

      $http.post('geoserver/GCMS/wms', bodySearch).then(function (response) {  //http://localhost:8080/geoserver/GCMS/wms
        console.log(response);
        $scope.results = response.data.features
        $scope.sidebarSearchResultsOpen = true;
      }, function (err) {
        console.warn(err);
      })
    }

    var gmloptions = new ol.format.GML({
      featureNS: 'geoserver',  //'http://localhost:8080/geoserver',
      featureType: 'persons_graves',
      srsName: 'EPSG:3857'
    });

    // need to give WRITE access to workspace in Geoserver (Security-Data) to enable the update action
    $scope.editFeatures = function (action, table) {
      if (action == 'update') {
        var feature = new ol.Feature(table.properties)
        feature.setId(table.id);
        var node = new ol.format.WFS().writeTransaction(null, [feature], null, gmloptions);
      }
      var bodyEdit = new XMLSerializer().serializeToString(node);

      $http.post('geoserver/GCMS/wms', bodyEdit).then(function (response) {
        console.log(response);
      },
        function (err) {
          console.warn(err);
        }
      )
    }

    $scope.changeThematicMap = function () {
      if ($scope.thematicMap == "AvailabilityMap")
        AvailabilityMapLayer.setVisible(true);
      else
        AvailabilityMapLayer.setVisible(false);
    }

    // $scope.changeBasemap = function () {
    //   if ($scope.basemap  == "GoogleMap")
    //     googleLayer.setVisible(true);
    //   else
    //     googleLayer.setVisible(false);
    // }

    var OSMLayer = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    // var googleLayer = new olgm.layer.Google({
    //   mapTypeId: google.maps.MapTypeId.SATELLITE
    // });

    /* new ol.layer.Tile({
     source: new ol.source.TileWMS({
          url: 'http://gis.ktimanet.gr/wms/wmsopen/wmsserver.aspx?',
          params: {'LAYERS':'test_liparo:KTBASEMAP', 'TILED': true, FORMAT:'image/png', STYLES:''},
          serverType: 'geoserver',
        })
    }),*/
    var wmsSource = new ol.source.TileWMS({
      url: 'geoserver/GCMS/wms',
      params: { 'LAYERS': 'GCMS:graves', 'VERSION': '1.1.1', 'TILED': true, FORMAT: 'image/png', STYLES: '' },
      serverType: 'geoserver'
    });

    var wmsSource_personsGraves = new ol.source.TileWMS({
      url: 'geoserver/GCMS/wms',
      params: { 'LAYERS': 'GCMS:persons_graves', 'VERSION': '1.1.1', 'TILED': true, FORMAT: 'image/png', STYLES: '' },
      serverType: 'geoserver'
    });

    var gravesLayer = new ol.layer.Tile({
      source: wmsSource
    });

    var personsGravesLayer = new ol.layer.Tile({
      source: wmsSource_personsGraves
    });

    var AvailabilityMapLayer = new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: 'geoserver/GCMS/wms',
        params: { 'LAYERS': 'GCMS:graves2', 'VERSION': '1.1.1', 'TILED': true, FORMAT: 'image/png', STYLES: '' },
        serverType: 'geoserver'
      })
    });

    var view = new ol.View({
      center: ol.proj.transform([23.813740691981, 37.985084104141], 'EPSG:4326', 'EPSG:3857'),
      zoom: 20,
    });

    //we need a get function to read json file from server - in geoserver we preview the layer with WFS GeoJSON
    $http.get('geoserver/GCMS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GCMS:persons_graves&maxFeatures=100&outputFormat=application%2Fjson').then(function (response) {

      var vectorSource = new ol.source.Vector({
        //we declare the json object in readFeatures - from the response we want only the data array of the object (response)
        features: (new ol.format.GeoJSON()).readFeatures(response.data, {
          dataProjection: 'EPSG:2100', // the current projection
          featureProjection: 'EPSG:3857'// the default projection map uses 
        })
      });

      var gravesVector = new ol.layer.Vector({
        source: vectorSource,
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#000000',
            width: 1
          })
        })
      });

      var map = new ol.Map({
        controls: ol.control.defaults().extend([
          new ol.control.ScaleLine({
            units: 'metric'
          }),
        ]),
        //interactions: olgm.interaction.defaults(),
        loadTilesWhileInteracting: true,
        layers: [OSMLayer, gravesLayer, AvailabilityMapLayer, gravesVector],
        target: 'map',
        view: view,
      })

      AvailabilityMapLayer.setVisible(false);

      // var olGM = new olgm.OLGoogleMaps({map: map}); // map is the ol.Map instance
      // olGM.activate();

      //googleLayer.setVisible(false);

      // center the map from 4326 to default projection 3857
      map.getView().setCenter(ol.proj.transform([23.813740691981, 37.985084104141], 'EPSG:4326', 'EPSG:3857'));

      // set the extent of the map to use in var when zooms to extent

      var extent = ol.proj.transformExtent([23.813540691981, 37.98493284104141, 23.813803222295466, 37.98522795287264], "EPSG:4326", "EPSG:3857");

      var zoomToExtentControl = new ol.control.ZoomToExtent({
        tipLabel: 'Zoom to extent',
        extent: extent,
        className: 'ol-zoom-extent'
      });

      /*var ZoomSlider = new ol.control.ZoomSlider({
        className: 'ol-zoom-slider'
      });*/

      //add controls after the map has been created
      map.addControl(zoomToExtentControl);
      // map.addControl(ZoomSlider);

      //Get Feature Info Request - when click
      map.on('singleclick', function (evt) {
        $scope.whenMaponClick = true;
        var viewResolution = /* @type {number} */ (view.getResolution());
        var url = wmsSource_personsGraves.getGetFeatureInfoUrl(
          evt.coordinate, viewResolution, 'EPSG:3857',
          { 'INFO_FORMAT': 'application/json', 'FEATURE_COUNT': 150 });

        if (url) {
          // GET / PUT / POST / DELETE 

          $http.get(url).then(function (response) {
            console.log(response);
            if (response.data.features.length > 0) { // element at index:0 (first item) has my data
              $scope.results = response.data.features; // features is an array and the properties (where results are stored) is its property
              $scope.sidebarSearchResultsOpen = true;
              // make it available to html, through $scope
            }
            else {
              $scope.sidebarSearchResultsOpen = false;
              $scope.sidebarSearchOpen = false;
            }
          }, function (err) {
            console.log(err);

          })
        }
      })

      // higlight features when selected with click - select interaction working on "click"

      var selectSingleClick = new ol.interaction.Select({
        condition: ol.events.condition.singleClick,
        layers: [gravesVector],
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({ color: '#ffff80', width: 5 }),
          fill: new ol.style.Fill({ color: [255, 255, 0, 0.9] })
        })
      });

      map.addInteraction(selectSingleClick);
    });
  }]);


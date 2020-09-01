  var geojson;
  var TTI, cnty;
  var hoveredStateId = null;
  $('#aboutModal').modal('show');
     // Target the span elements used in the sidebar
  var magDisplay = document.getElementById('mag');
  var locDisplay = document.getElementById('loc');
 $(document).on("mouseover", ".feature-row", function(e) {
  // alert("Hello! I am an alert box!!");
   //     highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
    });

//$(document).on("mouseout", ".feature-row", clearHighlight);

        function signhoverIN (e) {
        //   var active = document.getElementsByTagName(e);
        //  document.getElementById("img").src = img.src.replace("_t", "_b");
        var sign = e ;
        //    document.getElementsById(e).className += "fancy";
        document.getElementById(sign).className += " fancy";
        console.log(e);
        // document.getElementsByTagName(e).className += "fancy";
        }

        function signhoverOUT () {
        }

  mapboxgl.accessToken = 'pk.eyJ1IjoiY3J2YW5wb2xsYXJkIiwiYSI6ImNqMHdvdnd5MTAwMWEycXBocm4zbXVjZm8ifQ.3zjbFccILu6mL7cOTtp40A';

  // This adds the map
    var map = new mapboxgl.Map({
        container: 'map', 
       style: 'mapbox://styles/mapbox/light-v9', 
       // also uncomment line 168 admin-bg
    //    style:'mapbox://styles/crvanpollard/ck5fpyqti0v971itf7edp2eyd',
        center: [-75.4, 40.15], 
        zoom: 8,
      //  bearing: 0, // Rotate Philly ~9° off of north, thanks Billy Penn.
      //  pitch: 20,
      
        attributionControl: false
    });

    function goHome() {
      // debugger
      if (map.loaded()) {
        var p = map.getPitch();
     //   console.log(p);
        if (p > 0) {
          map.flyTo({
            center: [-75.4, 40.15], 
            zoom: 8,
            speed: 0.1,
          });
        }
      }
    }
    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl(),['top-right']);
    map.addControl(new mapboxgl.AttributionControl(),'bottom-right');

    // Zoom to Extent
    document.getElementById('zoomtoregion').addEventListener('click', function () {
        map.flyTo({
            center: [-75.4, 40.15], 
            zoom: 8,
            speed: 0.5
        });
    });

map.on('load', function () {
           var layers = map.getStyle().layers;
            // Find the index of the first symbol layer in the map style
            var firstSymbolId;
            for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
            }
            }
            // Grey Mask
            map.addLayer({
              "id": "county2",
              "type": "fill",
              "source": {
                  type: 'vector',
                  url: 'https://tiles.dvrpc.org/data/dvrpc-municipal.json'
              },
              "source-layer": "county",
              "layout": {},
              paint: {
              // 'fill-outline-color': '#f7c59f',
               'fill-color': 'rgba(0,0,0,0.1)'
              },
              "filter": 
              //["==","dvrpc","Yes"]
              ["all",["!=","name","Chester"],["!=","name","Bucks"],["!=","name","Delaware"],["!=","name","Montgomery"],["!=","name","Philadelphia"]]
            });

            map.addSource('cnty', {
            'type': 'geojson',
               'data':"https://arcgis.dvrpc.org/portal/rest/services/Boundaries/CountyBoundaries/FeatureServer/0/query?where=co_name+%3D+%27Bucks%27+or+co_name+%3D+%27Chester%27+or+co_name+%3D+%27Delaware%27+or+co_name+%3D+%27Montgomery%27+or+co_name+%3D+%27Philadelphia%27&outFields=*&returnGeometry=true&geometryPrecision=8&outSR=4326&f=geojson"
            });
             
            // The feature-state dependent fill-opacity expression will render the hover effect
            // when a feature's hover state is set to true.
            map.addLayer({
            'id': 'cnty-fills',
            'type': 'line',
            'source': 'cnty',
            'layout': {},
            'paint': {
            'line-color': '#898989'
            }
            });

        // When a click event occurs on a feature in the cnty layer, open a popup at the
        // location of the click, with description HTML from its properties.
    /*   map.on('click', 'cnty-fills', function(e) {
        new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(e.features[0].properties.co_name)
        .addTo(map);

         map.flyTo({
            center: (e.lngLat),
            speed: 0.5,
            zoom: 9
                });
           
        });
  */

        // When the map loads, add the data from the USGS earthquake API as a source
        map.addSource('earthquakes', {
          'type': 'geojson',
          'data': 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/IDRuM/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&geometryPrecision=8&outSR=4326&f=pgeojson',
          'generateId': true // This ensures that all features have unique IDs
        });
        
        map.addSource('route', {
          'type': 'geojson',
          'data':" https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/IDRuM/FeatureServer/3/query?where=1%3D1&outFields=*&returnGeometry=true&geometryPrecision=8&outSR=4326&f=pgeojson",
          'generateId': true // This ensures that all features have unique IDs
        });

        map.addLayer({
          id: "route-viz",
          type: "line",
          source: 'route',
          layout: {
         //     "visibility":"none",
              "line-join": "round",
              "line-cap": "round"
          },
          paint: {
             "line-color": [ 'case',
            ['boolean', ['feature-state', 'hover'], false],
             '#FFFF00', '#FFA500'
            ],
             "line-width": [ 'case',
            ['boolean', ['feature-state', 'hover'], false],
             5, 3
            ]
          }
          //  firstSymbolId
        });
       //  }
// }, 'admin-1-boundary-bg');

         map.on("click", function(e) {
          var features = map.queryRenderedFeatures(e.point, { layers: ["route-viz"] });
          if (features.length) {
            window.open('https://www.dvrpc.org/asp/idrum/Online/PDF/PA/PADist06/' + features[0].properties.CNTY +'/'+ features[0].properties.State + features[0].properties.County + features[0].properties.Route +'/'+ features[0].properties.Det_ID +'.pdf', '_blank');
             }
        });

        // Add earthquakes as a layer and style it
        map.addLayer({
          'id': 'earthquakes-viz',
          'type': 'circle',
          'source': 'earthquakes',
          'paint': {
            // The feature-state dependent circle-radius expression will render
            // the radius size according to its magnitude when
            // a feature's hover state is set to true
            'circle-radius': 3,
            'circle-stroke-color': '#ffdb99',
            'circle-stroke-width': .3,
            // The feature-state dependent circle-color expression will render
            // the color according to its magnitude when
            // a feature's hover state is set to true
            'circle-color':'#ff4500'
          }
        });

        map.addLayer({
          "id": "clusters-label",
          "type": "symbol",
          "source": "earthquakes",
          "layout": {
            "text-field": "{Location}",
            "text-font": ["Montserrat SemiBold", "Open Sans Semibold"],
            "text-size": 10,
            "text-anchor": "left",
            "text-offset":[1,0]
        //    "text-size": ["interpolate", ["linear"], ["zoom"], 8, 8, 12, 12]
          },
           "paint": {
                "text-color": "#ff7440",
                "text-halo-color":"#fff",
                "text-halo-width": 2,
                "text-halo-blur": 3
              }
        });

        var quakeID = null;

        map.on('mousemove', 'route-viz', e => {
          map.getCanvas().style.cursor = 'pointer';
          // Set variables equal to the current feature's magnitude, location, and time
         // var quakeMagnitude = e.features[0].properties.Route;
    //     var quakeMagnitude = '<img style="height:35px;width:35px" src="assets/img/shields/'+ e.features[0].properties.Route +'.png"/>';
     //     var quakeLocation = e.features[0].properties.Location ;
          
          
      //    var quakeDate = new Date(e.features[0].properties.time);

          if (e.features.length > 0) {

            var content = '<img src="assets/img/shields/'+ e.features[0].properties.Route +'.png"/>'+ e.features[0].properties.Location;
            // Display the magnitude, location, and time in the sidebar
            magDisplay.innerHTML = content;
         //   locDisplay.textContent = quakeLocation;

       //     dateDisplay.textContent = quakeDate;

            // When the mouse moves over the earthquakes-viz layer, update the
            // feature state for the feature under the mouse
            if (quakeID) {
              map.removeFeatureState({
                source: 'route',
                id: quakeID
              });
            }

            quakeID = e.features[0].id;
         
         //   signhoverIN (e.features[0].properties.Route);
        
            map.setFeatureState(
              {
                source: 'route',
                id: quakeID
              },
              {
                hover: true
              }
            );
          }
        });

        // When the mouse leaves the earthquakes-viz layer, update the
        // feature state of the previously hovered feature
        map.on('mouseleave', 'route-viz', function() {
          if (quakeID) {
            map.setFeatureState(
              {
                source: 'route',
                id: quakeID
              },
              {
                hover: false
              }
            );
          }
          quakeID = null;
   
          // Remove the information from the previously hovered feature from the sidebar
          magDisplay.innerHTML = '';
          // Reset the cursor style
          map.getCanvas().style.cursor = '';
        });



                
    });



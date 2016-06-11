window.onload=function() {
  var KEY = "bi9S3lJX0mZthOJrwFkdamXSaLDWNM18"

  var get_directions = document.getElementById('get_directions')
  var get_advanced_options = document.getElementById('get_advanced_options')

  get_directions.addEventListener('click', function(e) {
    e.preventDefault();
    report();
  });

  get_advanced_options.addEventListener('click', function(e) {
    e.preventDefault();

    if (get_advanced_options.textContent == "See advanced options") {
      document.getElementById('advanced_options').classList.remove('hidden')
      get_advanced_options.textContent = "Hide advanced options"
    } else {
      document.getElementById('advanced_options').classList.add('hidden')
      get_advanced_options.textContent = "See advanced options"
    }
  });

  latLng = geodecode("Princeton");
  get_linkid(latLng);
  get_calamity_locations(process_calamities);

  function geodecode(location) {
    //
    //
    // Return:
    //     (lat, lng) array
    //
    var lat = 0.
      var lng = 0.
      var r = $.ajax({url: "http://www.mapquestapi.com/geocoding/v1/address",
                     data: {"key": KEY, "inFormat": "json",
                       "outFormat": "json",
                       "location" : location },
                       success: function(r) {
                         lat = r.results[0].locations[0].latLng.lat;
                         lng = r.results[0].locations[0].latLng.lng;
                       },
                       async: false
    });

    console.log(lat);
    console.log(lng);
    return [lat, lng];
  }

  function get_linkid(lat_lng) {
    //
    // Linkid identifies roadsegment for a given geo pt.
    //
    // Return:
    //     int: MapQuest linkid

    var lat = lat_lng[0];
    var lng = lat_lng[1];
    var linkId = 0;

    $.ajax({url: "http://www.mapquestapi.com/directions/v2/findlinkid",
           data: {"key": KEY, "lat": lat, "lng": lng},
           success: function(r) {
             linkId = r.linkId
           },
           async: false
    });

    console.log(linkId);
    return linkId;
  }

  function get_directions(locations, avoid) {

  }


  function get_calamity_locations(callback) {
    var calamities = ["Pothole", "Tree Down - Storm Related"]

    var result=[];

    var latLng = geodecode("Princeton, NJ");

    lat = latLng[0];
    lng = latLng[1];

    $.ajax({url: "http://seeclickfix.com/open311/v2/requests.json",
           data: { "lat": lat, "long" : lng },
           dataType: "jsonp",
           async: false,
           success: function(r) {
             callback(r);
           }
    })
  }

  function process_calamities(calamities) {

    // var potholes = calamities.filter(active_potholes);
    // var trees = calamities.filter(active_trees);

    // for (var i=0; i<potholes.length; ++i) {
    // 	console.log(potholes[i])
    // }

    // for (var i=0; i<trees.length; ++i) {
    // 	console.log(trees[i])
    // }

    for (var i=0; i<calamities.length; i++) {
      console.log(i, calamities[i].service_type);
      console.log(i, calamities[i].status);
    }
  }

  function active_potholes(elt) {
  };
}

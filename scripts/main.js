var KEY = "bi9S3lJX0mZthOJrwFkdamXSaLDWNM18"
var INC = 0.005 // spacing of pts along route before checking for new place_url
                // increasing this will speed things up, but might mean that some calamities are missed.
var MAP; // global map, since I don't know how else to share it
var MAX_LOCS = 3; // This sets the number of places near each pt to look at for calamities.
                  // Decrease this to 1 to speed things up.

// var PLACE_URLS=[];
// var COUNTER = 0;

window.onload = function() {

    draw_map();

    var get_directions = document.getElementById('get_directions')
    // var get_advanced_options = document.getElementById('get_advanced_options')

    get_directions.addEventListener('click', function(e) {
	MAP.removeAllShapes();
	e.preventDefault();
	find_route();
    });

    // get_advanced_options.addEventListener('click', function(e) {
    // 	e.preventDefault();

    // 	if (get_advanced_options.textContent == "See advanced options") {
    // 	    document.getElementById('advanced_options').classList.remove('hidden')
    // 	    get_advanced_options.textContent = "Hide advanced options"
    // 	} else {
    // 	    document.getElementById('advanced_options').classList.add('hidden')
    // 	    get_advanced_options.textContent = "See advanced options"
    // 	}
    // });
}

function report() {
    var startLocation = document.getElementById("startLocation").value;
    var endLocation = document.getElementById("endLocation").value;

    console.log(startLocation);
    console.log(endLocation);    
};


function draw_map () {

    latLng = geodecode("Princeton, NJ");
    lat = latLng[0];
    lng = latLng[1];
    
    var mapOptions = {
	elt: document.getElementById("map"),
	zoom: 10,                                  // initial zoom level of the map
	latLng: { lat: lat, lng: lng },  // center of map in latitude/longitude
	mtype: 'map',                              // map type (map, sat, hyb); defaults to map
	bestFitMargin: 0,                          // margin offset from map viewport when applying a bestfit on shapes
	zoomOnDoubleClick: true                    // enable map to be zoomed in when double-clicking
    }
    
    MAP = new MQA.TileMap(mapOptions);

    MQA.withModule('largezoom', 'traffictoggle', 'viewoptions', 'geolocationcontrol', 'insetmapcontrol', 'mousewheel', function() {
	
	// add the Large Zoom control
	MAP.addControl(
	    new MQA.LargeZoom(),
	    new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(5,5))
	);
	
	// add the Traffic toggle button
	MAP.addControl(new MQA.TrafficToggle());
	
	// add the Map/Satellite toggle button
	MAP.addControl(new MQA.ViewOptions());
	
	// add the Geolocation button
	MAP.addControl(
	    new MQA.GeolocationControl(),
	    new MQA.MapCornerPlacement(MQA.MapCorner.TOP_RIGHT, new MQA.Size(10,50))
	);
    });
}


function find_route() {
    var from = document.getElementById("startLocation").value;
    var to = document.getElementById("endLocation").value;

    var notAvoidCalamities = document.getElementById("notAvoidCalamities").checked;
    var notDisplayCalamities = document.getElementById("notDisplayCalamities").checked;

    console.log("checked", notAvoidCalamities);

    // route = get_directions(from, to, []);
    get_directions_async(from, to, [],
			 function(route) {
			         shapePts = route.route.shape.shapePoints;

			     if (notAvoidCalamities) {
				 console.log(shapePts);
				 
				 display_route(from, to, shapePts);
				 displayNarrative(route);
				 
				 if (!notDisplayCalamities) {
				     var all_issues = get_all_calamities(shapePts);
				 }
			     }
			     else {
				 spacedPts = get_spaced_pts(shapePts);
				 place_urls = get_place_urls(spacedPts);
				 unique_place_urls = uniquify(place_urls);
				 
				 for (var i=0; i<unique_place_urls.length; ++i)
				     console.log(i, unique_place_urls[i]);
				 
				 var all_issues = get_all_calamities(shapePts)
				 
				 linkIds = []
				 for (var i=0; i<all_issues.length; ++i) {
				     console.log("Link", all_issues[i].lat, all_issues[i].lng);
				     linkIds.push(get_linkid(all_issues[i].lat, all_issues[i].lng));
				 }
				 get_directions_async(from, to, linkIds,
						      function(route) {
							  displayNarrative(route);
							  
							  console.log("route", route);
							  console.log("route", route.route);
							  console.log("route", route.route.shape);
							  
							  newShapePts = route.route.shape.shapePoints;
							  display_route(from, to, newShapePts);


						      }
						     );
			     }

			     
			 }
			);
}


function get_all_calamities(shapePts) {
    spacedPts = get_spaced_pts(shapePts);
    place_urls = get_place_urls(spacedPts);
    unique_place_urls = uniquify(place_urls);
    
    for (var i=0; i<unique_place_urls.length; ++i)
	console.log(i, unique_place_urls[i]);
    
    var all_issues = [];
    
    for (var i=0; i<unique_place_urls.length; ++i) {
	var issues = get_calamity_in_place(unique_place_urls[i]);
	console.log(unique_place_urls[i]);
	issues = issues.filter(active_issues);
	display_calamities(issues);
	
	all_issues = all_issues.concat(issues);
    }
    
    for (var i=0; i<all_issues.length; ++i)
	console.log(i, all_issues[i], all_issues[i].lat, all_issues[i].lng);

    return all_issues;
}


// console.log("shapePts", shapePts.length);

// spacedPts = get_spaced_pts(shapePts);

// place_urls = get_place_urls(spacedPts);
// unique_place_urls = uniquify(place_urls);
// for (var i=0; i<unique_place_urls.length; ++i)
//     console.log(i, unique_place_urls[i]);


// var all_issues = [];
// for (var i=0; i<unique_place_urls.length; ++i) 
//     all_issues = all_issues.concat(get_calamity_in_place(unique_place_urls[i]));

// all_issues = all_issues.filter(active_issues);

// for (var i=0; i<all_issues.length; ++i)
//     console.log(i, all_issues[i], all_issues[i].lat, all_issues[i].lng);

// display_calamities(all_issues);

// linkIds = []
// for (var i=0; i<all_issues.length; ++i)
//     linkIds.push(get_linkid(all_issues[i].lat, all_issues[i].lng));

// console.log("LinkIDS");
// for (var i=0; i<linkIds.length; ++i)
//     console.log(i, linkIds[i]);

function get_place_urls2(spacedPts) {
    
    spacedLats = spacedPts[0];
    spacedLngs = spacedPts[1];

    $.ajax({url: "https://seeclickfix.com/api/v2/places",
	    dataType: "json",
	    data: { lat: spacedLats[COUNTER],
		    lng: spacedLngs[COUNTER] },

	    success: function(r) {
		result = r;
		PLACE_URLS.push(result.places[0].url_name);
		++COUNTER;

		console.log("success", COUNTER, PLACE_URLS.length);
		if (COUNTER < spacedLats.length)
		    get_place_urls2(spacedPts);	
	    }
	   });
}

function get_place_urls(spacedPts) {

    spacedLats = spacedPts[0];
    spacedLngs = spacedPts[1];

    place_urls = [];
    for (var i=0; i<spacedLats.length; ++i) {
	
	var result;
	$.ajax({url: "https://seeclickfix.com/api/v2/places",
		dataType: "json",
		data: { lat: spacedLats[i],
			lng: spacedLngs[i] },
		async: false,
		success: function(r) {
		    result = r;
		}
	       });

	max_loc = Math.min(result.places.length, MAX_LOCS);
	for (var j=0; j<max_loc; ++j) {
	    place_urls.push(result.places[j].url_name);
	}
    }
    // console.log("Place URLS");
    // console.log("lengths", spacedLats.length, place_urls.length);
    for (var i=0; i<place_urls.length; ++i) {
     	console.log(i, place_urls[i]);
    }
    return place_urls;
}

function uniquify(array) {
    // remove duplicates from array
    var uniqueArray = [];
    for (var i=0; i<array.length; ++i)
	if (uniqueArray.indexOf(array[i]) == -1) {
	    uniqueArray.push(array[i]);
	}
    return uniqueArray;
}

function get_spaced_pts(shapePts) {
    // loops over shapePts; for shapePts that
    // are sufficiently spaced, gets the corresponding seeclickfix place_url
    // and returns a list of non-duplicated place_urls along route

    spacedLats = [];
    spacedLngs = [];
    var currentLat;
    var currentLng;
    
    for (var i=0; i<shapePts.length/2; ++i) {
	lat = shapePts[2*i];
	lng = shapePts[2*i+1];

	if (i==0) {
	    currentLat = lat;
	    currentLng = lng;
	    spacedLats.push(lat);
	    spacedLngs.push(lng);
	}
	else {
	    if (Math.sqrt(Math.pow(lat - currentLat, 2) + Math.pow(lng - currentLng, 2)) > INC) {
		currentLat = lat;
		currentLng = lng;
		spacedLats.push(lat);
		spacedLngs.push(lng);
	    }		
	}
    }
    console.log("Spaced coords length", spacedLats.length);
    for (var i=0; i<spacedLats.length; ++i) {
	console.log(spacedLats[i], spacedLngs[i]);
    }
    return [spacedLats, spacedLngs];
}


function geodecode(location) {
    //
    //
    // Return:
    //     (lat, lng) array
    //
    var lat = 0.;
    var lng = 0.;
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

function get_linkid(lat,lng) {
    // 
    // Linkid identifies roadsegment for a given geo pt.
    // 
    // Return:
    //     int: MapQuest linkid
    
    var linkId = 0;

    $.ajax({url: "http://www.mapquestapi.com/directions/v2/findlinkid",
	    data: {"key": KEY, "lat": lat, "lng": lng },
	    success: function(r) {
		linkId = r.linkId
		console.log("r", r);
	    },
	    async: false
	   });

    console.log("avoid ID", linkId);
    return linkId;
}

function get_directions(from, to, avoidLinkIds) {
    var url = 'https://www.mapquestapi.com/directions/v2/route';
    
    var route;

    console.log("avoid", avoidLinkIds.join());
    
    for (var i=0; i<avoidLinkIds.length; ++i)
	console.log("avoid", avoidLinkIds[i]);
    
    $.ajax({
	url: url,
	data: { "from": from,
		"to": to,
		"key" : KEY,
		"shapeFormat": "raw",
		"generalize": 0,
		"mustAvoidLinkIds" : avoidLinkIds.join()
	      },
	success: function(r) {
	    console.log(r.route.shape);
	    route = r; 
	},
	async: false
    });
    
    
    // shape = route.shape;
    // console.log(shape);
    // console.log(shape.shapePoints);
    // console.log("here");
    // for (var i=0; i<shape.shapePoints.length; ++i) {
    // 	console.log(shape.shapePoints[i]);
    // }
    return route;
}

function get_directions_async(from, to, avoidLinkIds,
			      success_callback) {
    var url = 'https://www.mapquestapi.com/directions/v2/route';
    
    var route;

    console.log("avoid", avoidLinkIds.join());
    
    for (var i=0; i<avoidLinkIds.length; ++i)
	console.log("avoid", avoidLinkIds[i]);
    
    $.ajax({
	url: url,
	data: { "from": from,
		"to": to,
		"key" : KEY,
		"shapeFormat": "raw",
		"generalize": 0,
		"mustAvoidLinkIds" : avoidLinkIds.join()
	      },
	success: success_callback,
	async: true
    });
}

function display_route(from, to, shapePoints) {
    
    MQA.withModule('new-route-collection', function() {
	
	// uses the MQA.RouteCollection object to add the custom route and POIs to the map
	fromLatLng = geodecode(from);
	toLatLng = geodecode(to);

	console.log("from", fromLatLng[0]);
	
	var poiFrom = new MQA.Poi({ lat:fromLatLng[0],
				    lng:fromLatLng[1] });
	poiFrom.setRolloverContent("Start");
	poiFrom.setIcon(new MQA.Icon('http://www.mapquestapi.com/staticmap/geticon?uri=poi-green_1.png', 20, 29));
	//poiFrom.setIcon(new MQA.Icon('http://www.mapquestapi.com/staticmap/geticon?uri=poi-green_1.png'));
	
	var poiTo = new MQA.Poi({ lat:toLatLng[0],
				  lng:toLatLng[1] });
	poiTo.setRolloverContent("End");
	poiTo.setIcon(new MQA.Icon('http://www.mapquestapi.com/staticmap/geticon?uri=poi-green_1.png', 20, 29));
	//poiTo.setIcon(new MQA.Icon('http://www.mapquestapi.com/staticmap/geticon?uri=poi-green_1.png'));

	pois = [poiFrom, poiTo];
	
	var rc = new MQA.RouteCollection({
	    pois: pois,
	    line: shapePoints,
	    display: {
		color: '#404040',
		borderWidth: 10,
		draggable: true,
		draggablepoi: true
	    }
	});
	
	MAP.addShapeCollection(rc);
	MAP.bestFit();
    });
}

function display_calamities(calamities) {
    MQA.withModule("shapes", function() {
	var pois = new MQA.ShapeCollection();
	for (var i=0; i<calamities.length; ++i) {
	    var poi = new MQA.Poi({ lat: calamities[i].lat,
				    lng: calamities[i].lng });
	    poi.setRolloverContent(calamities[i].description);
	    pois.add(poi);
	}
	MAP.addShapeCollection(pois);
	MAP.bestFit();
    });
}

function active_issues(elt) {
    // elt is an element of issues returned by SeeClickFix
    // categories is an array of strings to check in the
    // summary of each issue
    var categories = ["Pothole", "Tree Down - Storm Related"];
    
    var active = (elt.status = "Open");
    var in_category = false;
    for (var i=0; i<categories.length; ++i) 
	if (elt.summary.indexOf(categories[i]) != -1)
	    in_category = true;
    
    return active && in_category;
};

function get_calamity_in_place(place_url) {
   var result;
    $.ajax({url: "https://seeclickfix.com/api/v2/issues",
	    dataType: "json",
	    data: { place_url: place_url,
		  },
	    async: false,
	    success: function(r) {
		result = r;
	    }
	   });
    return result.issues;
}


function displayNarrative(data) {
    if (data.route) {
	var legs = data.route.legs,
	    html = '',
	    i = 0,
	    j = 0,
	    trek,
	    maneuver;
	
	html += '<table class="clean"><tbody>';
	
	for (; i<legs.length; i++) {
	    for (j=0; j<legs[i].maneuvers.length; j++) {
		maneuver = legs[i].maneuvers[j];
		html += '<tr>';
		html += '<td>';
		
		if (maneuver.iconUrl) {
		    html += '<img src="' + maneuver.iconUrl + '" />';
		}
		
		for (k=0; k<maneuver.signs.length; k++) {
		    var sign = maneuver.signs[k];
		    
		    if (sign && sign.url) {
			html += '<img src="' + sign.url + '" />';
		    }
		}
		
		html += '</td><td>' + maneuver.narrative + '</td>';
		html += '</tr>';
	    }
	}
	
	html += '</tbody></table>';
	document.getElementById('route-results').innerHTML = html;
    }
}


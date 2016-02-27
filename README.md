# saveYourCar

Peeved by potholes? Bored of bumps? 

SaveYourCar is a project to provide optimal driving directions 
between two points while avoiding unfixed potholes. The pothole
information is taken from the user-reported, and as yet
unfixed potholes, on Princeton's SeeClickFix website.

Of course, the infrastructure is more general and can be extended to route 
between points while avoiding other calamities. 

Build
-----
 1. Clone this repository

 2. Clone the forked directions.py library at https://github.com/gkc1000/directions.py

    Note: this requires the Python polycomp library at https://github.com/Mapkin/polycomp

 3. Currently, if you want to display the route, it uses geojsonio.py at https://github.com/jwass/geojsonio.py

How it works
------------

1. Gets pothole data from seeclickfix.com/princeton_nj. 
2. Geodecode into lat,lng pairs.
3. Use Mapquest directions API to turn into linkID (road segment)
4. Call Mapquest directions API with beginning / end routes, avoiding linkIDs

The test file is pothole_directions.py.

The relevant API's are:
* Mapquest directions: http://www.mapquestapi.com/directions/
* Seeclickfix: http://dev.seeclickfix.com/v2/issues/
  (although we just get a data dump and parse it ourselves)

TODO
----

* Proper web and map interface to support input and display directions
* Waypoints (should be trivially supported, haven't checked)
* Ability to select other categories on SeeClickFix to avoid, as well
  as waypoints to avoid
* Check comments in files for further things todo.


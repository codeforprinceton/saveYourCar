import urllib
import json
import directions
import requests
import geojsonio
import seeclickfix

KEY = "bi9S3lJX0mZthOJrwFkdamXSaLDWNM18"

def geodecode(location):
    """
    Return:
        (lat, lng) pair
    """
    geo_codeURL = 'http://www.mapquestapi.com/geocoding/v1/address'
    PARAMS = {
        'key' : KEY,
        'inFormat': 'json',
        'outFormat': 'json'
    }
    geo_data = { 'location' : location }
    geo_json = json.dumps(geo_data, separators=(',', ':'))
    r = requests.post(geo_codeURL,
                      params=PARAMS,
                      data=geo_data)

    result = r.json()

    # assumes a unique result and unique location are returned
    lat = result["results"][0]["locations"][0]["latLng"]["lat"]
    lng = result["results"][0]["locations"][0]["latLng"]["lng"]

    return (lat, lng)

def get_linkid(lat_lng):
    """
    Linkid identifies roadsegment for a given geo pt.
    
    Return:
        int: MapQuest linkid 
    """
    lat, lng = lat_lng

    link_data = { "lat" : lat,
                  "lng" : lng } 

    link_json = json.dumps(link_data, separators=(',', ':'))

    linkid_url = 'http://www.mapquestapi.com/directions/v2/findlinkid'
    r = requests.post(linkid_url,
                      params= { "key" : KEY, "lat" : lat, "lng": lng })

    result = r.json()
    link_id = result["linkId"]

    return link_id
    

def get_directions(locations, avoid=None):
    mq = directions.Mapquest(KEY)
    routes = mq.format_output(mq.raw_query(locations, 
                                           avoid=avoid))

    return routes


#### TEST CODE ####

def test():
    # get unfixed potholes in Princeton (as human-readable addresses)
    avoid_locations = [seeclickfix.get_pothole_locations()]

    latLngs = [geodecode(loc) for loc in avoid_locations]
    linkids = [get_linkid(latLng) for latLng in latLngs]

    # There is currently a pothole at Valley & Walnut,
    # these addresses are chosen to be near the pothole
    journey_locations = ["Walnut & Guyot, Princeton NJ",
                         "Loomis Ct, Princeton NJ"]

    # routes is a list or "Route" objects, from the directions.py
    # library. It contains coordinate info for plotting
    # and "maneuver" info for the turn-by-turn directions
    routes = get_directions(journey_locations, avoid=linkids)
    
    # uncomment this line to display route
    # geojsonio.display(routes)

if __name__=="__main__":
    test()

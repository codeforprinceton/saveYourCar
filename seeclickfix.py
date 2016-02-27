import urllib
import pandas
import json
import numpy

def get_pothole_locations():
    """
    Returns:
        [str] : list of addresses with potholes
    """
    # Currently only Princeton, NJ issues are searched for.
    # SeeClickFix supports looking up reporting towns near
    # an address. Ideally we would look for all towns
    # along the route and collate the data.
    url = "http://seeclickfix.com/api/issues.json?at=Princeton,NJ"
    data = json.loads(urllib.urlopen(url).read())

    df = pandas.read_json("http://seeclickfix.com/api/issues.json?at=Princeton,NJ")
    
    notclosed_ix = numpy.where(df["status"]!="Closed")[0]
    # Every town on SeeClickFix has a list of reporting categories.
    # (e.g. print the dataframe above to see them)
    # We can search the data to identify problems of a certain kind.
    # 
    # We currently look only for potholes. If we want to avoid other 
    # kinds of things, then add other categories. 
    pothole_ix = numpy.where(df["summary"]=="Pothole")[0]

    # indices of incidents where pothole is not yet fixed
    not_closed_pothole_ix = numpy.intersect1d(notclosed_ix, pothole_ix)

    print "Unfixed potholes"
    print df["address"][not_closed_pothole_ix]
    ph_locs = df["address"][not_closed_pothole_ix].tolist()
    return ph_locs

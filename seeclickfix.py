import urllib
import pandas
import json
import numpy

def get_pothole_locations():
    """
    Returns:
        [str] : list of addresses with potholes
    """
    url = "http://seeclickfix.com/api/issues.json?at=Princeton,NJ"
    data = json.loads(urllib.urlopen(url).read())

    df = pandas.read_json("http://seeclickfix.com/api/issues.json?at=Princeton,NJ")
    
    notclosed_ix = numpy.where(df["status"]!="Closed")[0]
    pothole_ix = numpy.where(df["summary"]=="Pothole")[0]

    # indices of incidents where pothole is not yet fixed
    not_closed_pothole_ix = numpy.intersect1d(notclosed_ix, pothole_ix)

    print "Unfixed potholes"
    print df["address"][not_closed_pothole_ix]
    ph_locs = df["address"][not_closed_pothole_ix].tolist()
    return ph_locs

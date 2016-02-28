import urllib
import pandas
import json
import numpy

def get_calamity_locations():
    """
    Returns:
        [str] : list of addresses with calamities
    """
    # Currently only Princeton, NJ issues are searched for.
    # SeeClickFix supports looking up reporting towns near
    # an address. Ideally we would look for all towns
    # along the route and collate the data.
    url = "http://seeclickfix.com/api/issues.json?at=Princeton,NJ"
    data = json.loads(urllib.urlopen(url).read())
    calamities = ["Pothole", "Tree Down - Storm Related"]

    df = pandas.read_json("http://seeclickfix.com/api/issues.json?at=Princeton,NJ")
    
    notclosed_ix = numpy.where(df["status"]!="Closed")[0]
    # Every town on SeeClickFix has a list of reporting categories.
    # (e.g. print the dataframe above to see them)
    # We can search the data to identify problems of a certain kind.
    # 
    # We currently look only for calamities in the calamity list. 
    # If we want to avoid other 
    # kinds of things, then add other categories. 
    calamity_ix = []
    for calamity in calamities:
        calamity_ix += list(numpy.where(df["summary"]==calamity)[0])

    # indices of incidents where calamity is not yet fixed
    not_closed_calamity_ix = numpy.intersect1d(notclosed_ix, calamity_ix)
    #not_closed_calamity_ix = (calamity_ix)

    print "Unfixed calamities"
    print df["address"][not_closed_calamity_ix]
    print
    print df["summary"][not_closed_calamity_ix]
    
    ph_locs = df["address"][not_closed_calamity_ix].tolist()
    return ph_locs

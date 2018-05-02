---
layout: post

title: "Building the elastic search demo"

tags: [Index Extensions, Query Extensions, JS UI custom components, Push API]

author:
  name: Wim Nijmeijer
  bio: Technical Evangelist
  image: 20180501/wim.jpg
---

_This is the second blog post of a new series entitled “Build it with Coveo”. The series will present innovative use cases for the Coveo Platform, always including full code samples._

You might have heard of the fact that Coveo is now starting to leverage Elasticsearch as its indexing technology. We wanted to build a demo on top of that to showcase what we can do.

## Use case: 
Build a demo on top of [Coveo for Elasticsearch](https://elastic.coveodemo.com/demo) to show what you can do with the platform. Use public content where everybody is familiar with. Build it in 2-4 weeks time.
![RL1]({{ site.baseurl }}/images/20180501/intro.png)

<!-- more -->

## Requirements for the demo:
We wanted to have content which is public available. We all liked the concept of 'Movies'. So based on that we constructed an index with everything related to movie content. The demo should also showcase 'the art of the possible', so that customers and partners can see what and how they can leverage the Coveo Platform. It should include a number of connectors, extension scripts and UI customizations.


## What we wanted to show
Before we even start indexing, we first need to think about the UI. We wanted to have a Movie search, with a very rich interface (facets, related content). But besides Movies, it would also be interesting to also leverage the Soundtrack data which is available for most of the Movies. Using the Soundtrack data we know the artists and the tracks played in each movie. Going one step further we also want to find the soundtracks, including the albums of each artist. What would be ultimate if we then could show the concerts where the artist is performing!
From finding a movie, to a great new music album and finally visiting a concert!

So basically to support the above, we need the following content inside our index:

* Movie content
* Music/track content
* Additional content, like scripts library, wikipedia content
* Concerts content

Now we only need to find that content to index it...

## What we indexed

After investigating where the content is available (and also public available), we found a number of content repositories. The bad news was that most of them had throttling defined so we really needed to have some scripts which 'slowly' downloads all the content from the respective API's. Below is the list of the content we indexed and which connector was used.

* Books, Connector: Web, Content: Movie scripts (web and pdf’s)
* Concerts, Connector: Push, Content: Concert information coming from https://api.songkick.com
* Movies, Connector: Push, Content: Movie information coming from https://www.imdb.com 
* Music, Connector: Push, Content: Music tracks from https://www.lastfm.com
* Wikipedia, Connector: Push, Content: enwiki from wikipedia.
* Youtube, Connector: Youtube, Content: Youtube movietrailers and Youtube Movies
* Google, Movie tickets search (federated), Special: the current country/region is gotten from ipinfo.io. Using that a search is performed against google to find the theatres nearby where the movie is playing.

Since the Movie source is the most complicated one, we will deep dive into that later on. The other connectors like Books and Youtube are out of the box [connectors](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=257).

### Deep dive into indexing the Movies, step 1 crawling.
The Movie database ([TheMovieDb](https://api.themoviedb.org)) has a very rich REST api where we can get all the information we want from a movie. We can get the general information, like budget, revenue but also people playing, crew and even reviews. 
The JSON we get from the Movie Database:
``` json
{
    "alternative_titles": {
        "titles": [
            {
                "iso_3166_1": "FR",
                "title": "The passenger france"
            },
            {
                "iso_3166_1": "VE",
                "title": "El Pasajero"
            },
            {
                "iso_3166_1": "TW",
                "title": "\u75be\u901f\u6551\u63f4"
            }
        ]
    },
    "poster_path": "/rDeGK6FIUfVcXmuBdEORPAGPMNg.jpg",
    "production_countries": [
        {
            "iso_3166_1": "FR",
            "name": "France"
        },
        {
            "iso_3166_1": "GB",
            "name": "United Kingdom"
        },
        {
            "iso_3166_1": "US",
            "name": "United States of America"
        }
    ],
    "revenue": 31642534,
    "overview": "A businessman on his daily commute home gets unwittingly caught up in a criminal conspiracy that threatens not only his life but the lives of those around him.",
    "allreviews": "",
    "video": false,
    "keywords": {
        "keywords": []
    },
    "id": 399035,
    "genres": [
        {
            "id": 28,
            "name": "Action"
        },
        {
            "id": 80,
            "name": "Crime"
        },
        {
            "id": 18,
            "name": "Drama"
        },
        {
            "id": 9648,
            "name": "Mystery"
        },
        {
            "id": 53,
            "name": "Thriller"
        }
    ],
    "title": "The Commuter",
    "tagline": "Lives are on the line",
    "vote_count": 145,
    "homepage": "https://thecommuter.movie/",
    "belongs_to_collection": null,
    "original_language": "en",
    "status": "Released",
    "relatedartist": "Blue Mink",
    "spoken_languages": [
        {
            "iso_639_1": "en",
            "name": "English"
        }
    ],
    "relatedsongs": "Melting Pot;In The Mirror;Un-Named;Ride Of The Valkyries",
    "imdb_id": "tt1590193",
    "credits": {
        "cast": [
            {
                "name": "Liam Neeson",
                "gender": 2,
                "character": "Michael MacCauley",
                "order": 0,
                "credit_id": "57445c4e925141586c0022a1",
                "cast_id": 0,
                "profile_path": "/9mdAohLsDu36WaXV2N3SQ388bvz.jpg",
                "id": 3896
            },
            {
                "name": "Stuart Whelan",
                "gender": 2,
                "character": "Police Detective (uncredited)",
                "order": 56,
                "credit_id": "5a53ef660e0a2607d40019b9",
                "cast_id": 110,
                "profile_path": null,
                "id": 1840384
            }
        ],
        "crew": [
            {
                "name": "Jaume Collet-Serra",
                "gender": 2,
                "department": "Directing",
                "job": "Director",
                "credit_id": "57445c5992514155be00120b",
                "profile_path": "/z7jv5RF9RVZnv32QuMn8YxFgdIg.jpg",
                "id": 59521
            },
            {
                "name": "Byron Willinger",
                "gender": 0,
                "department": "Writing",
                "job": "Writer",
                "credit_id": "57445c66c3a3681233001379",
                "profile_path": null,
                "id": 1625285
            },
            {
                "name": "Philip de Blasi",
                "gender": 0,
                "department": "Writing",
                "job": "Writer",
                "credit_id": "57445c70c3a3685c4a002509",
                "profile_path": null,
                "id": 1625287
            },
            {
                "name": "Jeremy Richardson",
                "gender": 0,
                "department": "Editing",
                "job": "First Assistant Editor",
                "credit_id": "5a538c2b925141133303273f",
                "profile_path": null,
                "id": 1025608
            }
        ]
    },
    "adult": false,
    "backdrop_path": "/nlsNr1BEmRgRYYOO24NSHm6BXYb.jpg",
    "production_companies": [
        {
            "name": "StudioCanal",
            "id": 694
        },
        {
            "name": "Ombra Films",
            "id": 23513
        }
    ],
    "release_date": "2018-01-11",
    "popularity": 201.963181,
    "original_title": "The Commuter",
    "budget": 30000000,
    "reviews": {
        "total_results": 0,
        "total_pages": 0,
        "page": 1,
        "results": []
    },
    "vote_average": 5.6,
    "runtime": 105
}
```
We call their API to get the movies for each year:
``` python

#Get Results from TMDB for a specific year
def parseTMDBResults(year):
    response = requests.get("https://api.themoviedb.org/3/discover/movie?api_key="+mykey+"&sort_by=popularity.desc&include_adult=false&include_video=true&page=1&primary_release_year="+str(year))
    json_data = json.loads(response.text)
    if debug:
        print "Parsing page 1 from "+str(year)
    parsePage(json_data, False)
    currentpage=2
    totpage=json_data["total_pages"]
    for x in range(2, totpage):
        response = requests.get("https://api.themoviedb.org/3/discover/movie?api_key="+mykey+"&sort_by=popularity.desc&include_adult=false&include_video=true&page="+str(x)+"&primary_release_year="+str(year))
        json_data = json.loads(response.text)
        print "Parsing page " +str(x) + " from "+str(year)
        parsePage(json_data, False)
```
We now can retrieve all the movies. For each movie we parse the details and put the output directly into a JSON file for later use. Because we want to index reviews seperately, we already splitting the reviews into seperate files.

### Adding sentiment analysis (by Meaningcloud) on the fly
What we also would like is to have sentiment analysis performed on the reviews. So that we could search for 'Positive' reviews. Since Coveo does not offer sentiment analysis we used [MeaningCloud](https://www.meaningcloud.com). We push the reviewtext to MeaningCloud, which reports back the sentiment.
``` python
def getMovieDetails(date,id, update):
        file = open("output/"+date+"_"+str(id)+".json","w" )
        response = requests.get("https://api.themoviedb.org/3/movie/"+str(id)+"?api_key="+mykey+"&append_to_response=credits%2Ckeywords%2Calternative_titles%2Creviews")
        json_data = json.loads(response.text)
        #check for reviews
        json_data["allreviews"]=""
        if "reviews" in json_data:
            reviewresults=json_data["reviews"]["results"]
        else:
            reviewresults=[]
        if (len(reviewresults)>0):
            reviewtext=""
            #we have reviews
            for results in reviewresults:
                reviews= dict()
				#copy parent data from the movie into the review record
                reviews["parentid"]=json_data["id"]
                reviews["id"]=str(json_data["id"])+results["id"]
                reviews["url"]=results["url"]
                reviews["title"]=json_data["title"]
                reviews["release_date"]=json_data["release_date"]
                reviews["content"]=results['content']
                reviews["author"]=results['author']
                reviewtext = reviewtext+"By: "+results["author"]+"<br>"+results["content"]+"<br>"
                filerev = open("output/"+date+"_"+str(id)+"_"+results["id"]+"_review.json","w" )
                filerev.write(json.dumps(reviews).encode('utf-8'))
                filerev.close()
            #We need to sent data to meaningcloud
            if update and reviewtext:
                #send to meaningcloud
                print 'Calling meaningcloud'
                urlmc = "http://api.meaningcloud.com/sentiment-2.1"
                payload = "key=OURAPIKEY&lang=auto&txt="+reviewtext.encode('utf-8')+"&txtf=markup&doc=undefined&sdg=t&dm=s&egp=y&uw=y&rt=n"
                headers = {'content-type': 'application/x-www-form-urlencoded'}

                response = requests.request("POST", urlmc, data=payload, headers=headers)
                
                sentiment= json.loads(response.text)
                time.sleep(0.5)
                if 'score_tag' in sentiment:
                    if (sentiment['score_tag']=="P+"):
                        json_data["mysentimentvalue"]="Strong Positive"
                    if (sentiment['score_tag']=="P"):
                        json_data["mysentimentvalue"]="Positive"
                    if (sentiment['score_tag']=="ENU"):
                        json_data["mysentimentvalue"]="Neutral"
                    if (sentiment['score_tag']=="N"):
                        json_data["mysentimentvalue"]="Negative"
                    if (sentiment['score_tag']=="N+"):
                        json_data["mysentimentvalue"]="Strong Negative"
                    if (sentiment['score_tag']=="NONE"):
                        json_data["mysentimentvalue"]="No sentiment"

                    if (sentiment['agreement']=="DISAGREEMENT"):
                        json_data["mysentimentagree"]="Disagreement"
                    if (sentiment['agreement']=="AGREEMENT"):
                        json_data["mysentimentagree"]="Agreement"

                    if (sentiment['subjectivity']=="SUBJECTIVE"):
                        json_data["mysentimentsubj"]="Subjective"
                    if (sentiment['subjectivity']=="OBJECTIVE"):
                        json_data["mysentimentsubj"]="Objective"

                    if (sentiment['irony']=="IRONIC"):
                        json_data["mysentimentirony"]="Ironic"
                    if (sentiment['irony']=="NONIRONIC"):
                        json_data["mysentimentirony"]="Non-Ironic"

            json_data["allreviews"]=reviewtext
            
            if debug:
                print "We have reviews, creating seperate file."

        json_data["relatedartist"]=""
        json_data["relatedsongs"]=""
		#Scrape the webpage for songs and artists
        if (json_data["imdb_id"]!=""):
            json_data["relatedartist"],json_data["relatedsongs"]=parseIDMBPage(json_data["imdb_id"])


        file.write(json.dumps(json_data).encode('utf-8'))
        file.close()

```

As you can see above, we are also parsing the IDMB Web Page (parseIDMBPage). We found out that the REST api does not offer the Songs and Artists of the soundtrack of the movie, but it is displayed on the IMDB Web Page. So in order to get that we scrape the IDMB Page with the following script:
``` python
def parseIDMBPage(id):
    global meta
    #We cannot parse to fast
    time.sleep(0.3)
    try:
        html = opener.open("http://www.imdb.com/title/"+str(id)+"/soundtrack")

        bsObj = BeautifulSoup(html.read(),'html.parser')

        content = str(bsObj)
        
    except:
        content = ""
        return "", ""
    #print content
    toparse=""
    tosongs=""
    matches = re.finditer(r'Performed by <.[^>]*>(.[^<]*)',content)
    if matches:
        for match in matches:
            if (toparse==""):
                toparse=match.group(1)
            else:
                if toparse.find(match.group(1))==-1:
                    toparse=toparse+";"+match.group(1)

    #also add songs
    matches = re.finditer(r'class=\"soundTrack .[^>]*>(.[^<]*) <br/>',content)
    if matches:
        for match in matches:
            if (tosongs==""):
                tosongs=match.group(1)
            else:
                if tosongs.find(match.group(1))==-1:
                    tosongs=tosongs+";"+match.group(1)
    

    if debug:
        print "IMDB "+str(id)+" Performed by: "+toparse+", songs: "+tosongs

    return toparse, tosongs
```

Now are capable of retrieving all the information which the API is offering us. This gives us around 250-300K movies in JSON files. 


### Deep dive into indexing the Movies, step 2 pushing.
We have the JSON files, but they are still not in our index. So we need to use our [Push API](https://docs.coveo.com/en/54) to get it into our index.

Before we start pushing we first need to create the necessary [mapping fields](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=338) into our Push Source. Each mapping reserves space to store our fields we need into our UI (for example: @mygenre, @myrelatedartist, @mymovieid).

We could have been using single API calls, but that would mean for each movie a single API call. Not efficient and since we are uploading a lot of data, we should use Batch API calls. Using the Batch API we gather a lot of single Push JSON's and combine them into one big call.

Before we start pushing the data, we wanted to add some essential metadata to the JSON we got from the previous process.
For example: adding necessary key fields, like documentId, date, clickableuri.
We also need to provide a preview of the content so that people do not have to navigate to imdb.org first before reading the content.
An example of that:
![RL2]({{ site.baseurl }}/images/20180501/RL2.png)
As you can see above, the HTML also include CSS to render properly. All of that info is provided when creating the preview for the push call, final step is to encode the HTML properly like: 
``` python
	#content contains the actual HTML text
	compresseddata = zlib.compress(content.encode('utf8'), zlib.Z_BEST_COMPRESSION) # Compress the file content
	encodeddata = base64.b64encode(compresseddata)  # Base64 encode the compressed content
```

The script below builds up the JSON we need.
``` python
def add_document(movie):
	# Use movie id as unique identifier
	meta=dict()
	body=""
	document_id=""
	html= HTMLParser.HTMLParser()
	#We have a normal movie
	document_id = 'https://www.themoviedb.org/movie/'+str(movie['id'])

	#alt titles
	alttitles=""
	for alttitle in movie['alternative_titles']['titles']:
		alttitles=alttitles+alttitle['title']+"<BR>"

	#countries
	countries=""
	firstcountry=""
	first=True
	for country in movie['production_countries']:
		countries=countries+country['name']+";"
		if first:
			firstcountry=country['iso_3166_1']
			first=False
	#keywords
	keywords=""
	for keyword in movie['keywords']['keywords']:
		keywords=keywords+keyword['name']+" - "
	#genre
	genres=""
	for genre in movie['genres']:
		genres=genres+genre['name'].title()+";" 
	#cast
	allpeople=""
	casts=""
	castsfull=""
	for cast in movie['credits']['cast']:
		character = cast['character']
		character = character.lower().replace(' and ',' & ')
		character = character.title()
		casts=casts+character+";" 
		if allpeople.find(cast['name'])==-1:
			allpeople=allpeople+cast['name']+';'
		if (cast['profile_path']):
			castsfull=castsfull+"<li class='cast'><img class='castimg' src='https://image.tmdb.org/t/p/w66_and_h66_bestv2"+cast['profile_path']+"'><div class='info'><b>"+cast['name']+"</b><br>"+character+"<br></div></li>"
		else:
			castsfull=castsfull+"<li class='cast'><div class='noimage'></div><div class='info'><b>"+cast['name']+"</b><br>"+character+"<br></div></li>"
	if castsfull:
		castsfull="<ol class='castlist'>"+castsfull+"</ol>"
	#crews
	crews=""
	crewsfull=""
	for crew in movie['credits']['crew']:
		if allpeople.find(crew['name'])==-1:
			allpeople=allpeople+crew['name']+';'
		crews=crews+crew['name']+" as "+crew['job']+";" 
		if (crew['profile_path']):
			crewsfull=crewsfull+"<li class='cast'><img class='castimg' src='https://image.tmdb.org/t/p/w66_and_h66_bestv2"+crew['profile_path']+"'><div class='info'><b>"+crew['name']+"</b><br>"+crew['job']+"<br></div></li>"
		else:
			crewsfull=crewsfull+"<li class='cast'><div class='noimage'></div><div class='info'><b>"+crew['name']+"</b><br>"+crew['job']+"<br></div></li>"
	if crewsfull:
		crewsfull="<ol class='castlist'>"+crewsfull+"</ol>"
	#spoken
	spoken=""
	for spoke in movie['spoken_languages']:
		spoken=spoken+spoke['name']+";"            

	relatedartist=""
	relatedsongs=""
	if movie['popularity']==1e-06:
		movie['popularity']=0

	# Build up the quickview/preview (HTML)
	content = "<html><head><meta charset='UTF-16'><meta http-equiv='Content-Type' content='text/html; charset=UTF-16'>"
	content = content +"</head>"
	#content = content+ "<title>"+movie['title']+"    ("+movie["release_date"].split('-')[0]+")</title>"
	content = content+ "<title>"+movie['title']+"</title>"
	content = content+ "<body>"
	content = content + "<style>body {    -ms-overflow-style: -ms-autohiding-scrollbar;    background-color: #f4f4f4;    color: #000;    font-family: 'Source Sans Pro', Arial, sans-serif;    font-size: 1em;    -webkit-font-smoothing: antialiased;    -moz-osx-font-smoothing: grayscale;}"
	content = content + " .header { width: 100%;  position: relative;  z-index: 1;box-sizing:box}"
	content = content + " .imageblock { display: inline-flex; background-image: radial-gradient(circle at 20% 50%, rgba(11.76%, 15.29%, 17.25%, 0.98) 0%, rgba(11.76%, 15.29%, 17.25%, 0.88) 100%);}"
	if movie['backdrop_path']:
		content = content + " .header:before {        content: '';        position: absolute;        left: 0;        right: 0;     height:100%;   width: 100%;        z-index: -1;        display: block;        filter: opacity(100) grayscale(100%) contrast(130%);        background-size: cover;        background-repeat: no-repeat;        background-position: 50% 50%;        background-image: url('https://image.tmdb.org/t/p/w1400_and_h450_bestv2"+movie['backdrop_path']+"');        will-change: opacity;        transition: filter 1s;      }"
		meta["mybackdrop"] = movie['backdrop_path']
	content = content + " .image { padding-left:20px;padding-bottom:20px;padding-top:40px;display: block;  width: 300px; height: 450px; position: relative;   z-index: 2;}"
	content = content + " .imageimg {-webkit-box-shadow: 0px 0px 5px 2px rgba(255,255,255,1);-moz-box-shadow: 0px 0px 5px 2px rgba(255,255,255,1);box-shadow: 0px 0px 5px 2px rgba(255,255,255,1); display: block;    width: 300px;    height: 450px;       border-radius: 4px;}"
	content = content + " .side {padding-top:40px;padding-bottom:40px;margin-left: 15px; color: #ffffff; }"
	content = content + " .noimage {width: 66px;    height: 66px;    line-height: 66px;    font-size: 33px;    display: inline-block;    font-family: 'Arial';    text-align: center;    background-color: #dbdbdb;    color: #b5b5b5;    box-sizing: border-box;    font-size: 1em;    border-radius: 4px;    border: 1px solid #d7d7d7;}"
	content = content + " .noimage:before { content: \"X\";}"
	content = content + " .castlist {    list-style-type: none;    list-style-position: outside;      margin: 0;    display: flex;    flex-wrap: wrap;    justify-content: flex-start;}"
	content = content + " .castimg {  box-sizing: border-box; line-height: 66px;    font-size: 33px; display:inline-block; width: 66px;    height: 66px;    border-radius: 4px;-webkit-box-shadow: 2px 2px 3px 1px rgba(128,119,128,1);-moz-box-shadow: 2px 2px 3px 1px rgba(128,119,128,1);box-shadow: 2px 2px 3px 1px rgba(128,119,128,1);}"
	content = content + " .cast {  width: 25%;padding-bottom:10px; }"
	content = content + " div.info {     display: block;  width:60%;  align-items: center;  padding-top:5px;  padding-left: 14px;    padding-right: 20px;    }"
	content = content + " div.title h2 {margin: 0;   padding: 0;    font-size: 2.4em;    line-height: 1.1em;    font-weight: 700;    display: inline-block;}"
	content = content + " .year {  padding-left:10px; opacity: 0.6;  font-size: 1.7em;   font-weight: 400;}"
	content = content + " div.title { width: 100%; margin-bottom: 30px;}"
	content = content + " div.header_info {  width: 100%;}"
	content = content + " h3 {  font-weight: 600; line-height: 1.3em; font-size: 1.3em;  margin-bottom: 8px;}"
	content = content + " p.over { font-size: 1em;  line-height: 1.4em;-webkit-margin-before: 0.2em !important;}"
	content = content + " </style>"
	content = content + "<div class='header'>"
	content = content + "<div class='imageblock'><div class='image'>"
	if (movie['poster_path']):
		content = content +" <img class='imageimg' src='https://image.tmdb.org/t/p/w300_and_h450_bestv2"+movie['poster_path']+"'>"
	content = content + "</div><div class='side'><div class='title'><h2 style='display:inline-block'>"+movie["title"]+"</h2><span class='year'>("+movie["release_date"].split('-')[0]+")</span></div>"
	content = content + "<div class='header_info'><h3>Overview</h3></div>"
	content = content + "<div><p class='over'>"+movie["overview"]+"</p></div>"
	content = content + "<div class='header_info'><h3>Other titles</h3></div>"
	content = content + "<div><p class='over'>"+movie["original_title"]+"</p></div>"
	if (movie["tagline"]):
		content = content + "<div class='header_info'><h3>Tagline</h3></div>"
		content = content + "<div><p class='over'>"+movie["tagline"]+"</p></div>"
	content = content + "</div></div></div>" #Sidepanel#Imageblock
	content = content + "<div class='header_info'><h3>Cast</h3></div>"
	content = content + "<div>"+castsfull+"</div>"
	content = content +" <div class='header_info'><h3>Featured Crew</h3></div>"
	content = content + "<div>"+crewsfull+"</div>"
	if 'relatedartist' in movie:
		if (movie["relatedartist"]):
			relatedartist=movie["relatedartist"];
			relatedsongs=movie["relatedsongs"]
			content = content + "<div class='header_info'><h3>Soundtrack</h3></div>"
			content = content + "<div><p class='over'>Artists: "+html.unescape(movie["relatedartist"]).replace(";"," - ")
			content = content + "<br>Songs: "+html.unescape(movie["relatedsongs"]).replace(";"," - ")+"</p></div>"

	content = content + "<div class='header_info'><h3>Other info</h3></div>"
	content = content + "<div><p class='over'>Status: "+movie["status"]
	content = content + "<br>Release date: "+movie["release_date"]
	content = content + "<br>Budget: "+'${:0,.2f}'.format(movie["budget"])
	content = content + "<br>Revenue: "+'${:0,.2f}'.format(movie["revenue"])
	content = content + "<br>Profit: "+'${:0,.2f}'.format(movie["revenue"]-movie["budget"])
	content = content + "<br>Popularity: "+str(int(movie["popularity"]))
	content = content + "<br>Spoken languages: "+spoken[:-1].replace(";",' - ')
	content = content + "<br>Genres: "+genres[:-1].replace(";",' - ')
	content = content + "<br>Keywords: "+html.unescape(keywords[:-1]).replace(";"," - ")+"</p></div>"

	if 'mysentimentvalue' in movie:
		content = content + "<div class='header_info'><h3>Sentiment (by MeaningCloud) on Reviews</h3></div>"
		content = content + "<div><p class='over'>Sentiment: "+movie["mysentimentvalue"]
		content = content + "<br>Agreement: "+movie["mysentimentagree"]
		content = content + "<br>Subjectivity: "+movie["mysentimentsubj"]
		content = content + "<br>Irony: "+movie["mysentimentirony"]+"</p></div>"
		
	content = content+ "</body></html>"

	body=""
	#For reviews
	containsattachment = ""
	if (movie["allreviews"]):
		containsattachment = True
	compresseddata = zlib.compress(content.encode('utf8'), zlib.Z_BEST_COMPRESSION) # Compress the file content
	encodeddata = base64.b64encode(compresseddata)  # Base64 encode the compressed content
	#For future use if we want to start pushing permissions
	Permissions= json.loads('{"Perms":[{"PermissionSets":[{"AllowAnonymous": "True", "AllowedPermissions":[{"IdentityType":"Group", "Identity": "*@*"}], "DeniedPermissions":[]}]}]}')
	meta["FileExtension"]=".html"
	meta["Permissions"] = Permissions["Perms"]
	meta["CompressedBinaryData"]= encodeddata
	meta["connectortype"]= "Push"
	meta["mytype"]= "Movie"
	meta["myimage"]= movie["poster_path"]
	meta["mycountry"]= html.unescape(countries)
	meta["myrevenue"]= movie["revenue"]
	meta["containsattachment"]= containsattachment
	meta["mygenre"]= html.unescape(genres)
	meta["myvotecount"]= movie["vote_count"]
	meta["language"] = "English"
	meta["mystatus"]= movie["status"]
	meta["myrelatedartist"]= html.unescape(relatedartist)
	meta["myrelatedsongs"]= html.unescape(relatedsongs)
	meta["myspokenlang"]= html.unescape(spoken)
	meta["mypeople"]= html.unescape(allpeople)
	meta["mycast"]= html.unescape(casts)
	meta["mycrews"]= crews
	if "imdb_id" in movie:
		meta["myimdb"]= movie["imdb_id"]
	meta["myreviews"]= movie["allreviews"]
	meta["mypopularity"]= int(movie["popularity"])
	meta["myvoteaverage"]= movie["vote_average"]
	meta["mybudget"]= movie["budget"]
	myprofitvalue=0
	myprofit=movie["revenue"]-movie["budget"]
	#this could mess up the ranking big time
	myprofitvalue=myprofit/1000000
	if (myprofitvalue>1000):
		myprofitvalue=1000
	meta["myprofit"]= myprofit
	meta["myprofitvalue"] = myprofitvalue
	meta["title"]= movie["title"]
	meta["documentId"]= document_id
	meta["clickableuri"]= document_id
	meta["myid"] = movie['id']
	meta["myvid"] = str(movie['id'])
	meta["myids"] = str(movie['id'])
	meta["date"]= movie['release_date']

	body=json.dumps(meta) 
	#print body

	return body  
```

Since the JSON is now ready, we simply keep on gathering JSON until we have reached a certain size. Our Push API can consume a JSON batch of 250Mb.
When we have reached the treshold we build up an Push Request.

The steps to do this, are clearly [documented](https://docs.coveo.com/en/54).

We first get a fileId and an uploadUri from our Push API, that is being used to upload the file to an Amazon S3 bucket. Last step is to let our Push API know that a new file is available.
``` python

def batchPush(jsoncontent):
    #first get S3 link / fileid
    coveo_fileid_api_url = configMovie.get_fileid_api_url()
    coveo_headers = configMovie.get_headers_with_push_api_key()

    print '\n--------\nBATCH, step 1: Call FileId for S3: POST ' + coveo_fileid_api_url
    print 'Headers: ' + str(coveo_headers)

    r = requests.post(coveo_fileid_api_url, headers=coveo_headers)
    fileidjson=json.loads(r.text)
    print "\nResponse from step 1: "+str(r.status_code)

    #create batch json
    print "Response for S3: fileid=>"+fileidjson['fileId']+", uploaduri=>"+fileidjson['uploadUri']
    coveo_batchdocument_api_url = configMovie.get_batch_document_api_url(fileidjson['fileId'])
    
    print '\n---------\nBATCH, setp 2: Upload to s3\n'

    body = "{ \"AddOrUpdate\": [" + jsoncontent + "]}"

    #sent it to S3
    r= requests.put(fileidjson['uploadUri'], headers={'Content-Type': 'application/octet-stream','x-amz-server-side-encryption': 'AES256'},data=body)
    print '\nReturn from Upload call: '+str(r.status_code)

    #push to source
    print '\n---------\nBATCH, setp 3: Push call to Cloud\n'

    r = requests.put(coveo_batchdocument_api_url, headers=coveo_headers)
    print '\nReturn from Push call: '+str(r.status_code)
```

Not completely ready yet. We found out that the Movie Database creates a very nice interface with some color gradients based upon the movie picture. And (of course) we wanted to offer the same experience. Coveo offers [Indexing Pipeline Extensions](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=510). It enables us to execute a script for each item which will be indexed. Using those scripts we can add additional metadata to the content before it is finally pushed to our index.

The script will first check if the color was not already available in a DynamoDB table. If so retrieve it from there, else use [GM](http://www.graphicsmagick.org/GraphicsMagick.html) to color code the image. Store the retrieved values in a metadata field so that we can retrieve it in the UI.

Our Indexing Pipeline Extension script:
``` python
import subprocess
import boto3
import re


db_client = boto3.resource(
    "dynamodb",
    aws_access_key_id="KEY",
    aws_secret_access_key="ACCESS_KEY",
    region_name="YOURREGION"
)
db_table = db_client.Table('ColorsFromImages')


def get_from_cache(key):
    token_item = db_table.get_item(
        Key={'name': key}
    )
    if ('Item' in token_item):
        return token_item['Item']['value']

    return None


def update_cache(key, value):
    db_table.update_item(
        Key={'name': key},
        AttributeUpdates={'value': {'Value': value, 'Action': 'PUT'}}
    )


def get_colors_with_gm(image_path):
    image_name = image_path.replace('/', '')
    curl_cmd = 'curl {}{} -o {} -s'.format(parameters['images_base_path'], image_name, image_name)
    dl_file = subprocess.Popen(curl_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out, err = dl_file.communicate()

    # Command line command and arguments
    COMPRESS_CMDLINE = "gm convert {} -colors 6 -flatten HISTOGRAM:- | gm identify -format '%c' - | sort -r -n".format(image_name)

    convert = subprocess.Popen(COMPRESS_CMDLINE, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out, err = convert.communicate()

    lines = re.sub('\\s', '', out)
    lines = re.sub('srgb\\(', '', lines)
    lines = re.sub(r'(\d+,\d+,\d+),\d+', '\\1', lines)
    m = re.findall(r'\(\d+,\d+,\d+\)', lines)
    image_colors = ' '.join(m)

    update_cache(image_path, image_colors)

    RM_CMDLINE = 'rm {}'.format(image_name)
    convert = subprocess.Popen(RM_CMDLINE, shell=True)

    return image_colors


try:
    image_name = document.get_meta_data_value("myimage")[0]
    log('image_name: ' + image_name)

    image_colors = None
    image_colors = get_from_cache(image_name)

    if image_colors is None:
        log('Getting from GM')
        image_colors = get_colors_with_gm(image_name)

    log('image_colors: ' + image_colors)

    document.add_meta_data({
        "mycolors": image_colors
    })
except Exception as e:
    log(str(e))

```

Now we can start building the UI.

## Building the UI
Coveo offers out of the box a [Javascript Framework](https://docs.coveo.com/en/375) for building the UI. It offers a ton of components which you can simply drag and drop using an [Interface Editor](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=230). Using the editor you can quickly design the basic layout of your UI, create search interfaces, add facets and you are ready to go for a basic search experience. Since we wanted to have very specific result templates, completely tailored to the search audience, we needed some additional configuration directly into the HTML/JS files.

### Building the UI, result templates
For almost all the content types we have indexed we wanted to have some more dedicated [result templates](https://docs.coveo.com/en/413), than offered out of the box. The Movie result template is probably the most complicated one. It uses a couple of custom controls (later on more on them), and some custom formatting.
Coveo offers out of the box different [result layouts](https://docs.coveo.com/en/360), list, card and table. For each a custom result template can be created.
What the Javascript framework will do is, pick the first template where the condition is met. If none of the conditions is met and there is NO default template, then nothing is shown.

The Movie database result template looks like:
``` html
<script id="Movie" class="result-template" type="text/html" data-layout="list" data-field-mytype="Movie">
	<div class="coveo-result-frame movie">
	<span class="CoveoMyBackground" data-show-poster="true"></span>
	<div class="result-float-right role-based-text-color">
		<span class="CoveoFieldValue" data-field="@date" data-helper="date"></span>
		<span class="CoveoMySentiment"></span>
		<div class="CoveoQuickview"></div>
		<div class="CoveoFieldValue" data-field="@myvoteaverage" data-text-caption="★" style="display:block"></div>
		<div class="CoveoFieldValue" data-field="@mysentimentvalue"></div>
		<div class="CoveoFieldValue" data-field="@myprofitvalue" data-text-caption="Profit (x100M):" style="display:block"></div>
		<div class="CoveoFieldValue" data-field="@mypopularity" data-text-caption="Popularity:" data-helper="currency" data-helper-options-decimals="0" data-helper-options-symbol=" " style="display:block"></div>
		<div class="CoveoMyFeatured"></div>
		<div class="CoveoMyART"></div>
	</div>
	<a class="CoveoResultLink"></a>

	<div class="CoveoExcerpt"></div>

	<span class="CoveoResultFolding"
		data-result-template-id="Review"
		data-normal-caption="Reviews"
		data-more-caption="Show more reviews"
		data-expanded-caption="Reviews"
		data-less-caption="Show less reviews"
		data-one-result-caption="Only one review"></span>

	<div class="CoveoDetailsAndRelated">
		<table class="CoveoFieldTable coveo-details related-content Details query-done" data-allow-minimization="false">
			<tr data-field="@source" data-caption="Source"></tr>
			<tr data-field="@mystatus" data-caption="Status"></tr>
		<tr data-field="@mycountries" data--caption="Production Countries"></tr>
		<tr data-field="@mygenre" data-caption="Genres"></tr>
		<tr data-field="@myrelatedartist" data-caption="Soundtrack (artists)" data-split-values="true"></tr>
		<tr data-field="@myrelatedsongs" data-caption="Soundtrack (songs)"></tr>
		</table>
	</div>

	<div class="CoveoResultsRelated youtube"
	data-result-template-id="YouTubeVideoList"
	data-name="Videos"
	data-normal-caption="Videos"
	data-title-caption="Related videos (based upon title)"
	data-expanded-caption="Hide Related Youtube Videos"
	data-no-results-caption="No related videos found"
	data-query='@title="[FIELD1]" @filetype=YoutubeVideo'
	data-key-check='@filetype;YoutubeVideo'
	data-expanded-comment="Show YouTube videos which title contains '[FIELD1]'"
	data-extra-boost=false
	data-fields="title"
	data-partial-match=false
	data-number-Of-Results=5
	data-help='#ResultHelpYoutube'>
	</div>

	<div class="CoveoResultsRelated music"
	data-result-template-id="Music"
	data-name="Music"
	data-normal-caption="Music"
	data-title-caption="Related music (based upon related songs and related artists)"
	data-expanded-caption="Hide Related Music"
	data-no-results-caption="No related music found"
	data-query='@myrelatedsongs=("[FIELD1]") @myrelatedartist=("[FIELD2]") @source=Music $qre(expression: &#39;soundtrack&#39;,modifier:&#39;300&#39;, isConstant:&#39;true&#39;)'
	data-key-check='@source;Music'
	data-expanded-comment="Show Music with Related Songs/Artists of: [FIELD1] and [FIELD2]"
	data-extra-boost=false
	data-fields="myrelatedsongs;myrelatedartist"
	data-filter-field="@myalbum"
	data-partial-match=false
	data-number-Of-Results=5
	data-help='#ResultHelpMusic'>
	</div>

	<div class="CoveoResultsRelated book"
	data-result-template-id="DefaultBook"
	data-name="Scripts"
	data-normal-caption="Scripts"
	data-title-caption="Related scripts (based upon title)"
	data-expanded-caption="Hide Related Scripts"
	data-no-results-caption="No related Scripts found"
	data-query='@title="[FIELD1]" @source=Books'
	data-key-check='@source;Books'
	data-expanded-comment="Show Scripts with matching title: [FIELD1]"
	data-extra-boost=false
	data-fields="title"
	data-partial-match=false
	data-number-Of-Results=5
	data-help='#ResultHelpScript'>
	</div>

	<div class="CoveoResultsRelated Wiki"
	data-result-template-id="DefaultWiki"
	data-name="Wikipedia"
	data-normal-caption="Wikipedia"
	data-title-caption="Related wikipedia (based upon movie id)"
	data-expanded-caption="Hide Related Wikipedia"
	data-no-results-caption="No related Wikipedia found"
	data-query="@myimdb=[FIELD1] @mytype=Wikipedia"
	data-key-check='@mytype;Wikipedia'
	data-expanded-comment="Show Wikipedia with movie id: [FIELD1]"
	data-extra-boost=false
	data-fields="myimdb"
	data-partial-match=false
	data-number-Of-Results=5
	data-help='#ResultHelpWiki'>
	</div>
	<div class="CoveoResultsRelated Play"
	data-result-template-id="DefaultWiki"
	data-name="Playing"
	data-normal-caption="Playing"
	data-title-caption="Today playing:"
	data-expanded-caption="Hide Playing nearby"
	data-no-results-caption="Nothing found playing today nearby {LOC} (retrieved from Google)"
	data-query='https://www.google.com/search?q=[FIELD1]&amp;oq=[FIELD1]&amp;near={LOC}'
	data-key-check=''
	data-div-to-get='div.tb_c;.lr_c_fcb;a.vk_bk.lr-s-din;div.lr_c_fce'
	data-expanded-comment=""
	data-extra-boost=false
	data-fields="title"
	data-partial-match=false
	data-number-Of-Results=5
	data-help='#ResultHelpWiki'>
	</div>
</div>

</script>
```

And will show in the interface like:
![RL1]({{ site.baseurl }}/images/20180501/RL1.png)

Lots of the components inside the resulttemplate are out of the box (CoveoFieldValue, CoveoExcerpt, CoveoResultLink), others (CoveoMyBackground, CoveoResultsRelated) are custom made (see next section).

### Building the UI, custom controls
You can use [Typescript](https://docs.coveo.com/en/361) to create custom controls, or you can simply embed them within your HTML/[Javascript](https://docs.coveo.com/en/305) files, and that is what we have used for the demo. A few of the components will be discussed in detail. You can always view them [here](https://elastic.coveodemo.com/demo/js/pages.js).

### Custom control: CoveoMyBackground
The first custom control is CoveoMyBackground. It offers a custom background based upon a reference to the images we gathered during the indexing process. It also uses the color gradient (from the Indexing Pipeline Extension) to create a nice gradient color, based upon the image of the movie/album.
``` javascript
//***************************
//MyBackground
//  Adds a background image and sets the background gradient of the result
//***************************
let MyBackground = function (element, options, bindings, result) {
    __extends(MyBackground, Coveo.Component);
    Coveo.ComponentOptions.initComponentOptions(element, MyBackground, options);

    if (options.showPoster) {
        let url = result.raw.myimage;
        if (result.raw.mytype === 'Movie') {
            url = url ? '//image.tmdb.org/t/p/w185_and_h278_bestv2' + url : '//elastic.coveodemo.com/icons/noimage-nofill.png';
        }
        else if (result.raw.mytype === 'Music') {
            url = url ? '//lastfm-img2.akamaized.net/i/u/174s/' + url : '//elastic.coveodemo.com/icons/noimage-nofill.png';
        }
        else if (result.raw.mytype === 'Concert') {
            url = url ? `//images.sk-static.com/images/media/profile_images/artists/${url}/large_avatar` : '//elastic.coveodemo.com/icons/noimage-nofill.png';
        }

        $(element).closest('.coveo-result-frame').css('background-image', `url(${url})`).on('click', (e) => {
            $(e.target).find('.CoveoQuickview').coveo('open');
        });

    }

    // calculate gradient
    // the mycolors is added with an IPE during indexing
    let colors = result.raw.mycolors;
    if (colors) {
        colors = colors.split(' ');
        if (colors.length) {
            let i = 0;
            // make sure we have at least 5 colors, by adding previous colors when array is short.
            while (colors.length < 5) {
                colors.push(colors[i++]);
            }
            colors = colors.map((c, idx) => {
                let trans=0.05;
                if (userIdToAdd.sel=="Anonymous" && options.showPoster)
                { 
                    trans=0.95;
                }                
                //let t = ((5 - idx) * 0.05).toFixed(2);
                let t = ((5 - idx) * trans).toFixed(2);
                return c.replace('(', 'rgba(').replace(')', `,${t})`); // add transparency
            });
            
            if (userIdToAdd.sel=="Anonymous" && options.showPoster)
            {
                let gradient = `linear-gradient(to right, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[3]}, ${colors[4]})`;
                $(element).closest('.CoveoResult').prepend("<div class='TopBorder'></div>").css('background', gradient);
            }
            else
            {
                let gradient = `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]}), radial-gradient(circle, ${colors[2]}, ${colors[3]}, ${colors[4]})`;
                $(element).closest('.CoveoResult').prepend("<div class='TopBorder'></div>").css('background', gradient);
            }
        }
    }
    else {
        if (userIdToAdd.sel=="Anonymous" && options.showPoster)
        {
            $(element).closest('.CoveoResult').prepend("<div class='TopBorder'></div>").css('background', 'linear-gradient(to right, rgba(193,193,193,0.35) 0%,rgba(0,0,0,0) 100%)');
        }
        else
        {
            $(element).closest('.CoveoResult').prepend("<div class='TopBorder'></div>").css('background', 'linear-gradient(45deg, rgba(193,193,193,0.35) 0%,rgba(0,0,0,0) 100%)');
        }
    }
};
MyBackground.ID = 'MyBackground';
MyBackground.options = {
    showPoster: Coveo.ComponentOptions.buildBooleanOption({ defaultValue: false })
};
Coveo.CoveoJQuery.registerAutoCreateComponent(MyBackground);
```

### Custom control: CoveoMyART
Our next custom control is CoveoMyArt, it shows a 'Featured' label on the result when the result was promoted by our Machine Learning [Art](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=183).
``` javascript
//***************************
//ART result
//  Is triggered when ART (Machine Learning) is kicking in
//***************************
let MyART = function (element, options, bindings, result) {
    __extends(MyART, Coveo.Component);
    this.element = element;
    this.options = Coveo.ComponentOptions.initComponentOptions(element, MyART, options);
    this.bindings = bindings;
    this.result = result;
    if (this.result.isRecommendation) {
        Coveo.$('<div style="position:relative"><div class="coveo-result-highlight coveo-custom-ART" ><div class="mytextART">ML Boost</div></div></div>').addClass('custom-coveo-badge').prependTo($(element).closest('.coveo-result-frame'));
    }
};
MyART.ID = 'MyART';
Coveo.CoveoJQuery.registerAutoCreateComponent(MyART);
```

### Custom control: CoveoResultsRelated
One of my favorites: CoveoResultsRelated, it shows (based upon a user action) an additional result list. The current result is used as the context. For example we want to show a tab with related youtube video's on the current result (based upon the title of the movie). We can configure the Custom control by using the properties:
``` html
<div class="CoveoResultsRelated youtube"
            data-result-template-id="YouTubeVideoList"
            data-name="Videos"
            data-normal-caption="Videos"
            data-title-caption="Related videos (based upon title)"
            data-expanded-caption="Hide Related Youtube Videos"
            data-no-results-caption="No related videos found"
            data-query='@title="[FIELD1]" @filetype=YoutubeVideo'
            data-key-check='@filetype;YoutubeVideo'
            data-expanded-comment="Show YouTube videos which title contains '[FIELD1]'"
            data-extra-boost=false
            data-fields="title"
            data-partial-match=false
            data-number-Of-Results=5
            data-help='#ResultHelpYoutube'>
          </div>
```
In the above example we specify the data-query to execute as '@title="[FIELD1]" @filetype=YoutubeVideo'. The data-fields (in this case title) will be used to fill up the [FIELD1] in the query. So only when the end user clicks on a button, the query will be executed... at least that was the first behavior of the component. 

Because we changed the layout to use tabs on a result, it does not look very professional if people see 4 different tabs and when they click on them 'No results' are shown. Bad user-experience! 
So we added an additional check inside the CoveoDetailsAndRelated component, which is executing a query with the data-key-check field. If the key with the value is not present in the data, we can hide the tab. A much better user-experience. BUT BE AWARE, if 10 results are displayed this means 10 additional queries!!!
``` javascript
//***************************
//composeQuery
//  Creates a new query for the checkQuery function
//***************************
function composeQuery(result, dataset){
    let newquery = dataset.query;
    let a = dataset.fields.split(";");
    let i = 0;
    let allfieldsmissing = true;
    for (i = 0; i < a.length; i++) {
        let fieldcontent = result.raw[a[i]];
        if (fieldcontent) {
            allfieldsmissing = false;
            fieldcontent = '' + fieldcontent;//make sure it's a string
            //Seems that if you format the field in the UI, it gets the formatted value
            fieldcontent = fieldcontent.replace(/[;()]/g, ' ');
            //Comma's must be replaced by ","
            fieldcontent = fieldcontent.replace(/,/g, '","');
            //In Elastic the : means a field query
            newquery = newquery.replace("[FIELD" + (i + 1) + "]", fieldcontent.replace(':', ' '));
        }
        else
        {
            newquery = newquery.replace("[FIELD" + (i + 1) + "]", "");
        }
    }
    return newquery;
}

//***************************
//checkQuery
//  Checks the query for all the relatedTabs. Based upon the groupby fields the tab will be made visible or not
//***************************
function checkQuery(fields, query, partial, dataset){
    let queryBuilder = new Coveo.QueryBuilder();
    queryBuilder.locale = GetBindings().queryController.lastQueryBuilder.locale;
    queryBuilder.pipeline = 'default';
    queryBuilder.searchHub = 'CheckTabs';
    queryBuilder.enableDebug = false;
    queryBuilder.enableQuerySyntax = true;
    queryBuilder.enableDuplicateFiltering = false;
    queryBuilder.excerptLength = 0;

    queryBuilder.timezone = GetBindings().queryController.lastQueryBuilder.timezone;
    queryBuilder.numberOfResults = 0;
    queryBuilder.groupByRequests = fields;

    queryBuilder.expression.add(query);
    if (partial=="true") {
        queryBuilder.enablePartialMatch = true;
        queryBuilder.partialMatchKeywords = 4;
        queryBuilder.partialMatchThreshold = "50%";
    }
    GetBindings().queryController.getEndpoint().search(queryBuilder.build()).done(function (data) {
        let showit= data.results.length !== 0;
        dataset.forEach(f => {
            if (f.dataset.partialMatch==partial && f.dataset.keyCheck!="")
            {
                //Check if we have the key in the result, if so enable the tab else disable it
                let field=f.dataset.keyCheck.split(';')[0];
                let value=f.dataset.keyCheck.split(';')[1];
                let found=false;
                data.groupByResults.forEach(res => {
                    res.values.forEach(groupval => {
                        if (groupval.value.toLowerCase()==value.toLowerCase() )
                        {
                            //We have it
                            found=true;
                        }
                    });
                });
                let $newTab = $('.RelatedTab[data-name="'+f.tab+'"]', f.parent);
                if (found){
                    $newTab.show();
                }
                else
                {
                    $newTab.hide();
                }
            }
        });

    });
}

//***************************
//checkQueries
//  builds up the total query to execute for the relatedTabs
//***************************
function checkQueries(queries){
    //Partial match queries
    let fields=[];
    let query=[];
    queries.forEach(f => {
        if (f.dataset.partialMatch=="true" && f.dataset.keyCheck!="")
        {
            //Build a single query with an OR on all queries
            //The key will be used to check if we have results
            //Add keyfield to fields to retrieve
            fields.push({ field: f.dataset.keyCheck.split(';')[0], sortCriteria:'nosort'});
            query.push('('+composeQuery(f.result, f.dataset)+')');
        }
    });
    if (query.length!=0) {
        checkQuery( fields, query.join(' OR '), "true", queries );
    }
    //Non partial match queries
    query=[];
    fields=[];
    queries.forEach(f => {
        if (f.dataset.partialMatch=="false" && f.dataset.keyCheck!="")
        {
            //Build a single query with an OR on all queries
            //The key will be used to check if we have results
            //Add keyfield to fields to retrieve
            fields.push({ field: f.dataset.keyCheck.split(';')[0], sortCriteria:'nosort'});
            query.push('('+composeQuery(f.result, f.dataset)+')');
        }
    });
    if (query.length!=0) {
        checkQuery( fields, query.join(' OR '), "false", queries );
    }
    
}
```

For the full code of the component: [Here](https://elastic.coveodemo.com/demo/js/page.js).

### Building the UI, styling it with custom CSS
By default the CSS of the Coveo interface looks nice, but in most cases you want to change them to your own branding. Everything can be [overruled](https://docs.coveo.com/en/423). Always create your own custom CSS files, and never overwrite the ones provided by Coveo out of the box.

Our resulttemplate is formatted like:
``` css
.coveo-results-column {
    .coveo-list-layout .coveo-result-frame {
        padding: 10px;
        background: #FFFFFF;
        border-radius: 2px;
        background-repeat: no-repeat;
        
        &.movie {
            padding-left: 200px;
            min-height: 278px;
            background-size: 185px auto !important;
        }
        &.people {
            padding-left: 200px;
            min-height: 278px;
            background-size: 138px auto  !important;
            background-position: 20px 20px !important;
        }
        &.default {
            padding-left: 1px;
            min-height: 278px;
        }
        &.music {
            padding-left: 200px;
            min-height: 190px;
            background-size: 174px auto  !important;
        }
        &.concert {
            padding-left: 200px;
            min-height: 160px;
            background-size: 160px auto  !important;
        }
        &.no-image {
            padding-left: 10px;
        }
    }
}
```

### Building the UI, add personalization
More and more we see requests coming in around personalization, one of the reasons why we added it to our demo. In our case we have two profiles: Movie Fan and a Movie Producer. Each has its own color schema and its own relevancy rules. Using the profiles we can quickly change the UI styling and also add specific relevancy rules into the mix. In a normal scenario this could come from all kinds of systems: for example department/country from Active Directory or information from a userprofile in Salesforce or Sharepoint.

With Coveo you can use the [QRE](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=357) syntax to start boosting results with your preferences to a higher position.
``` javascript

//Create a usermap with help and booster information.
const usersMap = {
    Producer: {
        sel: "Producer",
        activeTab: "Movies",
        help: "They like Documentaries, not Rock music. Movies are boosted with profit and popularity.<BR>Results are influenced with:<br><font style='font-size:small'><i>Using: $qre(expression: \'@mygenre=Documentaries @mytype=Movie\',modifier:\'400\', isConstant:\'true\')  $qre(expression: \'@mygenre=Rock @mytype=Music\',modifier:\'-420\', isConstant:\'true\') $qre(expression: \'@myprofitvalue>100\',modifier:\'200\', isConstant:\'true\') $qre(expression: \'@myprofitvalue>200\',modifier:\'200\', isConstant:\'true\') $qre(expression: \'@myprofitvalue>300\',modifier:\'200\', isConstant:\'true\') $qre(expression: \'@mypopularity<15\', modifier:\'-400\', isConstant:\'true\') $qre(expression: \'@mypopularity>15\', modifier:\'200\', isConstant:\'true\') $qre(expression: \'@mypopularity>250\', modifier:\'200\', isConstant:\'true\') $qre(expression: \'@mypopularity>500\', modifier:\'200\', isConstant:\'true\')</i></font><br>Only results for user producer@coveo.com and their memberships are shown.<br>They can NOT see reviews.",
        booster: "$qre(expression: \'@mytype=Movie\',modifier:\'1600\', isConstant:\'true\') $qre(expression: \'@mygenre=Documentaries @mytype=Movie\',modifier:\'400\', isConstant:\'true\')  $qre(expression: \'@mygenre=Rock @mytype=Music\',modifier:\'-420\', isConstant:\'true\') $qre(expression: \'@myprofitvalue<=5\',modifier:\'-800\', isConstant:\'true\') $qre(expression: \'@myprofitvalue>100\',modifier:\'200\', isConstant:\'true\') $qre(expression: \'@myprofitvalue>200\',modifier:\'200\', isConstant:\'true\') $qre(expression: \'@myprofitvalue>300\',modifier:\'200\', isConstant:\'true\') $qre(expression: \'@mypopularity<15\', modifier:\'-800\', isConstant:\'true\') $qre(expression: \'@mypopularity>15\', modifier:\'200\', isConstant:\'true\') $qre(expression: \'@mypopularity>250\', modifier:\'200\', isConstant:\'true\') $qre(expression: \'@mypopularity>500\', modifier:\'200\', isConstant:\'true\')",
        musicbooster: " $qre(expression: \'@mygenre=Rock @mytype=Music\',modifier:\'-500\', isConstant:\'true\')",
    },
    Anonymous: {
        sel: "Anonymous",
        activeTab: "Movies",
        help: "They like Movies. Movies are boosted with popularity.<BR>Results are influenced with:<br><font style='font-size:small'><i>Using: $qre(expression: \'@mytype=Movie\',modifier:\'1600\', isConstant:\'true\') $qre(expression: \'@mytype=Review\',modifier:\'-1200\', isConstant:\'true\') $qre(expression: \'@mypopularity<15\', modifier:\'-400\', isConstant:\'true\') $qre(expression: \'@mypopularity>15\', modifier:\'200\', isConstant:\'true\') $qre(expression: \'@mypopularity>250\', modifier:\'200\', isConstant:\'true\') $qre(expression: \'@mypopularity>500\', modifier:\'200\', isConstant:\'true\')</i></font><br>They CANNOT see reviews/customer support cases.<br>Only results for Anonymous and their memberships are shown. <br>",
        booster: "$qre(expression: \'@mytype=Movie\',modifier:\'1600\', isConstant:\'true\') $qre(expression: \'@mytype=Review\',modifier:\'-1200\', isConstant:\'true\') $qre(expression: \'@mypopularity<15\', modifier:\'-800\', isConstant:\'true\') $qre(expression: \'@mypopularity>15\', modifier:\'200\', isConstant:\'true\') $qre(expression: \'@mypopularity>250\', modifier:\'200\', isConstant:\'true\') $qre(expression: \'@mypopularity>500\', modifier:\'200\', isConstant:\'true\')",
        musicbooster: "",
    }
};
```

The above will change in the future when we will support rankingfunctions, then the whole set of @mypopularity will be replaced by a single decay function.

## UI, tips and tricks
Some special tips and tricks.

### Adding context
In order to use context like a userRole we added [context](https://docs.coveo.com/en/399) to our Queries using the following code:
``` javascript
$('#search').on("buildingQuery", function (e, args) {
	//Add the context
	//A custom context is added so we can react on it in Query Pipelines and Analytics
	args.queryBuilder.addContext({
			"userRole": userIdToAdd.sel
	});
});
```
All [events](https://docs.coveo.com/en/417) in Coveo can be adjusted to fit to your needs.

### Adding a Relevancy boost when a user profile is selected
When a user profile is selected we want to set the [hiddenQuery](https://docs.coveo.com/en/3) so it will change the relevancy based upon what was set for the current profile. In this case: hd means the description provided to the user (in the breadcrumb section), hq is the actual hidden query to execute.
``` javascript
$('#search').on("buildingQuery", function (e, args) {
	//Set the proper pipeline
	args.queryBuilder.pipeline = (MLactive ? 'ML' : 'default');

	if (userBoost) {
		Coveo.$('.CoveoSearchInterface').coveo('state', 'hd', userHelp.split('<BR>')[0]);
		Coveo.$('.CoveoSearchInterface').coveo('state', 'hq', userBoost);
		userBoost = "";
	}
});
```

### Getting a proper access token from a Lambda function
As mentioned before you should not use public API keys inside your code. So we created a Lambda function for the retrieval of our Access Token.
The Lambda function:
``` javascript
'use strict';
const https = require('https');

const TOKENS = {
  'platformdemoelastic3zlf3f2p': '-IMPERSONATE-TOKEN-'
};

const ROLES = {
  Director: 'director@coveo.com',
  Producer: 'producer@coveo.com',
  Rock: 'rock@coveo.com'
};


let getUsers = (role) => {
  let provider = 'Email Security Provider';
  let users = [{
    name: '*@*',
    provider,
    type: 'Group'
  }];

  let name = ROLES[role];
  if (name) {
    users.push({
      name,
      provider,
      type: 'User',
    });
  }
  return users;
};


// Return an object {token, userIds?} if input is valid, otherwise returns null.
let validateInput = (event) => {
  try {
    let body = JSON.parse(event.body),
      token = TOKENS[body.org],
      userIds = getUsers(body.role);

    if (token && userIds) {
      return { token, userIds };
    }
  }
  catch (e) {
    console.log('Invalid input: ', e);
  }
  return null;
};


let requestToken = (inputParams, callback) => {
  // the post options
  let options = {
    host: 'platform.cloud.coveo.com',
    path: '/rest/search/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + inputParams.token,
    }
  };

  let req = https.request(options, (res) => {
    if (res.statusCode !== 200) {
      callback(res);
      return;
    }
    let body = '';
    res.on('data', chunk => {body += chunk;});
    res.on('end', () => {
      let response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
          'Access-Control-Allow-Origin': '*',
        },
        body,
        isBase64Encoded: false
      };

      // success
      callback(null, response);
    });
  });
  req.on('error', (e) => {
    console.error('HTTP error: ' + e.message);
    callback({
      statusCode: 500,
      headers: {},
      body: '{"message":"server error"}',
      isBase64Encoded: false
    });
  });

  let usersPayload = {
    userIds: inputParams.userIds
  };
  req.write(JSON.stringify(usersPayload));
  req.end();

};

exports.handler = (event, context, callback) => {
  // console.log('EVENT: ', event);
  // console.log('CONTEXT: ', context);

  let inputParams = validateInput(event);
  if (inputParams) {
    requestToken(inputParams, callback);
  }
  else {
    callback(null, {
      statusCode: 400,
      headers: {},
      body: '{"message": "Invalid request body"}',
      isBase64Encoded: false
    });
  }

};

```

And in our JS we fetch the token:
``` javascript
//On Load...
	//We set default values
    Coveo.Analytics.options.endpoint.defaultValue = 'https://usageanalytics.coveo.com';
    Coveo.Analytics.options.searchHub.defaultValue = 'Movie';
    Coveo.Analytics.options.organization.defaultValue = ORG_ID;
    Coveo.Analytics.options.pipeline = 'ML';

    //Retrieve the access token
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://5qgxnbkr4f.execute-api.us-east-1.amazonaws.com/prod');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = ()=>{
        let token = JSON.parse(xhr.response).token;
        //Set it for both the interface as the analytics token
        Coveo.SearchEndpoint.endpoints['default'].options.accessToken = token;
        Coveo.Analytics.options.token.defaultValue = token;
		//Init our Components
        Coveo.init(document.querySelector('#search'));
		//And the recommendation component
        Coveo.initRecommendation(document.querySelector('#MyRecommendationsMusic'));
    };
    xhr.send(JSON.stringify({
        org: ORG_ID,
        role: userIdToAdd.sel
    }));
```

### Reacting on 'popular queries', manually execute a query
We added (for demo purposes) a couple of popular queries to the UI. This could execute a query directly, but when you execute a new query by code we also need to add the proper analytics events! We used the following code:
``` javascript
//Change the query based upon the popular ones. This will also add an analytics event
function changeQuery(query) {
    Coveo.$('.CoveoSearchInterface').coveo('state', 'q', query );
    //We are not executing analytics if we call executeQuery directly
    var customEventCause = {name: 'searchboxSubmit', type:'search box'};
    $('#search').coveo('logSearchEvent', customEventCause, {});
    
    $('#search').coveo('executeQuery');
}
```

### Add additional (missing or cleaning) metadata fields to our retrieved results
Sometimes you want to enrich the result set with your own result fields (on rendering time). In our case a default field called 'collection' was missing in our data. So we add it to our results. Coveo has an event for that:
``` javascript
$('#search').on("preprocessResults", (e, args) => {
	//We want to add an additional field (if it is missing) to the results
	((args && args.results && args.results.results) || []).forEach(r=>{
		r.raw.collection = (r.raw.collection || 'default');
	});
});
```

### Setting the culture
Providing a UI in several languages is very user friendly. We did it in our [Partner demo](https://elastic.coveodemo.com/demo-partners). First provide the translation of your custom strings:
``` javascript
//Setting the translation for the custom strings, which would not be in the out-of-the-box translation set
String.toLocaleString({
    "es-es": {
        "Movies, Scripts and Music": "Películas, guiones y música",       // Defines a new string.
        "All Content": "Todo el contenido",
        "Type": "Tipo",
        "Genre": "Género",
        "Artist (Soundtrack)": "Artista (Banda sonora)",
    },
    "nl": {
        "Movies, Scripts and Music": "Films, script en Muziek",       // Defines a new string.
        "All Content": "Alles",
        "Type": "Type",
        "Genre": "Genre",
        "Artist (Soundtrack)": "Artiest (soundtrack)",
    },
    "fr": {
        "Movies, Scripts and Music": "Films, Scripts et Musique",       // Defines a new string.
        "All Content": "Tout le contenu",
        "Type": "Type",
        "Genre": "Genre",
        "Artist (Soundtrack)": "Artist (soundtrack)",
    }
});
```
Then set the locale and culture to the selected one:
``` javascript
//Setting the locale based upon es-es, nl, fr, en
Globalize.cultureSelector = id;
String["locale"] = id;
//Reload the window
window.location.reload();
```

### Get query suggestions on our landing page
In our [Partner demo](https://elastic.coveodemo.com/demo-partners) we provide a landing page with popular queries. Based upon the userRole the [querySuggestions](https://developers.coveo.com/x/iQGwAQ) will be retrieved using our api, using the following code:
``` javascript

function getQuerySuggest(profile) {
    var token = Coveo.SearchEndpoint.endpoints['default'].options.accessToken;
    var url = 'https://platform.cloud.coveo.com/rest/search/v2/querySuggest?'
    + 'access_token='
    + token
    + '&language=en'
    +' &pipeline=MLIntranet'
    + '&context={"userrole": "'+profile+'"}'
    + '&searchHub=Intranet';

    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function () {
    handleQuerySuggestResponse(JSON.parse(this.responseText));
    });
    xhr.open("GET", url);
    xhr.send();
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function handleQuerySuggestResponse(response) {
    let addLi = html => {
        var query = toTitleCase( html.expression );
        var a= `<a class="CoveoResultLink RecResult" href="" onClick="changeQuery('${query}');return false;">${query}</a>`;
        return `<div class="coveo-list-layout CoveoResult popquery-item" style="height:32px">${a}</div>`;
      };
    var suggestions = [];
    response.completions.forEach(function(query) {
      suggestions.push(query);
    });
    //Set it up in the UI
    let html = suggestions
    .map(addLi);
    $('#PopularQueries').empty().html(html);
}
```

### Setting customData on our Analytics Events
In our Search Analytics dashboard we want to report if a recommended result is being clicked. For that we needed to add some additional [metadata](https://support.coveo.com/s/article/ka132000000LMYcAAO/2096) on our Analytics events.
``` javascript
$('#search').on('changeAnalyticsCustomData', function (e, args) {
	//We want to inject custom Data into each Analytics call
	args.metaObject.user = userIdToAdd.name;
	args.metaObject.role = userIdToAdd.sel;
	if (args.resultData!=undefined)
	{
		//The below values are first added as Dimensions in the Administration Console
		args.metaObject.c_istop = args.resultData.isTopResult;
		args.metaObject.c_isrecommended =  args.resultData.isRecommendation;
	}
});
```

### Sending a custom Analytics event
Whe want to track if end-users are clicking on the 'Expand to' links in the ResultsRelated component. In order to do so, we need to send a custom event to our Analytics API.
``` javascript
ResultsRelated.prototype.expandQuery = function () {
	Coveo.$('.CoveoFacet').coveo('reset');
	Coveo.$('#search').coveo('state', 'hd', this.expandedComment);
	Coveo.$('#search').coveo('state', 'hq', this.expandquery);
	Coveo.$('#search').coveo('state', 'q', '');
	//Seems we are not executing analytics if we call executeQuery directly
	var customEventCause = {name: 'expand '+this.options.name, type:'search box'};
	Coveo.$('#search').coveo('logSearchEvent', customEventCause, {});
	Coveo.$('#search').coveo('executeQuery');
};

```

### Adding an advanced search
In our case we wanted to add an advanced search feature, so end-users could easily change the results to their preferences. First of all we need to add the settings we want to the HTML page:
``` HTML
      <div class="CoveoPreferencesPanel">
        <fieldset class="coveo-form-group">
          <span class="coveo-form-group-label">Personalize results</span>
          <div class="perso-menu-content">
            <div class="perso-menu-item Filter">
              <label>
                <input class="user-personalisation-option" id="b1" name="choice-personalize" type="radio" value="choice-personalize-b1" />
                 Filter Action movies
              </label>
            </div>
            <div class="perso-menu-item Boost">
              <label>
                <input class="user-personalisation-option" id="b2" name="choice-personalize" type="radio" value="choice-personalize-b2" />
                Boost Action and Willis movies
              </label>
            </div>
            <div class="perso-menu-item Boost">
              <label>
                <input class="user-personalisation-option" id="b3" name="choice-personalize" type="radio" value="choice-personalize-b3" />
                Boost Comedy lower
              </label>
            </div>
            <div class="perso-menu-item Boost">
              <label>
                <input class="user-personalisation-option" id="b4" name="choice-personalize" type="radio" value="choice-personalize-b4" />
                Ignore Title for ranking
              </label>
            </div>
            <div class="perso-menu-item Standard">
              <label>
                <input class="user-personalisation-option" id="standard" name="choice-personalize" type="radio" value="choice-personalize-nothing"/>
                Standard search
              </label>
            </div>
          </div>
        </fieldset>

        <div class="CoveoResultsPreferences"></div>
        <div class="CoveoResultsFiltersPreferences"></div>
      </div>
```
Support that with additional code in our JS:
``` javascript
//***************************
//setSearchParams
//  Executed when the 'advancedsearch' is activated
//***************************
let persoFilter = "standard";
function setSearchParams() {
    let detail = '';

    let queries = {
        b1: `@mygenre=Action`,
        b2: `($qre(expression: '@mygenre=Action',modifier:'220')) ($qre(expression: '@mypeople=Willis',modifier:'220', isConstant:'true'))`,
        b3: `($qre(expression: '@mygenre=Comedy',modifier:'-200', isConstant:'true'))`,
        b4: `$weight(name:'Title', value:'0')`,
    };

    let query = queries[persoFilter] || '';
    if (query) {
        let $elem = $('#' + persoFilter).prop('checked', true);
        detail = $elem.closest('label').text();
    }
    else {
        $('#standard').prop("checked", true);
    }
	//Set the hiddenQuery parameters
    $('#search').coveo('state', 'hd', detail);
    $('#search').coveo('state', 'hq', query);
}

//On Load...

    //If the Advanced search is changed we need to trigger the change
    $('.user-personalisation-option').change(function () {
        persoFilter = $(this).attr('id');
        setSearchParams();
		//Set analytics event
        var customEventCause = {name: 'changePreferences', type:'search box'};
        $('#search').coveo('logSearchEvent', customEventCause, {});
        $('#search').coveo('executeQuery');
    });
```

### Sending a PageView event when clicking on a URL
In a normal situation your public website or other system could sent additional PageView events to our Analytics engine. You need that if you want to use our [Recommendations](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=237) component. The Recommendations component will look at your current journey and will use our Machine Learning to start recommending articles based upon other peoples journey.

In our case we simply want to add such an event whenever end-users are clicking on the preview/and or are following the hyperlink.
``` javascript
$('#search').on('changeAnalyticsCustomData', function (e, args) {
	//Register a pageview when clicking on a result (used for Recommendations)
	// Normally this would be done by the website directly
	if (args.type === 'ClickEvent') {
		let contentType = null;
		if ((/themoviedb/).test(args.metaObject.documentURL)) {
			contentType = "Movie";
		}
		if ((/last\.fm/).test(args.metaObject.documentURL)) {
			contentType = "Music";
		}

		if (contentType) {
			let meta = args.metaObject;
			coveoua("init", Coveo.Analytics.options.token.defaultValue);
			coveoua('send', 'pageview', {
				contentIdKey: meta.contentIDKey,
				contentIdValue: meta.contentIDValue,
				contentType: contentType
			});
		}
	}
});
```

## Pushing Analytics events using the UABOT
This is a demo instance and not used like any other production system. But for the demo we would still would like to show our [Search Analytics Dashboards](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=238). In order to show them we need data. That is where our [UABOT](https://github.com/coveo/uabot) comes in. It runs all the time and based upon a JSON configuration file it will start pushing Analytics events to our Analytics service. Based upon the Search Analytics events our Machine Learning will also start working by [suggesting query completions](https://onlinehelp.coveo.com/en/cloud/enabling_coveo_machine_learning_query_suggestions_in_a_coveo_js_search_framework_search_box.htm) and [ART](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=166).

Our UABOT file:
``` json
{
	"searchendpoint": "https://platform.cloud.coveo.com/rest/search/",
	"analyticsendpoint": "https://usageanalytics.coveo.com/rest/v15/analytics/",
	"orgName": "ORGNAME",
	"pipeline": "ML",
	"searchHub": "Movie",
	"defaultOriginLevel1": "Movie",
	"defaultOriginLevel2": "default",
	"allowAnonymousVisits": true,
	"anonymousThreshold": 0.3,
	"emailSuffixes" : ["@coveo.com"],
	"timeBetweenVisits": 20,
	"timeBetweenActions": 3,
	"randomGoodQueries": [
		"red willis", "captain america", "jungle", "dinosaur",
		"spaceship", "hunger", "smith", "mortal", "jumanji", "frozen",
		"history museum", "toy story", "disney", "fiction", "sience", "weird", "taken",
		"mortal", "king", "aliens", "Indiana Jones", "Jack Ryan",
		"Inglourious Basterds", "Eye of the Tiger", "Ghostbusters", "Bruce Wayne",
		"Marvel", "transformers", "avengers", "rock", "adventure", "comedy", "smile", "knight", "last knight",
		"I Don't Want to Miss a Thing"
	],
	"randomBadQueries": ["woopi godberg", "Inglarious Basserds",
		"Ghostbutter", "Gostbuster", "star treq", "Spuck",
		"jumangi", "frosen", "dsiney", "dysney", "therock", "tranformer"
	],
	"randomCustomData": [
		{ "apiname": "context_userRole", "values": ["Anonymous", "Producer"]},
		{ "apiname": "role", "values": ["Anonymous", "Producer"]},
		{ "apiname": "c_isbot", "values": ["true"]}
	],
	"globalFilter": "NOT @mytype=Wikipedia",
	"scenarios": [{
			"name": "GQ -> C(50%) -> C(15%)",
			"weight": 5,
			"events": [{
					"type": "Search",
					"arguments": {
						"queryText": "",
						"goodQuery": true
					}
				},
				{
					"type": "Click",
					"arguments": {
						"docNo": -1,
						"offset": 0,
						"probability": 0.5
					}
				},
				{
					"type": "Click",
					"arguments": {
						"docNo": -1,
						"offset": 0,
						"probability": 0.25
					}
				}
			]
		}, {
			"name": "BQ -> C(+10,33%)",
			"weight": 2,
			"events": [{
					"type": "Search",
					"arguments": {
						"queryText": "",
						"goodQuery": false
					}
				},
				{
					"type": "Click",
					"arguments": {
						"docNo": -1,
						"offset": 10,
						"probability": 0.10
					}
				}
			]
		},
		{
			"name": "(G) red willis",
			"weight": 3,
			"events": [{
				"type": "SearchAndClick",
				"arguments": {
					"queryText": "red willis",
					"matchField": "title",
					"matchValue": "RED",
					"probability": 0.95
				}
			}
		]
	},
	{
		"name": "(G) red2 willis",
		"weight": 1,
		"events": [{
				"type": "SearchAndClick",
				"arguments": {
					"queryText": "red willis",
					"docClickTitle": "RED 2",
					"probability": 0.50
				}
			}]
		}, {
			"name": "QC(Eye of the Tiger, 95%)",
			"weight": 1,
			"events": [{
				"type": "SearchAndClick",
				"arguments": {
					"queryText": "Eye of the Tiger",
					"docClickTitle": "Eye of the Tiger by Survivor",
					"probability": 0.95
				}
			}]
		}, {
			"name": "QC(The Rock, 95%)",
			"weight": 1,
			"events": [{
					"type": "Search",
					"arguments": {
						"queryText": "The Rock",
						"goodQuery": true
					}
				},
				{
					"type": "FacetChange",
					"arguments": {
						"facetTitle": "Supporting people",
						"facetValue": "Dwayne Johnson",
						"facetField": "@mypeople"
					}
				}
			]
		}, {
			"name": "QC(Eye of the Tiger -> Rocky IV, 85%)",
			"weight": 1,
			"events": [{
				"type": "Search",
				"arguments": {
					"queryText": "Eye of the Tiger",
					"goodQuery": true
				}
			}, {
				"type": "SearchAndClick",
				"arguments": {
					"queryText": "Eye of the Tiger Rocky",
					"docClickTitle": "Rocky IV",
					"probability": 0.85
				}
			}]
		}, {
			"name": "QC(Night at the Museum, 95%)",
			"weight": 3,
			"events": [{
				"type": "SearchAndClick",
				"arguments": {
					"queryText": "history museum",
					"matchField": "title",
					"matchValue": "Night at the Museum",
					"probability": 0.95
				}
			}]
		},
		{
			"name": "QC(Night at the Museum, 95%)",
			"weight": 3,
			"events": [{
				"type": "SearchAndClick",
				"arguments": {
					"queryText": "history museum",
					"docClickTitle": "Night at the Museum: Secret of the Tomb",
					"offset":10,
					"probability": 0.95
				}
			}]
		}, {
			"name": "GQ(fast racing) -> QC(Fast Five, 95%)",
			"weight": 4,
			"events": [{
					"type": "Search",
					"arguments": {
						"queryText": "fast racing",
						"goodQuery": true
					}
				},
				{
					"type": "SearchAndClick",
					"arguments": {
						"queryText": "fast racing",
						"matchField": "title",
						"matchValue": "Fast & Furious",
						"offset": 10,
						"probability": 0.85
					}
				},
				{
					"type": "SearchAndClick",
					"arguments": {
						"queryText": "fast racing",
						"docClickTitle": "Fast & Furious 6",
						"offset": 20,
						"probability": 0.95
					}
				},
				{
					"type": "SearchAndClick",
					"arguments": {
						"queryText": "fast racing",
						"docClickTitle": "The Fast and the Furious: Tokyo Drift",
						"offset": 30,
						"probability": 0.95
					}
				}
			]
		}
	]

}
```

And that is it! I hope you enjoyed it.

Special thanks to my colleague Jérôme Devost who helped me to build this!

from __future__ import print_function # Python 2/3 compatibility
import boto3
import json
import random
import datetime
import decimal
import requests
from boto3.dynamodb.conditions import Key, Attr
import boto3
from boto3 import dynamodb
from boto3.session import Session

myerr=''

#logging, both to myerr field and to document.log
def mylog(message):
    global myerr
    
    #Log using the normal logging
    document.log(message)
    myerr+=';'+message
    #Log using a field
    document.add_meta_data({"myerr":myerr})
    
    
#checks if URL exists
def check(myurl):
    try:
        res=requests.get(myurl)
        if (res.status_code==200):
            return True
        else:
            return False
        return res.status_code
    except Exception,e:
        return False

# Create error logging entry
mylog('Start')

# Get current metadata for geolocation
# TEST 3, this field is mapped from the ziplocation to myzip in the fieldmappings
city=document.get_meta_data_value('myzip')
mylog("Zip:"+' '.join(city))


# If city is there get the Lon/Lat from dynamoDB
if (city):
    try:
        found=False

        #Now we fetch the lat/lon from the db
        dynamodb_session = Session(aws_access_key_id='xxxx',
                  aws_secret_access_key='xxxx',
                  region_name='us-east-1')
        dynamodb = dynamodb_session.resource('dynamodb')
        table=dynamodb.Table('GEOCODE')
        mycity=city[0].lower()
        mycity2=mycity
        if (mycity.isdigit()):
            #Pad with zeros
            mycity2=format(mycity, '05')
        mylog("Execute query with city "+str(mycity2))
    
        response = table.query(
            KeyConditionExpression=Key('City').eq(str(mycity2)) 
        )
        for i in response['Items']:
            document.add_meta_data({"mylat2":str(i['Lat'])})
            document.add_meta_data({"mylon2":str(i['Lon'])})
            mylog("Getting lat"+str(i['Lat']))
            found=True
        
    except Exception,e:
        mylog("Error: "+str(e))
        
#document.add_meta_data({"myerr":myerr})

# Now lets add the random Availability
# We could get this also from the database, but this is a demo so we create it 
#----------------------------------------------------------
#Initialize, 3 months back, 3 years further
#----------------------------------------------------------

if (city):
    #Field to store the availability in
    mylog("Start avail")
    alldatesfield="mydateavail"
    alldates=""
    Date=datetime.datetime.now()
    currenthours=random.randint(0,40)

    dateBegin=Date+datetime.timedelta(days=-50)
    dateEnd=Date+datetime.timedelta(days=3*365)
    dateBeginP=Date+datetime.timedelta(days=10+currenthours)
    dateEndP=Date+datetime.timedelta(days=10+currenthours+15)
    dateBeginP2=Date+datetime.timedelta(days=60+currenthours)
    dateEndP2=Date+datetime.timedelta(days=90+currenthours)
    currenthours=random.randint(1,6)
    #print dateBegin
    #print dateEnd
    #Put all dates by day into a string
    tot=(dateEnd-dateBegin).days
    
    #print 'Total nr of days:'+str(tot)
    for i in range( 0,tot):
        thisdate2=dateBegin+datetime.timedelta(days=i)
        #currenthours=random.randint(0,8)
        hours=0
        if (thisdate2.month % currenthours)==0:
            hours=8
        
        #if ((thisdate2-dateBeginP).days>0 and (thisdate2-dateEndP).days<0):
         #   hours=8
        #if ((thisdate2-dateBeginP2).days>0 and (thisdate2-dateEndP2).days<0):
        #    hours=8
        if (hours>3):
            alldates=alldates+";"+str(thisdate2.year)+str(thisdate2.month).zfill(2)+str(thisdate2.day).zfill(2)

    #Put field in the inde        
    mylog("End Avail")
    document.add_meta_data({alldatesfield:alldates})
    
try:
    #Add the image since this could lead to timeouts...
    imagenr=int(document.get_meta_data_value('myrownr')[0])
    togetnr=imagenr % 1555
    #Get the thumbnail
    thumbnail = document.DataStream('$thumbnail$')
    mylog("Nr to get:"+str(togetnr)+" user:"+str(imagenr))
    myurl="http://www.myimage.com/images/me/"+str(togetnr)+".jpg"
    checkimg=check(myurl)   
    if (not checkimg):
        myurl="http://www.myimage.com/images/me/0.jpg"
    l = requests.get(myurl,timeout=4)
    #First authenticate - NO NEED HERE
    #be-aware of the timeout!
    #l = requests.get("http://graph.facebook.com/v2.8/"+str(togetnr)+"/picture",timeout=4)
    #Get the image
    #d = requests.get(imageurl[0],cookies=l.cookies)
    if "error" in l.content:
        mylog("No Image")
    else:
        thumbnail.write(l.content)
        mylog("Added Image")
        document.add_data_stream(thumbnail)
        
except Exception,e:
        mylog("Error: "+str(e))
        
    
#document.add_meta_data({"myerr":myerr})
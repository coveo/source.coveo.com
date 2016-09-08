---
layout: post

title: "Sitecore PowerShell Extension with Coveo"
tags: [Sitecore, PowerShell, Coveo for Sitecore, LINQ]

author:
  name: Simon Langevin
  bio:  Coveo for Sitecore Solution Architect
  image: slangevin.png
---

The excellent [Sitecore PowerShell Extension]  (https://marketplace.sitecore.net/Modules/Sitecore_PowerShell_console.aspx?sc_lang=en) allows you to return items from your index and display its properties in a friendly manner. All of this at a much faster speed than using the Content Search API. This is of course just one function of that rich extension.

<!-- more -->

Coveo has a [REST Search API] (https://developers.coveo.com/display/SearchREST/REST+Search+API+Home) which gives you the opportunity to send complex queries, but the advantage of the SPE is its usability across all your search providers. For example, I might want to compare the amount of results returned between might Lucene, Solr and Coveo indexes with the same script. 

##Example with Lucene

Thanks to CJ Morgan at [BrainJocks] (http://www.brainjocks.com/team) for providing me a basic SPE script with several examples.
This would usually work with Lucene, and I believe also Solr. It uses the sitecore_master_index with some custom GUIDs and templates.

```powershell

# This will return all items that have the template planogram within the the index sitecore_master
Find-Item -Index "sitecore_master" -Criteria @{Filter = "Equals"; Field = "_templatename"; Value = "Planogram"} 
 
# This will show 2 items with one being master and one being web
Find-Item -Index "sitecore_master" -Criteria @{Filter = "Contains"; Field = "_uniqueid"; Value = "{005ac360-4daa-4de7-b158-88b193f8f5bc}"}
 
# This is an example of how to do multiple filters at once
$filterParams = @(
        @{Filter = "Contains"; Field = "_uniqueid"; Value = "{005ac360-4daa-4de7-b158-88b193f8f5bc}"},
        @{Filter = "Equals"; Field = "_database"; Value = "web"}
    )   
Find-Item -Index "sitecore_master" -Criteria $filterParams
 
# This will return only a certain # of items for the sitecore_master index
Find-Item -Index "sitecore_master" -First 1000
 
# THis will allow me to view the properties of the index so I can do more work on it
# Powershell screen has a buffer so using Format-Table -Autosize to show it horizontally
# might not work the way you want.  It would be best to view it like this and then filter from there
Find-Item -Index "sitecore_master" -First 10 | Select-Object -Property *
 
# This will allow you to see the fields value of the index item
# and this is the information you will use in the Field variable for the Filter
Find-Item -Index "sitecore_master" -First 1 | select -expand "Fields"
 
# This will search by a particular version # and it has to be a Descendant of the items
$filterParams = @(
        @{Filter = "Equals"; Field = "_version"; Value = "2"}
        @{Filter = "DescendantOf"; Value = (Get-Item master: -ID "{B03731AD-B04C-41B6-944C-D21BBC5926D4}") }
    )
 
Find-Item -Index "sitecore_master" -Criteria $filterParams -First 10
 
 
# When the items are returned using Find-Item they are not true Sitecore Items but instead
# are "Sitecore.ContentSearch.SearchTypes.SearchResultItem" items so to make them into regular
# Sitecore items you have to add Initialize-Item to the end of the results like below
$filterParams = @(
        @{Filter = "Equals"; Field = "_version"; Value = "2"}
        @{Filter = "DescendantOf"; Value = (Get-Item master: -ID "{B03731AD-B04C-41B6-944C-D21BBC5926D4}") }
    )
 
Find-Item -Index "sitecore_master" -Criteria $filterParams -First 10 | Initialize-Item
 
 
# Filter by other parameters as well
$filterParams = @(
        @{Filter = "StartsWith"; Field = "_fullpath"; Value = "/sitecore/content/Markets/301UnitedStates_301/Snippets/Detailed Business Reviews"}
        @{Filter = "Equals"; Field = "_language"; Value = "en" }
        @{Filter = "Equals"; Field = "_template"; Value = "6bf27a02e6064608b7d3f02ea3a30955"}
    )
 
$item = Find-Item -Index "sitecore_master" -Criteria $filterParams -First 10 #| Initialize-Item
$item
#$item.Fields | Format-List -Property *


```

##Example with Coveo

Coveo has a few unique twists in the way it handles fields. This new example is based on the Coveo_Master_index , which is created by default when installing the package. Take some time to read the examples, I will explain the changes in the next section.

```powershell

# This will return all items that have the template article group within the the index Coveo Master
Find-Item -Index "Coveo_master_index" -Criteria @{Filter = "Equals"; Field = "_templatename"; Value = "Article Group"} 

# This will return 1 single item
Find-Item -Index "Coveo_master_index" -Criteria @{Filter = "Contains"; Field = "_uniqueid"; Value = "{A5CDBC19-FFEA-4801-81A6-2B87F318B275}"}

# This is an example of how to do multiple filters at once
$filterParams = @(
        @{Filter = "Contains"; Field = "_uniqueid"; Value = "{A5CDBC19-FFEA-4801-81A6-2B87F318B275}"},
        @{Filter = "Equals"; Field = "_database"; Value = "web"}
    )
Find-Item -Index "Coveo_web_index" -Criteria $filterParams -First 10

# This will return only a certain # of items for the selected index
Find-Item -Index "Coveo_master_index" -First 100

# THis will allow me to view the properties of the index so I can do more work on it
# Powershell screen has a buffer so using Format-Table -Autosize to show it horizontally
# might not work the way you want.  It would be best to view it like this and then filter from there
Find-Item -Index "Coveo_master_index" -First 10 | Select-Object -Property *

# This will allow you to see the fields value of the index item
# and this is the information you will use in the Field variable for the Filter
Find-Item -Index "Coveo_master_index" -First 1 | select -expand "Fields"

# This will search by a particular version # and it has to be a Descendant of the items
$filterParams = @(
        @{Filter = "Equals"; Field = "_version"; Value = "2"}
        @{Filter = "DescendantOf"; Value = (Get-Item master: -ID "{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}") }
    )
Find-Item -Index "Coveo_master_index" -Criteria $filterParams -First 10


# When the items are returned using Find-Item they are not true Sitecore Items but instead
# are "Sitecore.ContentSearch.SearchTypes.SearchResultItem" items so to make them into regular
# Sitecore items you have to add Initialize-Item to the end of the results like below
$filterParams = @(
        @{Filter = "Equals"; Field = "_version"; Value = "2"}
        @{Filter = "DescendantOf"; Value = (Get-Item master: -ID "{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}") }
    )
Find-Item -Index "Coveo_master_index" -Criteria $filterParams -First 10 | Initialize-Item


# Filter by other parameters as well
$filterParams = @(
        @{Filter = "StartsWith"; Field = "_fullpath"; Value = "/sitecore/content/Home/Team/Brandon-Royal"}
        @{Filter = "Equals"; Field = "_language"; Value = "en" }
        @{Filter = "Equals"; Field = "_template"; Value = "97963d48bd0646ca8279cd2ba3c7aa36"}
    )
$item = Find-Item -Index "Coveo_master_index" -Criteria $filterParams -First 10 | Initialize-Item
$item
$item.Fields | Format-List -Property *


```

##What is different?

Please load the file in an IDE to see the line numbers.

Line 24 and 28 will fail by default, since Contains is considered an advanced field query in Coveo, which required the field to be a facet. I would not recommend to make _uniqueid facet however, since it contains a lot of unique values.

Still on Line 24, I changed the comment since Coveo will usually create one index per database, which mean that the _uniqueid field will return a single value, not two.

Line 33,  I changed the First 1000 to 100, since Coveo by default will return less values for performance reasons. You can increase this value in the config file: https://developers.coveo.com/display/SitecoreV4/Retrieving+Large+Sets+of+Items+Using+LINQ

Line 67, _template does not contain any dashes when indexed by Coveo, templateid will however. So I removed the dashes in my query, but I could also simply change the field for templateid

And that's it! Thanks again to [Cognifide] (https://www.cognifide.com/) for creating the module and to anyone who contributed to it.


---
layout: post

title: "Rating a Search Result, Customizing Search Results Ranking and Ranking Functions"
#subtitle: "Part 4"


author:
  name: Karel Mpungi
  bio: Product Expert, Advanced Enterprise Search Platform
  image: kmpungi.jpg
---

## Rating a Search Result

### What is the advantage of rating a search result

Rating a search result is useful when you find that its automatic ranking in the current query is not appropriate from your point of view or that of your group. 
This immediately changes its position in the search results page. You or other members of your group also benefit from this corrected rating the next time the same query is performed.

It’s important that you understand the difference between “Personal appreciation” and “Collaborative rating”

### Personal appreciation

Personal appreciation is a score that you, as a user, can assign to a document or item to reflect your perception of its relevance to the query. By rating a search result on a 1 to 3 yellow stars scale![Full Yellow Stars]({{ site.baseurl }}/images/FullYellowStars.png)
you can influence the search result ranking. The Coveo Platform uses your personal appreciation to immediately modify the ranking of a search result and to calculate its collaborative rating.


### Collaborative rating

The Coveo Platform calculates collaborative rating as an average of the personal appreciations given to each document by users of the same group and uses it as one of the ranking factors. 
Because this process is performed independently for each user group, it adapts ranking to different types of users.
Collaborative rating appears as a 1 to 3 gray stars![Two grey stars score]({{ site.baseurl }}/images/Twogreystarsscore.png)score (two stars by default when nobody has ranked the search result) under each search result.

The screenshot below shows a document with a two stars collaborative rating. Under ranking weights tab, you can see that collaborative rating weight is 412 and the total weight of the document is 6834. 

![Collaborative rating default]({{ site.baseurl }}/images/Collaborativeratingdefault.png)

If I decide to give a three yellow stars personal appreciation to the document (just by clicking on the third star), now the collaborative rating weight is 500 and the total weight of the document is now 6922.

![Collaborative rating 3 yellow stars]({{ site.baseurl }}/images/Collaborativerating3yellowstars.png)

So when I perform a “tax” query, this document will be ranked higher on my search result page compared to the search result page of the other user from my group. 
The reason behind that is that personal appreciation prevails on collaborative rating meaning that, once you rate a search result, its collaborative rating score is no longer taken into account. 

Now If I asked to someone from the same group as mine to check the collaborative rating of the same document, it will be higher than what it was before I gave it a personal appreciation.

![Collaborative rating 2 grey star]({{ site.baseurl }}/images/Collaborativerating2greystar.png)

Note: You need to wait until the next update of document rating in order for your rating to take effect.
If you go to `CES Admin tool –> Configuration –> Schedules –> System`
Check the schedule of “Update Document Rating”, by default it’s once a week, but you can change it as you like.

![Update Document Rating]({{ site.baseurl }}/images/UpdateDocumentRating.png)

### Where should I go to create/Modify group for Collaborative rating

You can do it from in the `CES Admin tool –> Index –> Ranking –> Collaborative Rating`.

![Modify group for Collaborative rating]({{ site.baseurl }}/images/ModifygroupforCollaborativerating.png)

### Removing or modifying a personal appreciation

To delete your personal appreciation for a document, right-click on the yellow stars:
The document rank is immediately adjusted according to the automatic relevance score in the search results list and the appropriate number of gray stars![Two grey stars score]({{ site.baseurl }}/images/Twogreystarsscore.png) appears.

To modify your personal appreciation:
Click the appropriate yellow star to assign your personal appreciation. 
For example, if the personal appreciation was three yellow stars![Full Yellow Stars]({{ site.baseurl }}/images/FullYellowStars.png),click on the first yellow star and your personal appreciation will be one![One Yellow Stars]({{ site.baseurl }}/images/OneYellowStars.png)  star instead of three.

## Customizing Search Results Ranking

CES uses 18 ranking factors divided into 6 types to calculate the relevance score of documents. CES natively uses pre-tuned ranking weights that are likely to be satisfying most of the time. 
Nevertheless, fine-tuning these factors can sometimes increase accuracy, especially for specific situations. 
Click [here](http://onlinehelp.coveo.com/en/CES/7.0/Administrator/Customizing_Search_Results_Ranking.htm) for more information.

## Ranking Functions

Ranking functions are like [Query Functions](https://developers.coveo.com/display/SearchREST/Query+Function), but the result of the computation is used to influence ranking, just like Query Ranking Expressions. 
The computation is done in the ranking's first phase, meaning that all documents will have a chance to receive the ranking runction's boosts.
If NormalizeWeight is enabled, the entire value domain of the function will be taken into account to give a normalized boost ranking from 0 to 600. 
By enabling ranking information, it is possible to see the actual boost value provided by the functions, for each document.

For more information about ranking functions look at the [Ranking function documentation](https://developers.coveo.com/display/SearchREST/Ranking+Function)


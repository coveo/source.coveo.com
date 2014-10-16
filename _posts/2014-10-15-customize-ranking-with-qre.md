---
layout: post

title: "Customize Ranking with QRE"

tags: [QRE, Ranking]

author:
  name: Karel Mpungi
  bio: Product Expert, Advanced Enterprise Search Platform
  image: kmpungi.jpg
---

A query ranking expression (QRE) modifies the ranking score of search results matching a query expression.

## What is the impact on the final ranking score?

The QRE feature is computed during the first phase of the ranking algorithm. This will have an impact on all documents, especially in case where it's only the QRE that boost the document's weight.

<!-- more -->

Since the September 2013 build, a QRE interface was added to the Interface Editor. The QRE interface can be found under Interface Editor - Search Interfaces – Features - Ranking.

![The QRE Interface]({{ site.baseurl }}/images/QREInterface.png)

With this interface, QRE can be modified directly from the Interface Editor without using CES. All QRE created within the Interface Editor are specific to the search interface that is selected in "current Interface" dropdown menu. Therefore, the QRE will affect every queries made in that search interface. 

## Example

A query is made for "pdf", as you can see the first result is not a pdf file. We can boost PDF type document weight by using QRE.

![Total Ranking Weight]({{ site.baseurl }}/images/TotalRankingWeight.png)

A QRE is made for @sysfiletype=="pdf" query expression and the +100 modifier value. In the search results, all documents for which PDF is the file type will have 1000 added to their normal ranking score. The ranking score of returned documents with other file types is not affected.

![Adding a QRE]({{ site.baseurl }}/images/AddingQRE.png)

![QRE Modifier]({{ site.baseurl }}/images/QREModifier.png)

The impact on the final score is:

- (+100) will increase your document QRE weight by 1000
- (+50)  will increase your document QRE weight by 500
- (-50) will decrease your document QRE weight by 500
- (-100) will decrease your document QRE weight by 1000

You can also select "custom" in order to enter a custom value.

Now if we perform the same query, some PDF type documents will be listed first.

![QRE Value]({{ site.baseurl }}/images/QREValue.png)

## Why is there a QRE by default for some documents and not for the others?

![Document with a QRE Value]({{ site.baseurl }}/images/AsQREValue.png)

![Document wihtout a QRE Value]({{ site.baseurl }}/images/AsNoQREValue.png)

You need to compare the language of your search interface versus the @syslanguage of the document in CES Admin tool – Content – Index Browser

![Document Language]({{ site.baseurl }}/images/DocumentLanguage.png)

- If the language of the document matches the language of the search interface, the QRE of the document will automatically be: 600.
- If the language of the document doesn't match the language of the search interface or @syslanguage is missing under the Field tab, then the QRE of the document will automatically be: 0

## How to Implement QREs?

- An administrator can add QREs to specific search interfaces from the Interface Editor for a search interface (see [Customizing the Ranking for a Search Interface](http://onlinehelp.coveo.com/en/CES/7.0/Administrator/Customizing_the_Ranking_for_a_Search_Interface.htm)) or for a Related Results panel (see [Adding or Customizing a Related Results Panel](http://onlinehelp.coveo.com/en/CES/7.0/Administrator/Adding_or_Customizing_a_Related_Results_Panel.htm#qre)).
- A developer can implement QREs programmatically (see [Adding Query Ranking Expressions to a Search Interfaces](https://developers.coveo.com/x/OIAl)).

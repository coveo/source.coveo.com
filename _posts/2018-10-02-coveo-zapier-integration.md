---
layout: post

title: "Using the Coveo Zapier App to Index Trello"

tags: [Zapier, Trello, Coveo Labs]

author:
  name: Alex Moreau
  bio: Product Analyst - Coveo on Elasticsearch
  twitter: amoreauCoveo
  image: amoreauCoveo.png
---

At Coveo, there's one thing we like above all: making sure we have all the data we might need at the same place. Coveo already offers a [plethora of connectors](https://docs.coveo.com/en/1997/cloud-v2-administrators/available-coveo-cloud-v2-source-types) to do so, but there are still many more places where you can have relevant data.

Enter [Zapier](https://zapier.com), a web service that allows you to connect different applications or services together, to perform actions in an application when something happens in another. With over 1000 available apps, it soon became clear that a Zapier integration would be a great solution to surface all that data.

<!-- more -->

## Creating the Coveo Integration in Zapier

This summer, the [Coveo Labs](https://github.com/coveo-labs) team decided to create a [Coveo integration in Zapier](https://zapier.com/apps/coveo/integrations), so we could quickly and easily add items from various applications in an index without having to create a new custom connector every time.

The integration works in a simple way: when an event happens in a specified application, Zapier either adds, updates, or deletes an item from your Coveo index. To do so, Zapier uses a [Push source](https://docs.coveo.com/en/1546/cloud-v2-administrators/add-edit-push-source---panel) in your Coveo organization.

## Requirements

To be able to use the Coveo Integration in Zapier, you first need to create the following things in Coveo:
- A Coveo organization
    
    This almost goes without saying; you can't add data to your Coveo index if you don't have a Coveo index to begin with. If you don't already have a Coveo organization, you can [Contact Coveo](https://www.coveo.com/en/contact) to get a trial one.

- A Push source in your Coveo organization
    
    Zapier needs to push the data somewhere, and the Push source is the best place to do that. You are encouraged to create a new Push source for your Zapier integration if you already have one. This way, it will be simpler to filter your data.
    
    To create a Push source in your Coveo organization, see [Add/Edit Push Source](https://docs.coveo.com/en/1546/cloud-v2-administrators/add-edit-push-source---panel).

## Limitations

The Coveo integration on Zapier comes with a few limitations. Due to the nature of those limitations, we don't suggest people use the integration in a production environment. Instead, we encourage people to use it for proof of concepts or for demos.

With that disclaimer being out of the way, the Coveo Integration has the following limitations:

- There is no initial crawl of the application. Since Zapier functions on a "When this happens, do that" principle, you usually only get information on the items that were interacted with in the original application. This means that all of the information that is already there but is kept untouched will not be available in your Coveo index unless you find a way to push it there yourself.

- You cannot index permissions on an item. Usually, when using Coveo, a user can only receive results to items which they can actually access. However, by using the Zapier integration, Coveo is unable to index the proper permissions and securities, which means that all users who have access to your search interface will also have access to those indexed items.

- If an action you perform fails to get through to Zapier and be forwarded to Coveo, the change, addition, or deletion is never made in Coveo. While this is not necessarily likely to occur, the addition of Zapier as a middle-man between your application and Coveo does add more potential for irregular search results.

Now that we have the limitations out of the way, we can dive straight into how I used our Zapier integration.

## Indexing Trello cards in a Coveo index

[Trello](https://trello.com/) is a great tool to keep track of things to do, and I use it in both my professional and personal life. However, being the usual geek that I am, I like to have all of my information at the same place. And that, to me, means being able to index all of the data that's relevant to me in my Coveo index to make it accessible in my Coveo Search page.

The Coveo Zapier integration allows me to do just that.

### Figuring out which metadata I need

The first step I needed to do before even starting to index was to figure out which metadata I wanted to have in my Coveo index.

After thinking for a few minutes, I figured that I would need the following mappings:

- URI/Document ID: In Coveo, every item must have a URI. I used the `trello://` prefix followed by the card ID for this option, ensuring that all cards have a unique URI.
- Title: This is used as the name of the item in Coveo. I mapped it to the Card title.
- Date: This is used a lot inside Coveo, for example when sorting by date, or when determining which item is more relevant. I mapped it to the `DateLastActivity` metadata from the Trello card.
- Content Url: This is the URL that points to the actual Trello card. It is used as the Result Link in Coveo, so you can click on your results and get to the original data.
- Body: While not always present in Trello, I wanted to see when I had a description written in my Trello card. Body is also used in Coveo for the quickview.
- Status: I wanted to see the list in which my card was, and I thought that a `status` field would solve this issue. This one was a bit more tricky, for two reasons:

    The first tricky thing is that `status` is not a default field inside Coveo. This means that I have to [create the field inside the Coveo platform](https://docs.coveo.com/en/1833/cloud-v2-administrators/fields---page). I named the field `status`, so it gets picked up automatically by the source mapping. Since I want the status to be a facet in my search page, I checked the **Facet** option when creating the field.
    
    The second, and most tricky thing, is that within Zapier, Trello does not give me access to the name of the list where the card is. However, it does give me access to its List ID. I thus decided to add the `List Id` as the status of my card, and create an Indexing Pipeline Extension that replaces the `Id` with the actual name of the list.

### Creating the Indexing Pipeline Extension

[Indexing Pipeline Extensions](https://docs.coveo.com/en/1556/cloud-v2-administrators/indexing-pipeline-extension-overview) offer a way to modify the data you are indexing before it reaches the index. For this use case, I created one to change the ID of the list into its appropriate name.

The code I used for my extension was this one:

```python
status = document.get_meta_data_value('status')[0]
list_ids = ["5bb4c5d36613ae87739d777b", "5bb4c5ad1ba49d1942cf5cd0", "5bb4c5b68a709044412afdd4", "5bb4c5b9645fb6677b50097d", "5bb4c5d9d9e46c111212dda2", "5bb4c5c04a2e263ee7db3d6e"]
list_titles = ["Current Sprint", "To Do - Today", "In Progress", "Done", "Backlog", "Archived"]
i = 0
for i in range(0, len(list_ids)):
  if status == list_ids[i]:
    status = list_titles[i]

document.add_meta_data({'status': status})
```

There are a few ways to get the IDs of your lists. I used Zapier, which gave them to me while I was setting up the Trello integration.

Once the extension was created, I added it as a post-conversion scrpt to my **Trello** Push source, and I was all set up and ready to go.

### Adding an item in my Coveo index when I create a new Trello card

With the source now set up properly, I was ready to start creating my Zaps.

The first and most obivous place to start was simply adding all newly created Trello cards to my Coveo index. This simply means that when a new card is created in Trello, it will be added to my Coveo index.

To get started, I used the existing `Index new Trello cards in Coveo Cloud` template available with the [Coveo integration](https://zapier.com/apps/coveo/integrations).

After connecting to my Trello board and to my Coveo organization and source, I only needed to add the following options in Coveo:
- For the **Date** option, I selected the `Date Last Activity` metadata.
- Under **Fields**, I entered `status` and chose the `ID List` metadata for its option.

Then, I activated my Zap, and now all the new cards I created were in my Coveo index. But I wasn't done.

### Update Cards in the index when you change them

Like most Trello users, I use my lists as a Kanban board, so my cards will oftentimes change lists. I wanted this to be reflected in my Coveo index.

Thankfully, the Trello Zapier integration offers the **New Activity** action with a variety of options. One of those options is `Card Changed`, which is triggered every time a card is changed, including changing lists. This is exactly what I wanted for my integration.

It is important when adding a new action to reuse the same mappings as you did for the previous actions. Otherwise, you can get some funky behaviours, like some fields metadata being wrongfully deleted or overwritten, or having multiple instances of the same item.

Once I was done setting up this Zap, I was ready to add the final one.

### Deleting archived Trello cards

As the most keen out of you might have noticed, I have an **Archived** list in my Trello board. This is where I migrate the cards from my **Done** list at the end of the sprint. I like to have easy access to the stuff I've completed even after I've completed it, so I preferred having an Archive list over using the default Trello archive.

This means that the only cards I send to the Trello archive are the cards I created by error, or duplicates I've created without realizing. This thus falls in the perfect use case for the **Delete archived Trello cards from Coveo index** [Zap template](https://zapier.com/apps/coveo/integrations) that comes with Coveo.

Since this Zap uses the `Delete` instead of the `Add/Update` action, I simply needed to ensure that the URI of my element was formatted the same way it is in my other Zaps.

And voilà! I was now done setting up my connection between Coveo and Trello using Zapier, and all of my Trello cards could now be accessed directly on my Coveo search page.

![My Search Page, featuring Trello cards.](/images/20181002-Zapier/trellosearchpage.png)

## Conclusion

I would be lying if I said that integrating Trello to my Coveo index using Zapier was without hurdles. But the problems that I encountered when initially setting everything up were in part because I was doing everything for the first time. Hopefully, with this blogpost, you'll have a better idea of what to do when creating your own Coveo integration.

You are more than welcome to try your hand at our Zapier integration with any of the other Zapier integrations. If you find some other nice use cases with Zapier, don't hesitate to [tweet at us](https://twitter.com/Coveo) and let us know how you are integrating Coveo with other applications. I would personally love to know!

You can also have a look at [Zapier's own blogpost on the new Coveo integration](https://zapier.com/blog/updates/1828/coveo-integrations). If you prefer to have another Coveo point of view, I welcome you to have a look at [Coveo's official blogpost on the matter](https://blog.coveo.com).
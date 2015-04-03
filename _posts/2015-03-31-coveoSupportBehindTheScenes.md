---
layout: post

title: "Coveo Support Behind the Scenes"

tags: [Support, Coveo for Salesforce, Coveo Platform Advanced]

author:
  name: Eric Savoie
  bio: Coveo for Salesforce Product Specialist
  twitter: savoieric
  image: esavoie.jpg
---

#Coveo Support Behind the Scenes

Hello everyone, my name is Eric Savoie and I am a product specialist here at Coveo since July 2014. I’m the second product specialist hired with the objective of specializing in the support of our Coveo for Salesforce product.
Through the months, I have come to realize that support in the cloud is very different from “conventional” support here at Coveo. For this post, I originally wanted to concentrate on the main differences between what we call Platform support and Cloud support but I realized that many out there would not be able to relate to those differences without an introduction to the product specialist’s reality.
So here is an overview of how the communication between support and the client looks like at Coveo. It might help some of you understand what happens between the different interactions we have through a case opened in the community.
Before we start, I would like to mention that the support department at Coveo is not a call center. The reason for this is because we are selling our solution to enterprises (B2B) and not to individuals, which means that the end user will almost never contact us directly.
Individual problems will be assessed by their system administrator (typically the IT department). When the system administrator is in need of support, he contacts us so we can bring in our expertise. Now, let’s start by the beginning shall we?

<!-- more -->

When a system administrator (referred to as client for the rest of this post) has a problem he cannot troubleshoot using our [documentation](http://onlinehelp.coveo.com/en/ces/7.0/), his best option is to open a case through our [community](https://coveocommunity.force.com/customers/login).
I can see you already have some questions, let’s answer them right now:

####Why should I open a case instead of calling directly?

Because Coveo is a very complex software platform, a product specialist will rarely be able to troubleshoot an issue on the spot. Most of the time, he will need to search through the documentation or consult an expert on a specific part of the software.
Also, he will most likely need lots of additional information that cannot be easily transmitted over the phone. A case allows us to track the progress on an issue more efficiently and to use it as documentation for future problems.
This is why all our efforts are concentrated on managing the community as efficiently as possible. When a client opens a case in the community, a first response will most of the time be given the same day.
Also, when opening a case through the customer portal, a client will be suggested knowledge base articles as he types in the title of the case. This is made possible by using our own product and querying the index as the client types.

![](/Images/caseCreationSearch.png)

####When is it a good idea to use the phone then?

The phone is very useful in the case of an emergency, especially when we are outside of business hours which are between 6:00 and 18:00 EST. When calling over the phone off-hours, the client has to leave a voicemail.
A best practice would be to open a case prior to calling support and to mention the case number in the voicemail. That way, the product specialist can immediately have access to the necessary information and start his investigation right away.
It’s also easier to track the history of the issue through a case. When a voicemail is left, a member of the support team is immediately notified, will listen to it and contact the client as soon as possible.
Again, if a case is open, a meeting invitation can be sent through it and contact with the client can be established sooner.

In case of an emergency, a client should always call our department after creating a case. That way, he can raise the flag on the particular issue that demands our immediate attention. Otherwise, the case will be treated according to the priority we assign it.
Assigning priority to a case can only be done using the information contained within the case. This is why the more information we have in the description, the better we will be able to respond appropriately.

##Submitting the right information

Right off the bat, here is some information that any product specialist likes to see when he is assigned a new case.

**Subject:** A subject should mention what the issue is about without getting into details. For example: “[NameOfTheError] when performing [ThisSpecificAction]” would be a very good subject for a new case, given the brackets are adequately replaced.

**Description:** A description is best based on the actual facts about what is happening at what moment rather than on anyone’s interpretation of the problem. Basically, we should have enough details in here to be able to reproduce the issue on our end.
As many expressions may vary from one person to another, a screenshot is often the best way to let the product specialist know where the error occurs and what it looks like. It’s better to take all the screen and bring the attention of the reader to specific parts using basic drawing tools than to take a screenshot that is too specific and cuts away the context.

**Back-End version and build number:** Since many issues are corrected in each of our bi-monthly builds, it’s very likely that a client may be experiencing an issue that has been corrected in later builds.
Of course, the best advice I could give any Coveo user would be to always update to the latest version. However, when we are dealing with an old build, we know it might be a good idea to see if the issue was assessed in recent builds.
Knowing this information from the start can prevent a distracted product specialist from repeating an investigation that was previously made, or prevent an experienced one from having to ask the build number in his very first reply.

**System level:** If the issue is occurring on a test server, it will not be assigned the same priority as the one occurring on a production server. The sooner we know on what kind of server it’s occurring the sooner we can set our priorities straight and prevent any bad surprises for everyone.

**Product:** In the case creation page, there is a field called “Product”. This field should be filled with the product from which the issue is stemming. This information will determine to which team the case will go and will greatly affect the way we manage it. It will also allow a faster dispatch of the case to the right product specialist.

![](/Images/caseProductInfo.png)

##New case in the console

Upon receiving a case, we dispatch it to the appropriate team within the support department. There is one team for each line of business: Coveo Enterprise Search, Coveo for Sitecore and Coveo for Salesforce/Cloud.

Some pieces of information are asked on a regular basis. The config.txt file, located in the “CES7/config” folder contains all the information about the configurations made in the Coveo Administration Tool.
We must often verify this in order to determine if the issue could stem from the way Coveo is configured. The logs are also a valuable piece of information for us, they are located in the “CES7\Log” folder.
They contain all the information about what operations were performed by the service (System logs), what was modified in the index (Index logs) and what was queried (Queries logs). This is why in most cases a product specialist will ask you to send certain types of logs and your configuration very early on.
When we can’t figure out the cause of the issue with the Coveo logs, there may have been something caught by the Windows logs. These logs can be found in the “Event Viewer”.

## 
![](/Images/whatsupdoc.jpg) 

To end on a lighter note, we could easily make the analogy that we are “Coveo doctors”.

Just like a doctor will evaluate symptoms in the body and associate it with a disease or infection, we must associate the symptoms in the software with a bug or misconfiguration.

Just like a doctor may only have to prescribe a certain pill, our solution may only be to check a certain box or add a parameter. However, you want to use the right pill so, you have to be sure you found the right problem or you might end up creating another one in the end.

Just like a doctor may have to enter his patient into a long treatment, we may have to change a lot of settings, fix some bugs in the software and monitor the progression of the issue. And just like with a doctor, clients prefer solving their own problem without having to go to us.

This is something every support department should understand. The client very much prefers not having to resort to calling for your aid. Not because he doesn’t trust or is dissatisfied with the service but because he simply prefers solving his problems himself.
This is why we are working on giving our customers the right tools for the right job when they need them. Using our awesome search application, we are able to query our documentation while the client types in his problem, which gives him a chance to find the right information before having to contact us.
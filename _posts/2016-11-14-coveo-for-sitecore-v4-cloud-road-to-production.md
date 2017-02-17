---
layout: post

title: "Coveo for Sitecore V4 Cloud - The Road to Production"
tags: [Sitecore, Cloud, Coveo for Sitecore, Environment]

author:
  name: Simon Langevin
  bio:  Coveo for Sitecore Solution Architect
  image: slangevin.png
---
Coveo for Sitecore 4.0 was released this spring and allowed Coveo for Sitecore users to move their index to the cloud, reducing maintenance effort and opening the way for the advanced cloud features, such as Reveal machine learning and the query pipelines.
Integrating Coveo for Sitecore to your Sitecore solution is now easier than ever. You can download the package directly on [the Coveo website](http://www.coveo.com/en/solutions/coveo-for-sitecore/download) and follow the installation wizard in Sitecore.
This is great to try the product with a trial organization, but how do you manage a paid license?
I received several questions in the past few months about environment setup and license management. In this blog post, I will try to clarify a few things.
<!-- more -->

## What kind of organization do I get when I purchase Coveo for Sitecore?

All Coveo for Sitecore cloud plans offer a Production and Sandbox cloud organization. The owner of the organization is the recipient of the license. 
The Coveo license team rarely accepts changing the owner for you due to legal and security concerns. This means that you, or your client, need to manage access to the organizations.
Inviting members is a straightforward approach documented [here](https://developers.coveo.com/x/AocdAg).
Once a member is assigned as an Administrator, he or she can manage the invites in the future.

## What about integrators?

Out of the box, Coveo Cloud has two groups: Administrators and Users. Users have very limited privileges, which are not sufficient for a Coveo for Sitecore developers. 
You can add integrators to the Administrator group, but they will then have the same powers as you, including the ability to invite members and to give them administrator privileges. 
This might not be the best solution for integrators hired from an external agency. The Coveo documentation team wrote a help page to [create a group with restricted privileges](https://developers.coveo.com/x/14AkAg). 
This page can help you create a group with access to everything except groups and members control. The decision to remove other privileges mostly depend on your security policy. 
For example, you might want to give read access to the Usage Analytics or Index Content on the sandbox organization, but remove that privilege in production.

## Where do I code? Where do I test?

As a best practice, I would tend to limit my sandbox organization for testing only. For development, you can either purchase an additional organization, or use trial organizations.
This is also a good strategy when multiple developers are coding on different copies of your instance. Each of them can have their own organization to code and test against.
The trial organizations are only valid for one month, but creating a new one is very easy. Simply go to the Sitecore Control Panel and choose Configuration in the Coveo Search Menu. From there, you can use the Coveo Cloud Organization feature to connect to Coveo Cloud. Once you are redirected back to Sitecore, you will be given the option to create a new organization. This new org will not be configured, but rebuilding your indexes will do the trick.

![Coveo for Sitecore Cloud Configuration](/images/CoveoForSitecoreV4Cloud/NewOrg.PNG)

The only limitation with this approach is when it comes to external content. You will lose the configuration of external sources every month, but be aware that you can access the JSON of your source from the Cloud Administration Console. Keeping this JSON and copying it in another organization will re-create the source.

![Coveo Source JSON](/images/CoveoForSitecoreV4Cloud/EditJSON.PNG)

In summary, it would look like the following

![Coveo for Sitecore Cloud Environment](/images/CoveoForSitecoreV4Cloud/CloudEnv.PNG)

The diagram above is in a scenario where each developer has access to a unique Sitecore and database farm. If all the developers are sharing the same Sitecore, then a single Coveo organization will be sufficient. 
In this case, Coveo for Sitecore needs to be configured according to [the Scaling Guide](https://developers.coveo.com/display/SitecoreV4/Coveo+for+Sitecore+Scaling+Guide).
I hope this answers a few questions about how to get started with Coveo for Sitecore cloud.

If you have any questions, do not hesitate to post on [Sitecore Stack Exchange](http://sitecore.stackexchange.com/).

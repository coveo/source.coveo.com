---
layout: post

title: "Coveo for Sitecore 5 - Product Manager Blog"

tags: [Sitecore, Coveo for Sitecore]

author:
  name: Simon Langevin
  bio: Coveo for Sitecore Sr. Product Manager | Sitecore Strategy MVP 2018
  image: slangevin.jpg

---

Coveo for Sitecore 5 is now publicly available. Two years have passed since the release of the version 4, which paved the way for Coveo Cloud.

The Cloud adoption allowed Coveo users to quickly deploy their Coveo solutions and gave users access to powerful features such as Usage Analytics, Machine Learning, and cloud connectors.

Now that Coveo for Sitecore is fully connected to Coveo Cloud and managing an infrastructure is no longer a worry, we decided to focus on the integration into the Sitecore technology stack. The goal is to make every project faster and easier to deploy, so that you can spend more time building the cloud relevance engine you want, and less time in configuring the index and search interface underneath.
<!-- more -->

To reach this goal, we focused on four key principles:

* Compatibility
* Flexibility
* Agility
* Performance

In this blog post, I will explain how Coveo for Sitecore 5 benefits from improvements in all of the points above.

## Compatibility

Are you using Sitecore xConnect, Sitecore Experience Accelerator (SXA), or Sitecore Commerce? We support the most popular Sitecore features and modules.

Are you deploying in Azure Web Applications or in your private server farm? We support all Sitecore deployment scenarios.

Are you using continuous deployment and delivery to manage your Sitecore instances? Coveo for Sitecore 5 now has a set of APIs allowing you to perform remotely, all of the operations currently available in a UI. Using the scripting language of your choice you can activate Coveo for Sitecore, manage the fields which need to be indexed, configure indexing options, start a rebuild, and perform many more configuration actions.

We will keep supporting all of the above and make sure that Coveo will fit in any deployment, with any modules and with the deployment scenario of your choice. No other search and recommendations engine is this deeply integrated with Sitecore.

## Flexibility

In the earlier versions of Coveo for Sitecore 4, the Coveo JavaScript UI was not used at its full potential inside of Sitecore. Creating search pages was easy, but extending and customizing them often required code that would complexify future upgrades.

Version 4.1 introduced the Coveo for Sitecore Hive Framework, which allowed content authors and developers to build search interfaces and search driven listings from the ground up, offering maximum flexibility while reducing the upgrade complexity. The Hive framework became a fan favorite amongst the Coveo community and will now be the only framework in Coveo for Sitecore 5, allowing us, the product team, to fully focus on its deployment and simplify the documentation.

The Hive framework is now available in a SXA format, which means that you can drag and drop Coveo Hive search component in any SXA projects.

At indexing time, the HTML crawler has been improved to support different authentication mechanism and website architecture, greatly reducing the complexity of extracting HTML content from your Sitecore instance.

All of the above is to ensure that Coveo for Sitecore 5 is not only the most featureful search and relevance engine in Sitecore, but is also the easiest to deploy and customize.

## Agility

The previous indexing process was a bit vague for newcomers and veterans alike. The Sitecore Indexing Manager did not offer much when it comes to feedback, which meant that users had to dig into logs to find the relevant information. Field management was done in the configuration files, forcing users to require server access for every field inclusion and exclusion. The Coveo for Sitecore Command Center centralizes all configurations related to indexing, field management, and cloud communication actions in one comprehensive user interface embedded in Sitecore.

This new piece of the Coveo for Sitecore software includes the Coveo indexing manager, which allows you start and closely monitor the indexing process to see exactly what’s happening at every stage.

![Command Center Indexing Manager](/images/CoveoforSitecore5/indexes.png)

Also in the Command Center is the field manager, where you can include each field individually without ever stepping foot in a configuration file.

![Command Center Field Manager](/images/CoveoforSitecore5/FieldFiltered.png)

We believe the Command Center will become both a developer and administrator favorite tool by simplifying the most basic configurations which would often turn to be the most painful in complex environments.

## Performance

With the arrival of the Command Center, which brought an easier way to manage fields, it became possible for us to drastically reduce the number of indexed fields and let you choose what you want in your index. The fields hashing used to differentiate fields in each sources also disappeared. These two changes mean that the number of fields indexed by default will be minimal, greatly improving the indexing and querying performance for most instances.

The Hive framework is configured properly for HTML caching and the JavaScript framework underneath it is using lazy loading to reduce the amount of dependencies loaded when Coveo is integrated in Sitecore.

Coveo for Sitecore 5 is a massive step towards making Coveo for Sitecore the worry and risk free part of your Sitecore project while still offering access to the full power of the Coveo Cloud features.

If you want to learn more about all the awesomeness of Coveo for Sitecore 5, contact the [Coveo Sitecore Team](mailto:sitecore@coveo.com).

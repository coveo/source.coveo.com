---
layout: post

title: "Coveo for Sitecore Hive: What is it?"
tags: [Sitecore, Coveo for Sitecore]

author:
  name: Simon Langevin
  bio:  Coveo for Sitecore Product Manager | Sitecore MVP Technologist 2017
  image: slangevin.png
---

Last week, we released Coveo for Sitecore 4.1, and with it the Coveo for Sitecore Hive framework. Obviously, the [documentation](https://developers.coveo.com/x/FYc9Ag) followed as well as a [high level blog post](http://blog.coveo.com/making-website-personalization-easier-with-the-new-coveo-for-sitecore-hive-framework/), but I wanted to explain in my own words what this release is all about.

<!-- more -->

## Coveo for Sitecore 4.1 VS Coveo for Sitecore Hive

The first thing to understand about version 4.1 is that it is only a vessel carrying the Coveo Hive framework. You could use 4.1 the same way you used 4.0, which in a sense greatly reduces the upgrade effort. However, it would be like adding a turbocharger on your car and never using it.

That turbocharger is Coveo Hive, and just like any modifications added to a car, it can be removed and used somewhere else. Coveo for Sitecore Hive is introduced in 4.1, but will not be exclusive to it. It will evolve and become the main UI framework for all future versions of Coveo for Sitecore.

This also means that in the future, the legacy Coveo for Sitecore renderings and sublayouts in Sitecore will disappear. Keep in mind that Coveo Hive is MVC only, although if you are still using Web Forms, you are already due for an upgrade.

![Rendering Folder](/images/coveoforsitecorehive/renderingfolder.png)

As you can see in the image above, the two frameworks now coexist, but not for long!

## Experience Editor, code reuse, and easier upgrades

Sitecore is pushing everyone to the Experience (XP) Editor, and this is also where we are heading with Hive. Although the legacy renderings were editable in the XP Editor, adding and removing features was often controlled by a property on the main Coveo Search item.
With Coveo Hive, you build a page block by block, which might feel harder at first, but will offer a lot more flexibility in the long run.

![Moving Components](/images/coveoforsitecorehive/movingcomponents.gif)

By separating these components, we can tie them to their individual data sources item, which facilitates reusability.

![Data sources](/images/coveoforsitecorehive/datasources.png)

A developer could create a set of data sources ready for their authors, and help them create pages faster and reuse components across the solution.

![Using Templates](/images/coveoforsitecorehive/usingtemplates.gif)

To keep everything clean, data sources folders are set in branches and ready to be included in your solution when needed.

![Data Source Branches](/images/coveoforsitecorehive/branches.png)

In brief, it decreases the gap between the development team and authors, allowing the first to build presets for the latter to use them when needed.

![Bromance](/images/coveoforsitecorehive/bromance.jpg)

Finally, smaller components means rendering files with less code and a unique purpose. If you wish to change the behavior of the pager, then you can simply create a custom pager component instead of overriding the entire Coveo Search component. It makes it easier to keep track of changes and smooths the upgrade process.

## Caching

I mentioned the data sources earlier. Well the HTML is now bound to these data sources, which allows for a proper HTML caching of all the Coveo Hive renderings.
This was not the case with the legacy components and should make a difference when it comes to site performance.

## JSUI 2.0

Another advantage of using Coveo for Sitecore Hive is that it uses the new JavaScript framwork 2.0.

JSUI 2.0 is more than just an iteration of the number. It introduced a large amount of features, with the most notable being lazy loading. With lazy loading, the JavaScript and CSS dependencies of the Coveo Hive renderings will be loaded only when needed. For example, let’s look at the network requests made for a full fledged search page with facets, tabs, sorts, and several filtering and boosting rules.

![Search Page Network](/images/coveoforsitecorehive/lazysearchpage.png)

And the JavaScript files on that same page.

![Search Page Resources](/images/coveoforsitecorehive/lazysearchpageresources.png)

We have quite a list, and I could not fit all in that screen capture.

Now let’s look at the requests and the resources for a page with only the search box and a page view tracker.

![Search Box Network](/images/coveoforsitecorehive/lazysearchbox.png)

![Search Box Resources](/images/coveoforsitecorehive/lazysearchboxresources.png)

Much lighter! And keep in mind that this search box is not limited like what was offered in the legacy components with the Search Box Resources item. The search box in this example will provide machine learning powered query suggestions and other search box features.

And if you don’t know already, the whole framework is [open source](https://github.com/coveo/search-ui) so help yourself if you want something to change.

Oh, and don’t worry if you are upgrading from 4.0: the legacy component still uses the Coveo JavaScript UI 1.0. You can then upgrade your solution to 4.1 and upgrade your interface to Hive when you are ready. The upgrade guide has been release and is available [here](https://developers.coveo.com/x/QIY9Ag).

## So what’s next?

If you are an existing Coveo for Sitecore developer, I hope I convinced you to go ahead, try the new framework, and make it your default solution for future projects.
If you have never used Coveo, be aware that we are now not only the most feature full search solution in Sitecore, but we are also (in my opinion) the easiest to use.
So please go ahead and [download the trial](https://www.coveo.com/en/solutions/coveo-for-sitecore/download).

As always, I am on [Sitecore Slack](https://sitecorechat.slack.com), [Sitecore Stack Exchange](https://sitecore.stackexchange.com/) and [Answers.coveo.com](https://answers.coveo.com/index.html) if you have questions or comments on this new release.

See you there!

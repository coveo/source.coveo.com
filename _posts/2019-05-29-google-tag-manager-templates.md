---
layout: post

title: "Using Coveo's Google Tag Manager Templates to Log Analytics"
tags: [Coveo, Analytics, Google Tag Manager, gtm]

author:
  name: François Lachance-Guillemette
  bio: Software Developer
  twitter: fralachgui
  image: flguillemette.jpg

---

In the past few weeks, I had the goal to improve the [coveo.analytics.js](https://github.com/coveo/coveo.analytics.js) project and its integration into [Google Tag Manager](https://developers.google.com/tag-manager/).

I wanted to leverage its API to automatically deploy tags and variables that people would fill to easily configure page views and custom events in an existing Google Tag Manager workspace.

Then, magic happened, and the Google Tag Manager team released on May 23rd [Custom Templates](https://developers.google.com/tag-manager/templates/), which serves the exact purpose of what I wanted to integrate using the API.

This post explains how to use Coveo's official Google Tag Manager templates.

<!-- more -->

## Importing the Coveo Scripts

Thanks to the Google Tag Manager team and their kind and helpful reviews, the Coveo scripts are available in the [GoogleTagManagerTemplates repository](https://github.com/sahava/GoogleTagManagerTemplates/tree/master/tags/Coveo).

You need to download the two `.tpl` files located in the sub-folders of this link.

Then, in the `Templates` section of your Google Tag Manager workspace, create a new Tag Templates. Click on the menu button on the top right corner, and then `Import`.

![Import a Tag]({{ site.baseurl }}/images/googletagmanager-template/gtm-import-template.png)

Start by importing both templates.

The `Coveo Analytics Load Script.tpl` template allows you to include the `coveo.analytics.js` script in your page.

The `Coveo Analytics Log Event.tpl` template is the tag that sends the actual analytics event to Coveo Cloud.

## Loading the Script in Your Pages

In the `Tags` section of your Google Tag Manager workspace, create a new Tag. You should now see **Coveo Analytics Load Script**. Select it.

![Selecting Coveo Analytics Load Script]({{ site.baseurl }}/images/googletagmanager-template/gtm-custom-tag-section.png)

The tag requires a Coveo Analytics API key. For this, you need to get into your Coveo Cloud instance and create an API key with the `Push` access level on the `Analytics Data` privilege. I recommend creating a variable with this value so that you can easily change it later.

![Coveo - Add API Key]({{ site.baseurl }}/images/googletagmanager-template/cloud-api-key-privilege.png)

Set the script version to the latest release version of the [coveo.analytics.js release](https://github.com/coveo/coveo.analytics.js/releases) (at least 1.0).

Add a new trigger to this tag, preferably on `Page View` so that the script is loaded in all of your site pages.

Your final tag should look like this one:

![Coveo - Load Script Configuration]({{ site.baseurl }}/images/googletagmanager-template/gtm-load-script-configuration.png)

You can validate that it is working by entering `Preview` mode in Google Tag Manager and visiting your page.

![Coveo - Load Script Triggered]({{ site.baseurl }}/images/googletagmanager-template/gtm-load-script-tag-triggered.png)

## Logging Custom Events into Coveo Cloud

For this example, let's say you want to track all clicked links on your site in your Coveo Analytics Reports.

Create a new Tag based on `Coveo Analytics Log Event`.

Select `Custom` as the Event Type, if not already selected.

Choose a custom event type. This is the name that appears in your Coveo Cloud Analytics visits.

Select an Event Value. In this case, the event needs to be associated with the clicked URL, so it would be wise to use Google Tag Manager's Built-in Variable `Click URL`.

You also need to provide the `Language` key. Create a `Page Language` variable and assign its value with the method of your choice.

You can also provide additional metadata, filled from other variables. In this case, I wanted to track whether the user was a returning customer when it clicked the link, so I added the `isReturningCustomer` key and assigned its value to a variable. For it to appear in Coveo Cloud, I had to create a custom dimension on the `isReturningCustomer` custom event metadata.

![Coveo Cloud Custom Dimension]({{ site.baseurl }}/images/googletagmanager-template/coveo-cloud-custom-dimensions.png)

Your final tag should look like this one:

![Coveo - Log Click Configuration]({{ site.baseurl }}/images/googletagmanager-template/gtm-log-click-configuration.png)

Once you load `Preview` mode in Google Tag Manager and visit your site, every link clicked will be logged into Coveo Cloud as part of the current visit.

![Coveo - Log Event Triggered]({{ site.baseurl }}/images/googletagmanager-template/gtm-click-on-link-tag.png)

You can then track your visit in Coveo Cloud in the Visit Browser.

![Coveo Cloud Visit]({{ site.baseurl }}/images/googletagmanager-template/coveo-cloud-visit.png)

Now, you are ready to create some reports on this event!

## Next steps

This is just a basic event reporting for Coveo Cloud through Google Tag Manager. The template currently only supports `custom` and `view` events, but you can get creative with just `custom` events!

Coveo plans to support more types of events in the future, stay tuned for improvements on the templates!
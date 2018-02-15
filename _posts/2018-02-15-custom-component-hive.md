---
layout: post
title: "Integrating a Custom Component in Coveo for Sitecore Hive Framework"
tags: [coveo-search-ui, Custom Component, TypeScript, CoveoFeelingLucky, CoveoForSitecore, Sitecore, Hive Framework]
author:
  name: François Lachance-Guillemette
  bio: Coveo for Sitecore Developer
  image: flguillemette.jpg
---
Now that we have [created](http://source.coveo.com/2017/11/30/randomizer-as-a-component/) and [tested](http://source.coveo.com/2017/12/01/testing-custom-component/) our custom component, we want to integrate it like any other component in Coveo for Sitecore Hive Framework.

This post offers a step by step approach to adding a custom component in the Coveo for Sitecore integration.

<!-- more -->

## A word on Sitecore packages

When installing a new package in Sitecore, one of the key problems is that installing an update will override all the files contained in this package. In other words, if you modify anything that is installed by the Coveo for Sitecore package, changes will be overridden when updating, and this is a real pain.

The Coveo for Sitecore Hive Framework offers multiple entry points for customization to counter this, and we will use most of them here.

## Copying the Resources files

Previously in the series, we created the `CoveoFeelingLucky` component. Take its compiled JavaScript file (`coveo.feelinglucky.js`), available in the `bin` folder of your project, and copy it in a folder in your Sitecore's Website folder. For instance, mine is located in the `MySitecoreInstance/Website/CoveoCustom` folder. Also, don't forget to copy the `CoveoFeelingLucky.css` file, else (eyes beware) the component looks like this:

![Ew](/images/coveoforsitecorehive/FeelingLucky_Ew.png)

## Creating a custom Resources component

The `Coveo Search Resources` component is used to include all of the resources required to run a Coveo Search Interface on the page.

Since we need to include custom resources, the best way to go is to create our own custom resources component.

### Creating the view

In the `Website/Views` folder, create a new folder named `Coveo Hive Custom`. In it, create a new file named `CustomResources.cshtml`.

All you need in this file is the following lines:

```html
@using Coveo.UI.Components
@using Coveo.UI.Components.Extensions

<div>
    <link rel="stylesheet" href="/CoveoCustom/CoveoFeelingLucky.css" />
    <script type="text/javascript" src='/CoveoCustom/coveo.feelinglucky.js'></script>

    <!-- Shows the view name in the Experience Editor -->
    @Html.Partial(Partials.EDIT_TITLE, Html.Coveo().GetViewName())
</div>
```

No rocket science up to here.

### Adding the item in Sitecore

In Sitecore's Content Editor, in the Renderings section, create a new folder that will contain all of our custom components.

![Custom Rendering Folder](/images/coveoforsitecorehive/FeelingLucky_ RenderingsCustomFolder.png "Custom Rendering Folder")

Create a new `View Rendering` named `Custom Coveo Resources`.

In the `Path` field on this item, put the path of the view created in the previous step. Mine is `/Views/Coveo Hive Custom/CustomResources.cshtml`.

### Integrating this resources file in existing placeholders

Now, this is the cool integration part. It allows our users to upgrade without the pain of losing customization in Coveo's placeholder allowed controls.

In Sitecore's Content Editor, in the `Placeholder Settings` item, create a new `Coveo Hive Custom` folder. Insert a new item from the template `Templates/Coveo Hive/Structure/Placeholder Extender`. Name it `Allow My Custom Resources`.

In the `Placeholder key` field, you can select existing placeholders. In our case, pick `/Coveo Hive/Layout/UI Resources`. In the `Allowed controls` field, add the `Custom Coveo Resources` rendering created in the previous step.

![Placeholder Extender](/images/coveoforsitecorehive/FeelingLucky_PatchingtheAllowedControls.png "Placeholder Extender")

This item will patch an existing placeholder with your custom allowed controls. It should now be visible when you add a new component in the `UI Resources` placeholder, just like magic!

![Just Like Magic](/images/coveoforsitecorehive/FeelingLucky_JustLikeMagic.png "poof!")

Use the extender items as much as you can if you want to customize Coveo placeholders.

## Creating a custom Feeling Lucky component

The steps to integrate the `Feeling Lucky` component are similar to the resources file:

* Create a new view file `Website/Views/Coveo Hive Custom/CoveoFeelingLucky.cshtml` and put `<div class="CoveoFeelingLucky" data-title="Feeling lucky?"></div>` for its content
* Add a new item in Sitecore `Coveo Feeling Lucky`.
* Integrate it in the placeholders that you want. The `Coveo Hive/Search Boxes/Searchbox Settings` is an interesting one since components in this placeholder are located right beside the search box.

## Attaching the randomized field to a Sitecore source

This step is a reminder that you need to have your `randomfield` set on your items! Take a look back at [the first randomizer article](http://source.coveo.com/2017/06/20/randomizing-results-from-a-coveo-index/#introducing-a-random-field-on-items) and apply the Indexing Pipeline Extension to your Sitecore sources. Follow this link if you want to know how to do this: [Applying an Extension to a Source](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=335)

## Testing it out

In your Search Page, in Sitecore's Experience Editor, insert both the `Custom Coveo Resources` component in the `UI Resources` placeholder and the `Coveo Feeling Lucky` component in the `Searchbox Settings` placeholder (besides the Search box).

You should end up with your component initialized and ready to go:

![Feeling Lucky Result](/images/coveoforsitecorehive/FeelingLucky_Result.png "Could not get luckier than with this book recommendation")

## Next Steps

You might want to have a deep integration of the component in Sitecore like the actual existing components:

* Leverage Sitecore's Rendering Parameters and use them as parameters for your `Coveo Feeling Lucky` view.
* Show debugging information when you check Coveo's very useful `Show Debug Information`
* Inject your own logic from a model

I will instead refer to the more complete [Creating a Custom Coveo for Sitecore Hive Component - Multi-Sort Tutorial](https://developers.coveo.com/x/4QJPAg) which goes into far more details than this (already lengthy) blog post.

You can also read about specific custom components topics here: [Coveo for Sitecore Hive Custom Components Reference](https://developers.coveo.com/display/SitecoreV4/Coveo+for+Sitecore+Hive+Custom+Components+Reference)

## Coveo for Sitecore Hive with Custom Components wrap-up

The primary design choice of the Coveo for Sitecore Hive framework was to better reflect the features from the Coveo JavaScript Search Framework in Coveo for Sitecore.

A whole set of components was created to mimic the behavior of the "Legacy" UI. Each of the components was created using the same process explained in this blog series, using a TypeScript component, testing it, and then integrating it into Coveo for Sitecore. This design even allows us to test those components _outside_ of Sitecore since they are merely an extension of the Coveo JavaScript Search Framework.

All the components are included as a `coveo-search-ui` extension named `coveoforsitecore-search-ui`. You can see the full list of components included in the extension here: [Coveo for Sitecore Hive Components Reference](https://developers.coveo.com/x/JCcvAg)

Once you have the main process down, it is very easy to add new components and make them behave like real Coveo components, which really can help you add features and customize your Coveo for Sitecore experience down the road.

We tried very hard to streamline the customization process, and I hope that, through this series, you could understand how custom components are designed and integrated into the Coveo for Sitecore Hive Framework. Don't be afraid to try it out!
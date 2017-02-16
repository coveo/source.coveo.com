---
layout: post

title: "Automate Adding a Coveo Search Box In a Page Using Sitecore PowerShell Extensions"

tags: [Coveo Blitz]

author:
  name: Jean-François L'Heureux
  bio: Tech Evangelist, Coveo for Sitecore Team
  twitter: jflh
  image: jflheureux.jpeg
---

[Sitecore PowerShell Extensions](https://marketplace.sitecore.net/en/Modules/Sitecore_PowerShell_console.aspx) is an amazing tool every Sitecore developer should learn to use. I recently began to play with it. My first goal was to find a solution to a popular request: Automate adding a Coveo search box in a page.

<!-- more -->

In under 2 hours, I learnt the basics and wrote this script to add a Coveo search box in the presentation details of an item.

{% highlight powershell %}
# Adds the Coveo Search Box Resources and Coveo Search Box components in the presentation details of an item.
# Author: Jean-François L'Heureux

#  Edit the variables to suit your needs

# Item in which to add the components to.
$item = Get-Item -Path "master:/sitecore/templates/Launch Sitecore/Home/__Standard Values"
# Device in which to add the components to.
$device = Get-LayoutDevice -Default
# Placeholder in which to add the components to.
$placeHolder = "search-box"
# Path to a preconfigured "Coveo Search Box Parameters" datasource item.
$searchBoxParametersDatasourcePath = "/sitecore/content/Global/Settings/Coveo Parameters/Launch Search Box Parameters"

# Path to the Coveo Search Box Resources component to add. The default is the Web Forms sublayout.
$searchBoxResourcesComponentPath = "/sitecore/layout/Sublayouts/Coveo/Coveo Search Box Resources"
# Use this value for the MVC rendering.
# $searchBoxResourcesComponentPath = "/sitecore/layout/Renderings/Coveo/Coveo Search Box View Resources"

# Path to the Coveo Search Box component to add. The default is the Web Forms sublayout.
$searchBoxComponentPath = "/sitecore/layout/Sublayouts/Coveo/Coveo Search Box"
# Use this value for the MVC rendering.
# $searchBoxComponentPath = "/sitecore/layout/Renderings/Coveo/Coveo Search Box View"

$searchBoxResourcesComponent = New-Rendering -Path $searchBoxResourcesComponentPath
$searchBoxComponent = New-Rendering -Path $searchBoxComponentPath

Add-Rendering -Item $item -Instance $searchBoxResourcesComponent -PlaceHolder $placeHolder -Device $device
Add-Rendering -Item $item -Instance $searchBoxComponent -DataSource $searchBoxParametersDatasourcePath -PlaceHolder $placeHolder -Device $device 
{% endhighlight %}

The script sample is using the Web Forms Launch Sitecore demo. I included the MVC renrerings equivalents in the comments. I slightly modified the demo to replace the original search box in the header by a `search-box` placeholder.

The script is configured to add the search box and its required resources sublayouts in the `__Standard Values` item of the `Home` template. It requires a datasource item for the search box parameters to reuse the same parameters for all the search boxes added in different items.

In the future, I would like it to accept parameters and adding the Coveo search box in multiple items at once. I will update the script as I continue to learn the possibilities of the Sitecore PowerShell Extensions module.
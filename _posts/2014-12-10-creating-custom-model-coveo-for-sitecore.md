---
layout: post

title: "Creating custom model in Coveo for Sitecore"


author:
  name: Vincent Séguin
  bio: Team Lead, Coveo for Sitecore
  twitter: VincentSeguin
  image: vseguin.jpg
---

Coveo for Sitecore offers various extension points to easily customize almost every part of it : indexing, queries, interfaces etc. In the developers documentation, we're often giving examples of custom pipelines or JavaScript snippets, but what happen if you guys want to do more than that?

<!-- more -->

For instance, you may want to use a Coveo Search Component and add even more parameters that will be available from the Page Editor (or in Presentation/Details in the Content Editor). In this example, we'll try to add a configurable placeholder text for the search box. We'll use MVC components, but it also applies to Web Forms with slight modifications.

## 1. We must code!

Step 1. Install Visual Studio
Step 2. Code
Step 3. ????
Step 4. Profit

We'll create a new *Class Library* project in Visual Studio that we'll call *CustomCoveoSearch*. Let's add references to **Coveo.UI.dll** and **Sitecore.Mvc.dll** that should be in the bin folder of your Sitecore instance.

Then, let's add a new class in our project named *CustomCoveoModel*. The code should simply looks like this :

{% highlight C# %}

using Coveo.UI.Mvc.Models;

namespace CustomCoveoSearch
{
    public class CustomCoveoModel : SearchModel
    {
        public string PlaceholderText
        {
            get
            {
                return ParametersHelper.GetStringParam("PlaceholderText");
            }
        }
    }
}

{% endhighlight %}

The code is fairly simple. We need a public property to ensure our new parameter is usable in the .cshtml layout. We use the *ParametersHelper* that comes from Coveo's base SearchModel to get the proper value corresponding to our Sitecore item.

Build the project and add the **CustomCoveoSearch.dll** in the bin folder of your Sitecore instance.

## 2. We must create Sitecore items!

We then need to create a few Sitecore items to make it work. First step, if you open your Sitecore Content editor and navigate to the Templates section, you should see a CoveoModule/Search folder. Let's create a new CoveoCustom folder, and duplicate the item *Coveo Search Parameters* in this new folder. We'll name it *Custom Coveo Search Parameters*. Working with custom items will ensure that our work will not get overriden if we upgrade to a new version of Coveo for Sitecore.

![image](/images/sitecore/customcoveosearchparameters.png)

In the Advanced field section of this item, let's add a property named *PlaceholderText* with the Single-Line Text type. We'll set the title of this field to 'Placeholder text for search box'.

![image](/images/sitecore/placeholdertextfield.png)

Then, if we navigate to Layouts/Models, we'll also create a CoveoCustom folder, in which we'll create a new Model named *Custom Search Model*. The model type should point to the type we created on step 1, which is **CustomCoveoSearch.CustomCoveoModel, CustomCoveoSearch**.

![image](/images/sitecore/customsearchmodel.png)

Finally, we'll navigate to Layouts/Renderings, create again a CoveoCustom folder and then duplicate the Coveo Search View item into a new *Custom Coveo Search View*. We'll need to adjust the Model, Parameters Template and Datasource Template fields to respectively point on our custom model and our custom parameters item. Let's change the path for '/Views/CoveoCustom/CustomSearchView.cshtml' as well, we'll setup that in step 3.

![image](/images/sitecore/customcoveosearchview1.png)
![image](/images/sitecore/customcoveosearchview2.png)

Make sure to save and publish all these new items.

## 3. We must create a proper cshtml!

In the Website folder of your Sitecore instance, you should have a SearchView.cshtml file located under '/Views/Coveo'. Duplicate that into the path you just set at the end of step 2, probably '/Views/CoveoCustom/CustomSearchView.cshtml'. Copy the Web.config file from the first folder to your new folder (author of these lines actually forgot this step and lost some time troubleshooting why the example was not working...) Open the 'CustomSearchView.cshtml' file with your favorite text editor.

Look for the following tag at the end of the file :

{% highlight html %}

    <script type="text/javascript">
        Coveo.$(function() {
            Coveo.$('#search').coveoForSitecore('init', CoveoForSitecore.componentsOptions);
        });
    </script>

{% endhighlight %}

And replace it by :

{% highlight html %}

    <script type="text/javascript">
        Coveo.$(function() {
            Coveo.$('#search').coveoForSitecore('init', CoveoForSitecore.componentsOptions);
            Coveo.$('#search').find("input.CoveoQueryBox").attr("placeholder", '@Model.PlaceholderText');
        });
    </script>

{% endhighlight %}

This will make the link between our new model and the JSUI search box. Save and close this file.

## 4. We must test it out!

Let's create a new Coveo Search Page (MVC) under /sitecore/content/home. Go into Presentation/Details and replace the Coveo Search View by our new Custom Coveo Search View. (Obviously, you could also try it in any item you want, just make sure you have a Coveo Search View Resources rendering in your layout as well) Just make sure that the placeholder is *coveo-search-mvc*.

![image](/images/sitecore/addedcustomcoveosearchview.png)

Save and close the Presentation/Details window. Let's now open our item in the Page Editor! In the properties of the view, we should see our placeholder text property :

![image](/images/sitecore/placeholdertextpageeditor.png)

What's magical is that it actually works! If we enter something as a placeholder and save the item, it displays our new value :

![image](/images/sitecore/placeholdertextresult.png)

## 5. We must conclude!

Lots of steps for a small result you may say! But like i said earlier, all those duplicates are actually really important, because your work will not get affected by the upgrades of Coveo for Sitecore. Those kind of customizations can actually give a nice bonus to your end users :)

Thanks for reading!

![image](/images/posts/kinginthecastle.gif)
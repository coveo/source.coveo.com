---
layout: post

title: "Creating secured item previews in Sitecore"

tags: [Sitecore, Secured Content, Coveo for Sitecore, Preview, Conversion]

author:
  name: Vincent Bernard
  bio: Solution Architect, Coveo for Sitecore
  twitter: vincentbernard_
  image: vbernard.png

---

Recently, I had to work on an interesting use case where my client wanted to display teasers of premium content to anonymous users in Sitecore. Once the users found what they were looking for, they were either redirected to a login page or to a subscribing page. No secrets, the strategy behind it is to increase conversion rates.

After working on the project, I realized that the business needs behind their request was fairly common. People want to show partial items to anonymous users, but still want them to be relevant and easy to find. Let me introduce you the `CreateSecuredItemPreview` solution.

<!-- more -->

## Overview

Sitecore allows authors to set permission levels on items. These items won't be available to users having insufficient privileges. Coveo for Sitecore is using Sitecore’s permission scheme, so the results are returned according to the Sitecore user's permission. This solution will create limited copies of selected items and will let anyone search for them without displaying sensitive information.

#### Use cases

* Hide specific fields to anonymous users, like phone numbers or price;
* Hide premium content to unsubscribed members;
* Let anonymous users search for certain articles, and then propose a subscription if they find what they are looking for.

#### Detail of the solution

This four-part solution copies selected items and makes them available to anonymous users. It includes:

* A set of Sitecore fields to manage the processor;
* A configuration file to implement the processor;
* A C# processor to duplicate the items and manage the security;
* An extension to restrict fields or preview of copied items.

#### Code

The solution is available from [our Github repository](https://github.com/coveo/samples/tree/master/coveo-for-sitecore/solutions/CreateSecuredItemPreview).

## How to use it

Of course, all of this is done on a Sitecore server, with Coveo for Sitecore installed and a configured Coveo Cloud organization.

#### 1. Create the required Sitecore fields

First, create a template with a set of fields; those will be used as parameters to determine how the item should be copied. Make sure to use those exacts titles, or to adjust files constants.

* `Remove Fields`: Checkbox
* `Fields To Remove IDs`: Treelist scoped to `/sitecore/templates/`
* `Enable Search In Removed Fields`: Checkbox
* `Remove Preview`: Checkbox
* `Enable Search in Removed Preview`: Checkbox

I created mine in `/sitecore/Templates/User Defined`, and the final result looks like this:

![Create Secured Item Preview Template](/images/2017-07-12/1.png "Create Secured Item Preview Template")

To use the processor on items, assign the newly created `Create Secured Item Preview Template` template to the item's template. Standard values can be used to configure every item inheriting that template.

![Assign the template to your items](/images/2017-07-12/2.png "Assign the template to your items")

#### 2. Fill the configuration file

Insert the CreateSecureItemPreview.config in `YOUR_SITECORE_SITE\Website\App_Config\Include\Coveo`.

There are 5 sections in the file:

* `coveoPostItemProcessingPipeline`: adds the CreateSecuredItemPreviewProcessor to the pipeline;
* `CreateSecuredItemPreviewProcessor` references the `Remove Fields` and the `Remove Preview` fields defined in step 1, and the suffix to be used on the copied items;
* `fieldMap`: defines the required fields for the new processor. All the fields are tagged as external;
* `formsAuthConfiguration`: configures the HTML crawler authentication used to log into Sitecore. This needs to point to the admin login (`/sitecore/login`);
* `event`: adds a handler to delete the duplicate items when the original item is deleted (see disclaimer below).

#### 3. Install the processor

There are advanced explanations on how to build the processor in the [GitHub project](https://github.com/coveo/samples/tree/master/coveo-for-sitecore/solutions/CreateSecuredItemPreview). Once built, you need to drop the DLL in `YOUR_SITECORE_SITE\Website\bin`. The processor intercepts items tagged either with the `Remove Field` or the `Remove Preview` field, and creates a copy.

The copied item will:

* have the suffix, set in the configuration file, appended to its URI;
* have an anonymous profile security level;
* have a field indicating the item is a copy;
* have a field indicating all the fields to be removed.

The text contained in (`SearchViewSnippet.txt`) is used to modify the search interface so copied items won't show up to logged users.

#### 4. Create the extension

This extension is used to remove fields from the copied items. Only the items marked as a copy will be intercepted.

* If the `Remove Fields` field is checked, the fields will be removed from the item;
* If the `Enable Search In Removed Field` field is checked, the value of the selected fields will be copied to a hidden but searchable field;
* If the `Remove Preview` field is checked, the preview will be removed;
* If the `Enable Search in Removed Preview` field is checked, the preview data will be hidden but searchable.

## Testing it out

I've been testing it with a PDF, which is a little bit harder because I needed to patch the default PDF template with a custom one, based on the original, that includes the CreateSecuredItemPreviewTemplate. Testing it on a regular Sitecore item should be easier.

So, after uploading the PDF in Sitecore, I:

* secured it with the Require Login security item;
* checked the `Remove Preview` box;
* checked the `Enable Search In Removed Preview` box;
* saved the item.

![Checking boxes in a Sitecore item](/images/2017-07-12/6.png "Checking boxes in a Sitecore item")


Saving the item will re-index it. On the Coveo Cloud platform, the log browser will show the extension logs.

![Log browser logging](/images/2017-07-12/3.png "Log browser logging")

In the Content Browser, check the `View all` content checkbox. Two PDFs are now part of my index, the original one, and the duplicated one.

![Duplicated item in content browser](/images/2017-07-12/4.png "Duplicated item in content browser")

Searching for any content in the PDF will return both items, but the limited one won't have any preview. 

![Restricted item preview](/images/2017-07-12/5.png "Restricted item preview")


#### Disclaimer

This processor has been tested in Launch Sitecore. To ensure that it works correctly in that environment, you'll have to:

* Remove the `ExcludeCoveoUserAgentProcessor`. An exception was causing the HTML Content processor to crash;
* Make sure you have configured a login page on your Sitecore site to redirect the un-authenticated user correctly.

When you delete an item that has copies created with the HiddenButSearchable processor:

* Deleting the item in the content tree will remove the item and all variations (language, version, or any item with a suffix);
* Deleting a version of the item will remove a specific version of the item. That's why a custom event handler is included in the solution.

That's all for today, folks. Cheers!
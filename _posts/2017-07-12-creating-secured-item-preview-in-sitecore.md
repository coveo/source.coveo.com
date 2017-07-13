---
layout: post

title: "Creating secured item preview in Sitecore"

tags: [JavaScript Search Framework, Web Pages Connector, Jekyll]

author:
  name: Vincent Bernard
  bio: Solution Architect, Coveo for Sitecore
  twitter: vincentbernard_
  image: vbernard.png

---

Sitecore allows authors to set permission levels on items. These items won't be available to users having insufficient privileges. Coveo for Sitecore is using Sitecore’s permissions scheme, so the results are returned accordingly to the Sitecore user's permission. You might want to enable anonymous users to search for those items, without displaying sensitive information. The removed information might be useful for relevance, so you might want to make it searchable without displaying it

THE SOLUTION

A 4 parts solution to copy restricted items and make them available to anonymous users.
A set of Sitecore fields to help the user define which item should be process and how they should be copied
A config file to push the configuration to the Index
A C# processor to duplicate the items and manage the security
An extension to limit the fields of the copied items

First, we create a template with a set of fields to manage the processor (I created mine in /sitecore/Templates/User Defined). Most of them are check boxes, except the Fields To Remove IDs, which is a Treelist scoped to /sitecore/templates/

To use the processor, assign the "Create Secured Item Preview Template" in the item's template.

This file can be inserted in YOUR_SITECORE_SITE\Website\App_Config\Include\Coveo
There are 4 sections in the file
coveoPostItemProcessingPipeline: Adds the CreateSecuredItemPreviewProcessor to the pipeline.
CreateSecuredItemPreviewProcessor references the field to remove and the preview to remove defined in Step 1, and which suffix to use for the copied items.
fieldMap: Defines the required fields for the new processor. All the fields are tagged as external 
formsAuthConfiguration: Configures the HTML crawler authentication used to log in Sitecore using the configured username and password.
event: Adds an handler to delete the duplicate items when the original item is deleted.

The processor intercepts items tagged with either the field "Remove Field" or the "Remove Preview", and creates a copy.
The copied item will:
have the suffix, setted in the config file, appended to its URI
have an anonymous profile security level
have a field indicating the item is a copy
have a field indicating all the fields to be removed

This extension is used to remove fields from the copied items.
Only the items marked as a copy will be intercepted
If the "Remove Fields" field is checked, the fields will be removed from the item
If the "Enable Search In Removed Field" field is checked, the value of the selected fields will be copied to an hidden but searchable field
If the "Remove Preview" field is checked, the preview will be removed
If the "Enable Search in Removed Preview" field is checked, the preview data will be hidden but searchable

The first use case is with a PDF. I patched the default PDF template with a custom one, based on the original, that includes the CreateSecuredItemPreviewTemplate.
After uploading the PDF in Sitecore, I:
secured it with the Require Login security item
checked the Remove Preview box 
checked the Enable Search In Removed Preview box
saved the item
Saving the item will trigger a re-indexing. On the cloud platform, the log browser will show the extension logs. If I go in my content browser, I first need to check the View all content checkbox. Two PDFs are now part of my index, the original one and the duplicated one.

Searching for any content in the PDF will return both items, but the limited one won't have any preview. 

This processor has been tested in Launch Sitecore. To ensure that it works properly, you'll have to:
Remove user agent processor. An exception was causing the HTML Content processor to crash.
Make sure you have configured a login page on your Sitecore site to redirect the un-authenticated user correctly
You should not modify /sitecore/templates/System/Templates/Standard template. Instead, use the template inherited by the items you want to secured.


When you delete an item that have copies created with the HiddenButSearchable processor
Deleting the item in the content tree will remove the item and all variations (language, version or any item with a suffix)
Deleting a version of the item will remove a specific version of the item, that's why a custom event handler is included in the solution 

Hide premium content from unsubscribed members
Let anonymous users search for certain articles, and propose them a subscription if they find what they are looking for
Hide specific fields to anonymous users, like phone numbers or price

In Sitecore, create the fields on the standard template
Fill the config with the fields ID and place the file in your App_Config/Incude/Coveo folder
Drop the Coveo.Z.HiddenButSearchable.dll in the bin folder
Add the extension in your Coveo Cloud organization

Prerequisite: Sitecore with Coveo for Sitecore installed and configured with a Coveo Cloud organization
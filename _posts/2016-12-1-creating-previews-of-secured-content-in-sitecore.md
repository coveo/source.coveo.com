---
layout: post

title: "Creating Previews of Your Secured Sitecore Content"

tags: [Sitecore, Secured Content, Coveo for Sitecore]

author:
  name: Laurent Mandrile
  bio: Intern, Coveo for Sitecore
  image: TODO
---

You may have secured items in your content tree that you’d like to present to anonymous users without revealing their content. With the `ItemLimitedViewProcessor`, you may do just that. Stripped down values of secured items without quick views are created at indexing time. These items are searchable by anonymous users and filtered out at query time for connected users, who will see the secured content normally. You may also specify a preview field for an item that will be used as a quickview, hide fields that you wouldn't want an anonymous user to access and inject the original secured content in a hidden field so it may still count for relevance. 

<!-- more -->

#ItemLimitedViewProcessor

All this is accomplished by creating a copy of items as they go through the Coveo pipelines and running them through our custom processor before they are indexed. The processor strips the copies of their content and access rules while still linking to the original page. This way, if you redirect an anonymous user trying to access secure content to a login page, he will also be redirected by clicking on the new hollow item.

To obtain the same relevancy as the original items, the content of the item’s body is added to a new field which is free text searchable, but not displayed.

Two fields are created in Sitecore items that are two be targeted by the processor. A first one to indicate the item has to be stripped, and a second potentially containing a preview text to show anonymous users.

##Code
The processor added to the CoveoItemPostProcessingPipeline does a shallow copy of an item if it finds it marked for copying. It also adds two fields to the new item: “IsLimitedAccessDocument”, a field marking an item as a stripped down duplicate and “HiddenContent”, a hidden field containing the original item’s body. Furthermore, a new `Unique ID` must be created for the item and it’s copy to be considered two different elements.


*Copy Paste Code*

##Configurations

The next step is patching the coveo configuration files in your Sitecore repository. To do this, you may either patch the `Coveo.SearchProvider.Custom.Config` file or create your own .config *as long as it's loaded after 'coveo.SearchProvider.Custom.Config'*.

  <configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
    <sitecore>
      <pipelines>
        <coveoPostItemProcessingPipeline>
          <processor type="ItemLimitedAccess.Processors.ItemLimitedViewStripProcessor, ItemLimitedAccess">
            <LimitedAccessFieldID></LimitedAccessFieldID>
            <PreviewFieldID></PreviewFieldID>
            <FieldToHideID></FieldToHideID>
          </processor>
        </coveoPostItemProcessingPipeline>
      </pipelines>
    </sitecore>
  </configuration>
  
It is important to add the processor after the HtmlContentInBodyWithRequestsProcessor, as this first processor formats the content of the item which is then used for relevancy.

In this same file, the fields referenced in the code are added to the fieldmap:
    <fieldMap>
        <fieldNames hint="raw:AddFieldByFieldName">
        <fieldType fieldName="IsLimitedAccessDocument" settingType="Coveo.Framework.Configuration.FieldConfiguration, Coveo.Framework" />
        <fieldType fieldName="HiddenContent" includeForFreeTextSearch="true" isDisplayField="false" settingType="Coveo.Framework.Configuration.FieldConfiguration, Coveo.Framework" />
        </fieldNames>
    </fieldMap>


Finally, the query must be modified to filter the duplicates out of connected users’ searches.


*Query code*
        Coveo.$(function() {
            Coveo.$('#search')
            .on(Coveo.QueryEvents.buildingQuery, function(e, args) {
                @if(!Model.IsUserAnonymous) {
                    @:args.queryBuilder.advancedExpression.add("NOT @(Model.ToCoveoFieldName("IsLimitedAccessDocument"))");
                }
            })
            .coveoForSitecore('init', CoveoForSitecore.componentsOptions);
        });




##Implementation
Add the “Limited Access” field to the sitecore items you wish to create a preview for.


Rebuild your indexes

---
layout: post

title: "Creating Previews of Your Secured Sitecore Content"

tags: [Sitecore, Secured Content, Coveo for Sitecore]

author:
  name: Laurent Mandrile
  bio: Intern, Coveo for Sitecore
  twitter: mandrilelaurent
  image: lmandrile.jpg
---

In your Sitecore content tree, you may have secured items that you would like to present to anonymous users without the items' content being displayed. The following blogpost introduces a method that will allow you to do just that. 

This is done by creating stripped down values of secured items at indexing time and are made searchable by anonymous users while being filtered out at query time for connected users, who will see the secured content as usual. The `ItemLimitedViewProcessor` described below will give you a way of implementing this.

<!-- more -->

#ItemLimitedViewProcessor

This feat is accomplished by creating a copy of items as they go through the Coveo pipelines and running them through our custom processor before they are indexed. The processor strips the content and access rules of these copies while still linking to the original page. This way, if you redirect an anonymous user trying to access secure content to a login page, they will be redirected to the same login page when clicking on the new hollow item. You may also specify a preview field for an item that will be used as a Quick View, hide fields that you wouldn't want an anonymous user to access, and inject the original secured content in a hidden field so it may still be relevant.

To achieve the same relevancy as the original items, the content of the item body is added to a new field (in our case, `HiddenContent`) which is free-text searchable, but not displayed.

Two fields are created in Sitecore items that will be used by the processor. The first indicates the item to be stripped, while the second potentially contains a preview to show anonymous users. In our case, these are the fields whose ID's are referenced by the `LimitedAccessFieldId` and `PreviewFieldId` properties described below.

##Code
The processor added to the `CoveoItemPostProcessingPipeline` does a hollow copy of an item if it finds it marked for copying. It also adds two fields to the new item: `IsLimitedAccessDocument`, a field marking an item as a stripped down duplicate, and `HiddenContent`, a hidden field containing the original item body. Furthermore, a new `Unique ID` must be created for the item and its copy to be considered two different elements. The complete code can be found in the [Coveo Samples GitHub repository](https://github.com/coveo/samples/tree/master/coveo-for-sitecore/processors/ItemLimitedViewStripProcessor).

{% highlight c# %}
[...]
public void Process(CoveoPostItemProcessingPipelineArgs p_Args)
{
    s_Logger.TraceEntering();

    Precondition.NotNull(p_Args, () => () => p_Args);

    ID limitedAccessFieldId = new ID(LimitedAccessFieldId);
    ID fieldToHideId = new ID(FieldToHideId);
    ID previewFieldId = new ID(PreviewFieldId);

    CoveoIndexableItem coveoIndexableItem = p_Args.CoveoItem;
    SitecoreIndexableItem sitecoreIndexableItem = p_Args.Item as SitecoreIndexableItem;
    if (coveoIndexableItem != null &&
        sitecoreIndexableItem != null &&
        !sitecoreIndexableItem.Item.Paths.IsMediaItem &&
        sitecoreIndexableItem.Item[limitedAccessFieldId] == LIMITED_ACCESS_VALUE) {

        // Check if a preview text has been specified.
        IIndexableDataField previewField = sitecoreIndexableItem.Fields.FirstOrDefault(
             arg => (ID) arg.Id == previewFieldId);
        byte[] encodedPreview = null;
        if (previewField != null) {
            string previewText = previewField.Value.ToString();
            if (!String.IsNullOrEmpty(previewText)) {
                encodedPreview = Encoding.UTF8.GetBytes(previewText);
            }
        }

        // Duplicates metadata.
        Dictionary<string, object> newMetadata = new Dictionary<string, object>(coveoIndexableItem.Metadata) {
            { LIMITED_ACCESS_METADATA_FIELDNAME, true }
        };

        // Add a hidden field containing the original binary data for relevance
        if (coveoIndexableItem.BinaryData != null) {
            newMetadata.Add(HIDDEN_CONTENT_METADATA_FIELDNAME, Encoding.UTF8.GetString(coveoIndexableItem.BinaryData));
        }

        if (!String.IsNullOrEmpty(FieldToHideId)) {
            IIndexableDataField fieldToHide = sitecoreIndexableItem.Fields.FirstOrDefault(
                 arg => (ID) arg.Id == fieldToHideId);
            if (fieldToHide != null) {
                newMetadata.Remove(fieldToHide.Name);
            }
        }

        string newUniqueId = coveoIndexableItem.UniqueId + LIMITED_ACCESS_ITEM_SUFFIX;

        CoveoIndexableItem strippedItem = new CoveoIndexableItem {
            // Custom fields.
            // Replace the data with the preview text. This way, the preview will be used for the new item's quickview.
            BinaryData = encodedPreview,
            UniqueId = newUniqueId,
            Metadata = newMetadata,
            // Fields that are inherited from the parent item.
            BinaryDataMimeType = coveoIndexableItem.BinaryDataMimeType,
            BinaryDataPath = coveoIndexableItem.BinaryDataPath,
            ClickableUri = coveoIndexableItem.ClickableUri,
            FileName = coveoIndexableItem.FileName,
            HasSubItems = coveoIndexableItem.HasSubItems,
            Id = coveoIndexableItem.Id,
            IsDeletedItem = coveoIndexableItem.IsDeletedItem,
            ModifiedDate = coveoIndexableItem.ModifiedDate,
            Parent = coveoIndexableItem.Parent,
            ParentId = coveoIndexableItem.ParentId,
            Path = coveoIndexableItem.Path,
            Permissions = CreateAnonymousAccessRule(),
            PrintablePath = coveoIndexableItem.PrintablePath,
            Title = coveoIndexableItem.Title
        };
        p_Args.OutputCoveoItems.Add(strippedItem);
    }
    s_Logger.TraceExiting();
}
{% endhighlight %}

##Configurations

The next step is patching the Coveo configuration files in your Sitecore repository. To do this, you may either create a new .config file (as long as it's loaded after 'Coveo.SearchProvider.Custom.Config') or patch the `Coveo.SearchProvider.Custom.Config` directly.

{% highlight xml %}
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
{% endhighlight %}

It is important to add the processor after the HtmlContentInBodyWithRequestsProcessor, as this first processor formats the content of the item which is then used for relevancy.

In this same file, the fields referenced in the code must be added to the field map:

{% highlight xml %}
<fieldMap>
    <fieldNames hint="raw:AddFieldByFieldName">
    <fieldType fieldName="IsLimitedAccessDocument" settingType="Coveo.Framework.Configuration.FieldConfiguration, Coveo.Framework" />
    <fieldType fieldName="HiddenContent" includeForFreeTextSearch="true" isDisplayField="false" settingType="Coveo.Framework.Configuration.FieldConfiguration, Coveo.Framework" />
    </fieldNames>
</fieldMap>
{% endhighlight %}

Finally, the query must be modified to filter the duplicates out of connected users searches. The following example is for a MVC setup. Start by [duplicating your search component](https://developers.coveo.com/x/qADvAQ) (for MVC,`SearchView.cshtml`). Then, replace the block of code containing `.coveoForSitecore('init', CoveoForSitecore.componentsOptions)` with the following snippet.

{% highlight js %}
<script type="text/javascript">
  //Implement this function based on your security rules
  function userHasAccessToSecuredContent() {
    return @Model.IsUserAnonymous.ToString().ToLower();
  }

  Coveo.$(function() {
    Coveo.$("#@Model.Id")
    .on(Coveo.QueryEvents.buildingQuery, function(e, args) {
      if (!userHasAccessToSecuredContent()) {
        args.queryBuilder.advancedExpression.add("NOT @(Model.ToCoveoFieldName("IsLimitedAccessDocument"))");
      }
    })
    .coveoForSitecore('init', CoveoForSitecore.componentsOptions);
  });
</script>
{% endhighlight %}

Now that your processor is correctly configured, the next step is to activate it on your items by implementing the following steps:

- Add a “Limited Access” field to the Sitecore items you wish to duplicate with the "Strip" keyword as its value. 
- Create a preview field with the text. (Optional)
- Choose a field you want to hide in your duplicate (Optional)
- Configure the parameters in your processor configuration file using each field ID defined in the previous steps

**As a very important side note**, make sure you are handling the processing of your secure content well! The `HtmlContentInBodyWithRequestsProcessor` is used to retrieve the content injected in the `HiddenContent` field, and if the item is secured, [Coveo for Sitecore has to be able to login.](https://developers.coveo.com/display/public/SitecoreV4/Configuring+Form+Authentication)

Now rebuild your indexes and you're good to go! To test your feature, open your search page with an incognito window, search for an item your marked for copying, and you should see its copy with the preview text you entered. Clicking this copy should redirect you to an access denied page. 

Now, login with a user that has access to the item, search for it once more; instead of finding the copy, you should see the full item appear normally in your results.

---
layout: post

title: "Creating Previews of Your Secured Sitecore Content"

tags: [Sitecore, Secured Content, Coveo for Sitecore]

author:
  name: Laurent Mandrile
  bio: Intern, Coveo for Sitecore
  image: lmandrile.jpg
---

You may have secured items in your content tree that you’d like to present to anonymous users without the items' content being revealed. With the `ItemLimitedViewProcessor`, you may do just that. Stripped down values of secured items without quick views are created at indexing time. These items are searchable by anonymous users and filtered out at query time for connected users, who will see the secured content normally. You may also specify a preview field for an item that will be used as a quickview, hide fields that you wouldn't want an anonymous user to access and inject the original secured content in a hidden field so it may still count for relevance. 

<!-- more -->

#ItemLimitedViewProcessor

This feat is accomplished by creating a copy of items as they go through the Coveo pipelines and running them through our custom processor before they are indexed. The processor strips the copies of their content and access rules while still linking to the original page. This way, if you redirect an anonymous user trying to access secure content to a login page, he will be redirected to the same login by clicking on the new hollow item.

To obtain the same relevancy as the original items, the content of the item’s body is added to a new field which is free text searchable, but not displayed.

Two fields are created in Sitecore items that are to be targeted by the processor. A first one to indicate the item has to be stripped, and a second potentially containing a preview text to show anonymous users.

##Code
The processor added to the CoveoItemPostProcessingPipeline does a shallow copy of an item if it finds it marked for copying. It also adds two fields to the new item: “IsLimitedAccessDocument”, a field marking an item as a stripped down duplicate and “HiddenContent”, a hidden field containing the original item’s body. Furthermore, a new `Unique ID` must be created for the item and its copy to be considered two different elements.

{% highlight c# %}
public class ItemLimitedViewStripProcessor : IProcessor<CoveoPostItemProcessingPipelineArgs>
{
    /// <summary>
    /// ID of the field where the limited access command is specified.
    /// </summary>
    public string LimitedAccessFieldId { get; set; }

    /// <summary>
    /// ID of a field that must be stripped from the MetaData.
    /// </summary>
    /// <remarks>Can be empty.</remarks>
    public string FieldToHideId { get; set; }

    /// <summary>
    /// ID of field containing an item preview. Only single field hiding is implemented for now, but the processor can be easily
    /// modified to allow for multiple field hiding.
    /// </summary>
    /// <remarks>Can be empty.</remarks>
    public string PreviewFieldId { get; set; }

    private static readonly ILogger s_Logger = CoveoLogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
    private readonly string LIMITED_ACCESS_VALUE = "Strip";
    private readonly string LIMITED_ACCESS_ITEM_SUFFIX = "_DuplicatedCopy";
    private readonly string LIMITED_ACCESS_METADATA_FIELDNAME = "IsLimitedAccessDocument";
    private readonly string HIDDEN_CONTENT_METADATA_FIELDNAME = "HiddenContent";

    /// <inheritDoc />
    public void Process(CoveoPostItemProcessingPipelineArgs p_Args)
    {
        s_Logger.TraceEntering();

        ID limitedAccessFieldId = new ID(LimitedAccessFieldId);
        ID fieldToHideId = new ID(FieldToHideId);
        ID previewFieldId = new ID(PreviewFieldId);

        CoveoIndexableItem coveoIndexableItem = p_Args.CoveoItem;
        SitecoreIndexableItem sitecoreIndexableItem = p_Args.Item as SitecoreIndexableItem;
        if (coveoIndexableItem != null &&
            sitecoreIndexableItem != null &&
            !sitecoreIndexableItem.Item.Paths.IsMediaItem &&
            sitecoreIndexableItem.Item[limitedAccessFieldId] == LIMITED_ACCESS_VALUE) {

            // Check if a preview text has been specified
            IIndexableDataField previewField = sitecoreIndexableItem.Fields.FirstOrDefault(arg => (ID) arg.Id == previewFieldId);
            byte[] encodedPreview = null;
            if (previewField != null) {
                string previewText = previewField.Value.ToString();
                if (!String.IsNullOrEmpty(previewText)) {
                    encodedPreview = Encoding.UTF8.GetBytes(previewText);
                }
            }

            // Duplicate metadata
            Dictionary<string, object> newMetadata = new Dictionary<string, object>(coveoIndexableItem.Metadata) {
                { LIMITED_ACCESS_METADATA_FIELDNAME, true },
            };

            // Add a hidden field containing the original binary data for relevance
            if (coveoIndexableItem.BinaryData != null) {
                newMetadata.Add(HIDDEN_CONTENT_METADATA_FIELDNAME, Encoding.UTF8.GetString(coveoIndexableItem.BinaryData));
            }

            if (!String.IsNullOrEmpty(FieldToHideId)) {
                IIndexableDataField fieldToHide = sitecoreIndexableItem.Fields.FirstOrDefault(arg => (ID) arg.Id == fieldToHideId);
                if (fieldToHide != null) {
                    if (!newMetadata.Remove(fieldToHide.Name)) {
                        s_Logger.Error("Field to hide was not found for {0}.", fieldToHide.Name);
                    }
                }
            }

            string newUniqueId = coveoIndexableItem.UniqueId + LIMITED_ACCESS_ITEM_SUFFIX;

            CoveoIndexableItem strippedItem = new CoveoIndexableItem {
                // Set binary data to the preview so that it becomes the new QuickView
                BinaryData = encodedPreview,
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
                Title = coveoIndexableItem.Title,
                UniqueId = newUniqueId,
                Metadata = newMetadata
            };
            p_Args.OutputCoveoItems.Add(strippedItem);
        }
        s_Logger.TraceExiting();
    }

    private AccessRulesHierarchy CreateAnonymousAccessRule()
    {
        AccessRulesHierarchy accessRuleHierarchy = new AccessRulesHierarchy();
        IEnumerable<IndexableReadAccessRule> accessRules = new[] {
            new IndexableReadAccessRule() {
                Account = new IndexableAccount("", SecurityConstants.EVERYONE_ROLE, IndexableAccountType.Role),
                PermissionType = IndexablePermissionType.Access,
                PropagationType = IndexablePropagationType.Entity,
                SecurityPermission = IndexableSecurityPermission.AllowAccess
            }
        };
        accessRuleHierarchy.AddChildRules(accessRules);

        return accessRuleHierarchy;
    }
}
{% endhighlight %}

##Configurations

The next step is patching the Coveo configuration files in your Sitecore repository. To do this, you may either patch the `Coveo.SearchProvider.Custom.Config` file or create your own .config *as long as it's loaded after 'coveo.SearchProvider.Custom.Config'*.

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

In this same file, the fields referenced in the code are added to the fieldmap:

{% highlight xml %}
<fieldMap>
    <fieldNames hint="raw:AddFieldByFieldName">
    <fieldType fieldName="IsLimitedAccessDocument" settingType="Coveo.Framework.Configuration.FieldConfiguration, Coveo.Framework" />
    <fieldType fieldName="HiddenContent" includeForFreeTextSearch="true" isDisplayField="false" settingType="Coveo.Framework.Configuration.FieldConfiguration, Coveo.Framework" />
    </fieldNames>
</fieldMap>
{% endhighlight %}

Finally, the query must be modified to filter the duplicates out of connected users’ searches. If using MVC, integrate this snippet to your query builder in your `SearchView.cshtml` file.  

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


##Implementation
Now that your processor is correctly configured, the next step is activating it on your items. Add a “Limited Access” field to the sitecore items you wish to duplicate with the "Strip" keyword as its value. Also, if you want a preview text for your item, create a preview field with the text. Finally, enter the IDs of both these fields with the ID of a field you'd like to hide to your processor's configuration in your .config file.

Now rebuild your indexes and you're good to go!

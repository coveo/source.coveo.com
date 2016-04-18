---
layout: post

title: "Indexing Only Relevant Parts of Sitecore Rendered Content"

tags: [Sitecore, Coveo for Sitecore, Indexing, Processor, Pipeline]

author:
  name: Jean-François L'Heureux
  bio: Trainer and Evangelist, Coveo for Sitecore Team
  twitter: jflh
  image: jflheureux.jpeg
---

Organizations who care about relevancy use Coveo for Sitecore to power their website search. When indexing a Sitecore item, you want as much information as possible to be indexed. That's why you probably use the [`HtmlContentInBodyWithRequestsProcessor`](https://developers.coveo.com/display/public/SitecoreV3/Indexing+Documents+with+HTML+Content+Processor) to index the Sitecore rendered HTML of the item. However, you don't want to index global sections of the HTML like the header, footer, navigation, ads and sidebars.

A few solutions were available to do so. This post details a simple solution that involves only a Sitecore processor and minor edits to layouts, sublayouts or views.

<!-- more -->

## Official Solution

The [official documentation](https://developers.coveo.com/display/public/SitecoreV3/Indexing+Documents+with+HTML+Content+Processor) details a complex solution that requires a new device, the duplication of most of your layouts, the configuration of presentation of all your rendering templates and a lot of attention not to forget updating the new device rendering when a change is made to the default rendering. The advantage of this solution is that it can be maintained by content editors and marketers.

## Other Solutions

Other solutions are possible with the help of a developer:

1. Modify the code of unwanted UI components to avoid rendering their content when detecting the Coveo HTTP request user agent
2. Code a custom processor to remove unwanted sections after the rendered HTML is fetched

## Introducing the CleanHtmlContentInBodyProcessor

The idea is to use harmless HTML comment elments around HTML markup you don't want to be indexed. The processor is removing the comments and all the markup in between. The processor should run after the one fetching the HTML but before the item is sent to the index for indexing.

### Code

The main code of the processor is fairly simple. It uses Regex to delete matched sections of the markup. The code currently assumes that the HTML is encoded in UTF8 but can be easily adjusted for your integration. The complete code can be found in the [Coveo Samples GitHub repository](https://github.com/coveo/samples/blob/master/coveo-for-sitecore/processors/CleanHtmlContentInBodyProcessor.cs).

{% highlight c# %}
public class CleanHtmlContentInBodyProcessor : IProcessor<CoveoPostItemProcessingPipelineArgs>
{
    public string StartCommentText { get; set; }
    public string EndCommentText { get; set; }

    public void Process(CoveoPostItemProcessingPipelineArgs p_Args)
    {
        if (ShouldProcess(p_Args)) {
            string originalHtmlContent = Encoding.UTF8.GetString(p_Args.CoveoItem.BinaryData);
            string cleanedHtmlContent = CleanHtmlContent(originalHtmlContent);
            p_Args.CoveoItem.BinaryData = Encoding.UTF8.GetBytes(cleanedHtmlContent);
        }
    }

    private string CleanHtmlContent(string p_HtmlContent)
    {
        return Regex.Replace(p_HtmlContent, @"<!--\s*" + StartCommentText + @"\s*-->.*?<!--\s*" + EndCommentText + @"\s*-->", "", RegexOptions.Singleline);
    }
}
{% endhighlight %}

### Usage

#### In the Configuration File

Add the processor node after your existing HTML fetching processor in your Coveo for Sitecore configuration file (`Coveo.SearchProvider.config`) or even better, in a patch file.

{% highlight xml %}
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
  <sitecore>
    <pipelines>
      <coveoPostItemProcessingPipeline>
        <!-- Your existing HTML fetching processor -->
        <processor type="Coveo.SearchProvider.Processors.HtmlContentInBodyWithRequestsProcessor, Coveo.SearchProviderBase" />
        <!-- The CleanHtmlContentInBodyProcessor processor -->
        <processor type="Coveo.For.Sitecore.Samples.Processors.CleanHtmlContentInBodyProcessor, Coveo.For.Sitecore.Samples">
          <StartCommentText>BEGIN NOINDEX</StartCommentText>
          <EndCommentText>END NOINDEX</EndCommentText>
        </processor>
      </coveoPostItemProcessingPipeline>
    </pipelines>
  </sitecore>
</configuration>
{% endhighlight %}

#### In the Layouts, Sublayouts and Views 

Add comment elements in your layouts, sublayouts and views around the HTML markup you want to exclude from the indexed documents. Comments text need to match the processor configuration.

{% highlight html %}
<body>
  <!-- BEGIN NOINDEX -->
    <header>...</header>
  <!-- END NOINDEX -->

  <div class="main-content">...</div>

  <!-- BEGIN NOINDEX -->
    <footer>...</footer>
  <!-- END NOINDEX -->

  <script src="IncludedScript.js"></script>

  <!-- BEGIN NOINDEX -->
    <script src="ExcludedScript.js"></script>
  <!-- END NOINDEX -->
</body>
{% endhighlight %}

#### Rebuild

After adding the processor and the comments, rebuild your Sitecore indexes managed by Coveo for Sitecore to index the cleaned HTML content.

### Possible Issues

Be cautious with the comment locations. There are 2 possible problems:

1. Removing a different number of start tags than end tags. This will make your HTML invalid and cause a lot of rendering problems.
2. Nested comments. Avoid them as the code don't support them. The content between the first start comment and the first end comment will be removed, leaving everything between the two end comments.

## Conclusion

Whichever solution used, a Coveo for Sitecore integrator should always ensure the best search relevancy by indexing all but unwanted content. This ensures a great user experience and increase of the key performance indicators for the customer.
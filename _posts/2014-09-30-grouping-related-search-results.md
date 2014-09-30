---
layout: post

title: "Grouping related search results"
#subtitle: "How we display a question and its answer(s) in the search results of our Q&A site"

author:
  name: Carl Bolduc
  bio: Coveo for Sitecore Support Team Leader
  twitter: carlbolduc
  image: carlbolduc.jpg
---

The [JavaScript Search Framework](https://developers.coveo.com/display/JsSearch/Home) is a step forward in website integration. It was a natural fit when we decided to launch our [Q&A site](http://answers.coveo.com). Here is how we managed to display a question and its answer(s) together in the search results.

<!-- more -->

## Indexing the content

If you have already visited [answers.coveo.com](http://answers.coveo.com), you may have noticed that it is powered by [OSQA](http://www.osqa.net/). Before replacing the search on that platform, we needed to index its content. [OSQA](http://www.osqa.net/) does not have an API that we could use to extract content. However, everything is stored in a database so we went with our very flexible [Database Connector](http://onlinehelp.coveo.com/en/ces/7.0/Administrator/database_connector_features.htm) to retrieve all the questions and answers. Here is the mapping file that we are using:

{% highlight xml %}
<?xml version="1.0" encoding="utf-8" ?> 
<ODBC>
    <CommonMapping>
        <AllowedUsers>
            <AllowedUser type="Windows" allowed="true">
                <Name>everyone</Name>
                <Server></Server>
            </AllowedUser>
        </AllowedUsers>
    </CommonMapping>
    <Mapping type="Questions">
        <Accessor type="query">
            select forum_node.id as id, title, body, added_at, last_activity_at, node_type, tagnames, username, email, parent_id, score from forum_node inner join auth_user on forum_node.author_id = auth_user.id where node_type='question' AND state_string!='(deleted)';
        </Accessor>
        <Fields>
            <Uri>https://answers.coveo.com/questions/%[id]</Uri>
            <ClickableUri>https://answers.coveo.com/questions/%[id]</ClickableUri>
            <FileName>%[ID].txt</FileName>
            <Title>%[ID]</Title>
            <ModifiedDate>%[added_at]</ModifiedDate>
            <ContentType>text/html</ContentType>
            <Title>%[title]</Title>
            <Body>
                %[body]
            </Body>
            <CustomFields>
                <CustomField name="OrderDate">%[last_activity_at]</CustomField>
                <CustomField name="nodetype">%[node_type]</CustomField>
                <CustomField name="tags">%[tagnames]</CustomField>
                <CustomField name="sysAuthor">%[username]</CustomField>
                <CustomField name="foldingid">%[id]</CustomField>
                <CustomField name="questionid">%[id]</CustomField>
                <CustomField name="questiontitle">%[title]</CustomField>
	        <CustomField name="score">%[score]</CustomField>
            </CustomFields>
        </Fields>
    </Mapping>
    <Mapping type="Answers">
        <Accessor type="query">
            select forum_node.id as id, state_string, body, last_activity_at, node_type, tagnames, username, email, parent_id, score from forum_node inner join auth_user on forum_node.author_id = auth_user.id where node_type='answer';
        </Accessor>
        <Fields>
            <Uri>https://answers.coveo.com/questions/%[id]</Uri>
            <ClickableUri>https://answers.coveo.com/questions/%[parent_id]</ClickableUri>
            <FileName>%[ID].txt</FileName>
            <Title>Answer to question id %[parent_id]</Title>
            <ModifiedDate>%[last_activity_at]</ModifiedDate>
            <ContentType>text/html</ContentType>
            <Body>
                %[body]
            </Body>
            <CustomFields>
                <CustomField name="OrderDate">%[last_activity_at]</CustomField>
                <CustomField name="nodetype">%[node_type]</CustomField>
                <CustomField name="sysAuthor">%[username]</CustomField>
                <CustomField name="foldingid">%[parent_id]</CustomField>
                <CustomField name="answerid">%[id]</CustomField>
	        <CustomField name="answerstate">%[state_string]</CustomField>
	        <CustomField name="score">%[score]</CustomField>
            </CustomFields>
        </Fields>
    </Mapping>
</ODBC>
{% endhighlight %}

We wanted to display the answers with the questions in the search results. An answer without the context of the question is only a part of the information you are looking for. We also wanted to pull the question into the result list if the searched term was only found in the answer and vice versa. In the Coveo jargon, this type of result interaction is called Folding. To fold questions and answers, we created several [custom fields](http://onlinehelp.coveo.com/en/ces/7.0/administrator/adding_or_modifying_custom_fields.htm).

First, we needed a field containing the same value: `@foldingid`. On the question, `@foldingid` contains the `id` of the question in the [OSQA](http://www.osqa.net/) database. On the answer, `@foldingid` contains the `parent_id` value which represents the `id` of the related question in the [OSQA](http://www.osqa.net/) database. To organize the documents in a group of related results, we needed a way to distinguish the parent from its children. For that purpose, we set the field `@questionid` on all the questions and the field `@answerid` on all the answers. Those three fields will be used by the [JavaScript Search Framework](https://developers.coveo.com/display/JsSearch/Home) to fold results together. 

## Parent-Child relations

We then used the [Folding Component](https://developers.coveo.com/display/JsSearch/Folding+Component) to group questions and answers together. Here is the HTML that we are using:

{% highlight html %}
<div
    class='CoveoFolding'
    data-field='@foldingid' 
    data-parent-field='@questionid'
    data-child-field='@answerid'
    data-range='5'
    data-rearrange="date ascending"></div>
{% endhighlight %}

We set the data-field property to the common value shared by both the question and its answer(s). We then set the properties to specify the field to use for the parent and for the children. Those fields are either on the question or on the answer but not on both. Finally, we set the `data-rearrange` property to `"date ascending"`. This way, the results are displayed in the same order as they were created (question, answer 1, answer 2, ...).

## Rendering the results using templates.

We are only displaying questions and answers in this result list. The default result template is used to display the question, here it is:

{% highlight jsp %}
<script class="result-template" type="text/x-underscore-template">
    <div class='coveo-date'><%-dateTime(raw.sysdate)%></div>
    <div class='coveo-title'>
        <a class='CoveoResultLink'><%=title?highlight(title, titleHighlights):clickUri%></a>
    </div>
    <div class='coveo-excerpt'>
        <%=(state.q)?highlight(excerpt, excerptHighlights):highlight(firstSentences, firstSentencesHighlights)%>
    </div>
    <div class='field-table'>
        <span class='answers-author'>
            <span class="CoveoFieldValue" data-field="@sysauthor"></span>
        </span>
        <span class='answers-score'>
            <img src="/upfiles/image/like_button.png"/>
            <span class="CoveoFieldValue" data-field="@score"></span>
        </span>
        <% if(raw.tags){ %> <span class="CoveoFieldValue CoveoTags" data-field="@tags" data-facet="TagsFacet" data-split-values="true"></span><% } %>
    </div>
    <% if (childResults.length) { %>
        <img class="folding-picture" src="/upfiles/image/fleche_attention.png"/>
    <% } %>
    <div class='CoveoResultFolding'
        data-result-template-id="answer-template" 
        data-more-caption="ShowMoreReplies" 
        data-less-caption="ShowLessReplies"></div>
</script>
{% endhighlight %}

We have the [ResultFolding Component](https://developers.coveo.com/display/JsSearch/ResultFolding+Component) near the end of the template. While the [Folding component](https://developers.coveo.com/display/JsSearch/Folding+Component) folds the questions and answers together, the [ResultFolding Component](https://developers.coveo.com/display/JsSearch/ResultFolding+Component) renders the folded results. The template used to render the folded results is an option of the [ResultFolding Component](https://developers.coveo.com/display/JsSearch/ResultFolding+Component). In our case, the "answer-template" template is used to render the children.

We use a specific template for the children since, among other things, an answer does not have a meaningful title. Here is the template that we are using:
  
{% highlight jsp %}
<script id="answer-template" type="text/x-underscore-template">
    <div class='coveo-date'><%-dateTime(raw.sysdate)%></div>
    <div class='coveo-excerpt'>
        <%=highlight(excerpt, excerptHighlights)%>
    </div>
    <span class='answers-author'>
        <span class="CoveoFieldValue" data-field="@sysauthor"></span>
    </span>
    <span class='answers-score'>
        <img src="/upfiles/image/like_button.png"/>
        <span class="CoveoFieldValue" data-field="@score"></span>
    <span>
</script>
{% endhighlight %}

The end result for a question with two answers will look like this:

![Answers sample]({{ site.baseurl }}/images/AnswersSample.png)

And that's how you can easily group related content in a Coveo result list.

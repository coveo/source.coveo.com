---
layout: post

title: "Opening a Sitecore Dialog from a Bookmarklet"

tags: [Sitecore, Bookmarklet, SPEAK]

author:
  name: Jean-François L'Heureux
  bio: Solution Architect, Trainer, Coveo for Sitecore Team
  twitter: jflh
  image: jflheureux.jpeg
---

When developing dialogs, wizards and applications in Sitecore, a developer would have to open them many times per day. When the action to open them requires more than one click, a lot of time will be lost.

Wouldn't it be nice if one could open a dialog from the browser console command line or a bookmark?

<!-- more -->

With a bit of developer tools inspection, it is easy to find that Sitecore uses JavaScript to open the dialogs.

{% highlight javascript %}
onclick="javascript:return scForm.postEvent(this, event, 'AnEventName')"
{% endhighlight %}

The event name can be any Sitecore command like `indexing:runmanager` to open the Sitecore Indexing Manager. The code also uses `this` and the user event to feed the `scForm.postEvent` function. In a bookmarklet, no user event will be available so it needs to be faked by a `{ type: 'click' }` object.

Put together, this code can be set as a browser bookmark to send a command to Sitecore in most of the cases:

{% highlight javascript %}
javascript:scForm.postEvent(this, { type: 'click' }, 'YourEventName')
{% endhighlight %}

The only exception is the Sitecore 8 control panel. The `postEvent` function reloads the page when called in a SPEAK page. Instead, the `speakPostEvent` function can be used but it has different parameters. Its user event needs to have a `preventDefault` function defined to avoid the page to reload.

{% highlight javascript %}
javascript:scForm.speakPostEvent(scForm, { type: 'click', preventDefault: function(){} }, 'YourEventName')
{% endhighlight %}

With feature detection, a universal bookmarklet code can be crafted.

{% highlight javascript %}
javascript:var eventName = 'YourEventName'; var userEvent = { type: 'click', preventDefault: function(){} }; if (scForm.speakPostEvent) { scForm.speakPostEvent(scForm, userEvent, eventName); } else { scForm.postEvent(this, userEvent, eventName); }
{% endhighlight %}

![image]({{ site.baseurl }}/images/20160101/CreateSitecoreDialogBookmarklet.gif)

This code can even be used in the excellent [Sitecore Developer Tool](https://chrome.google.com/webstore/detail/sitecore-developer-tool/cmbppbejihcnbngefandoljljdppnlda) Google Chrome extension to open dialogs from any Sitecore administration page.
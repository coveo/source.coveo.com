---
layout: post

title: "Coveo for Sitecore troubleshooting"
#subtitle: ""

author:
  name: Simon Langevin
  bio: Product Expert, Coveo for Sitecore Support
  twitter: silaouo
  image: slangevin.png
---

Coveo for Sitecore has been out for a few months now and we had to rethink the way we index search and of course, for us, support and maintenance people, the way we tackle the issues popping here and there.

<!-- more -->

Our Search Provider implementation pushes documents to RabbitMQ, which keeps them warm until Coveo picks them up for indexing. The configuration is set in the <span style="color: gray;">Coveo.SearchProvider.config</span> file and is also being synchronised with the indexing back-end through the Coveo Admin Service. The schema below is from the Coveo Online Help, for now I will only address the Search Provider part.

![](/images/CoveoForSitecore1.png)

The process is simpler than before but the troubleshooting will require a change of mindset.

IMPORTANT: The [CES Console](http://onlinehelp.coveo.com/en/ces/7.0/Administrator/using_the_ces_console.htm) is your dear friend for all your Coveo operations. This is still the case with Coveo for Sitecore. The first step before starting any type of troubleshooting is to arm yourself with that friendly tool. Be aware that you can filter by source or system events.

NEW STUFF: For all of you using June 2014's release or newer, the R&amp;D team added a built-in [Coveo Diagnostic Page](https://developers.coveo.com/display/public/SC201406/Coveo+Diagnostic+Page). I will not lie, this is one of my favorite new feature.

## The new process and where you should look first when something is wrong


### Sitecore

**1. Admin service issue.**

The first blocking issue you could meet is directly in the Sitecore Indexing Manager.  As I mentioned before, the Coveo Admin Service is the messenger for configuration-related calls, which means that it is also the first component of the chain that can fail. The Coveo for Sitecore diagnostic page should also tell you if anything is not running properly. If you do not have it, you will see the service state in the Windows Services, where it can be stopped or started. You can also access it directly through your browser using <span style="color: gray;">http://localhost/AdminService</span> or <span style="color: gray;">http://localhost/AdminService?wsdl</span>.

Now, what can go wrong with it? Well if you are using Coveo for Sitecore with a Coveo instance that you have been using with other connectors, you might have not installed the Coveo Admin Service in the first place. It is not installed by default with the Coveo Enterprise Search Installation Wizard, you need to choose the Custom Install path and make sure that it is selected.

![](/images/cesinstws2012-installingfoldersadminservice3.png)

The other common issue is with the https certificate. If you are using a restrictive certificate imposing an instance name, then the default local host will not pass the validation step. Simply change the <span style="color: gray;">&lt;AdminServiceUri&gt;</span> value from <span style="color: gray;">localhost/AdminService</span> to <span style="color: gray;">[qualified name]/AdminService</span> in the <span style="color: gray;">Coveo.SearchProvider.config</span>.

Finally, you must leave some breathing space for the service, so do not forget to enable port 80 or 443 depending on the security of your service.  The ports can be managed in the <span style="color: gray;">Coveo.CES.AdminService.exe.config</span> file located by default under <span style="color: gray;">C:\Program Files\Coveo Enterprise Search 7\Bin\AdminServiceSecurity</span>. An issue with the Admin Service could return this type of error in the Sitecore Indexing manager:

<span style="color: red;">System.ServiceModel.EndpointNotFoundException: There was no endpoint listening at http://127.0.0.1/AdminService that could accept the message.</span>

NOTE: The Coveo Admin Service has its own logging stored by default under <span style="color: gray;">C:\Program\ Files\Coveo Enterprise Search 7\Bin</span>

**2. Version mismatch issue.**

This is a common one and you can easily make a mistake. Even for minor upgrades, an installation of both the CES instance and the Coveo for Sitecore package, including the Search Provider and Search Interface, needs to be performed. A failure to do so might produce several errors at indexing and querying time. One of the most common error would be a "method not found" exceptions. To double check your versions, use the property options on the Coveo DLLs in the bin folder of your Sitecore. Consult the Coveo Online Help for more information on both the [Coveo Enterprise Search 7](http://onlinehelp.coveo.com/en/ces/7.0/administrator/coveo_enterprise_search_70_release_notes.htm) and [Coveo For Sitecore](href="http://onlinehelp.coveo.com/en/ces/7.0/administrator/coveo_for_sitecore_3_0_-_release_notes.htm) versions.

**3. Duplicate Key Exception.**

This is a hidden issue fixed in July 2014's version of Coveo for Sitecore. The Coveo Admin Service will not be able to create a new Security Provider if an old User Identity is already active. If the indexing manager fails with the following Exception:

<span style="color: red;">Fail to add security provider “Security Provider” on source …</span>

then simply navigate to the Coveo Administration Tool under the <span style="color: gray;">Configuration</span> &gt;&gt; <span style="color: gray;">Security</span> tab. Choose the User Identity menu and delete any User identity with the following name:  <span style="color: gray;">Sitecore Admin for [Your instance name]</span>.

**4. QueueURI invalid.**

Not much to say on this one, the QueueURI is set in the <span style="color: gray;">Coveo.SearchProvider.config</span> file. 

Make sure that it is matching the one set in the RabbitMQ Management page. See the RabbitMQ section below for more details on how to reach this page. If the QueueURI is not set properly, you will most likely hit this error while indexing:

<span style="color: red;">RabbitMQ.Client.Exceptions.BrokerUnreachableException: "None of the specified endpoints were reachable."</span>

TIP: Sitecore produces an enormous amount of logging but everything related to the Coveo Search Provider at the Sitecore level can be found in the logs with the following naming convention: <span style="color: gray;">log[timestamp].txt</span>. It is with all the other logs in the Data/logs folder of your Sitecore instance. No need to look in the Coveo file system until now.

IMPORTANT: Closing the dialog window will not stop the indexing process. The only way to force Sitecore to stop is through a recycle/reset in IIS.

<span style="color: red;">WARNING: Depending on how you customize your Coveo for Sitecore, you might play around the config files under the App_Config folder of your Sitecore instance. Do remember that Sitecore reads EVERY file with the .config extension. So if you are to keep a few files as backup, keep in mind that you should use .config.backup and not .backup.config as an extension. It is common Sitecore knowledge but since a mistake is easily made, I prefer to mention it here. Remember that Sitecore does provide you with a merge of all the config file in the Show Config page: <span style="text-decoration: underline;">http://[sitecoreinstance]/sitecore/admin/showconfig.aspx</span></span>


### Coveo

**1. Live monitoring stopped.** 

As I mentioned before, the new Coveo for Sitecore integration has the "Everything is done in Sitecore" mindset. 95% of the time, you will be conducting publishing, indexing and even troubleshooting operations only in Sitecore. Still, if the indexing is working properly in Sitecore but the CES Console is not logging any activity, then you might want to take a look at the <span style="color: gray;">Coveo Administration Tools</span>.
Under the <span style="color: gray;">Index</span> &gt;&gt; <span style="color: gray;">Sources and Collections</span> tab, you will find the Sitecore Search Provider collection with the sources corresponding to the database name set in your <span style="color: gray;">Coveo.SearchProvider.config</span>.

NOTE: Adding databases or changing source name for scaling scenarios is described in further details in our [Scaling Guide](https://developers.coveo.com/display/SC201406/Scaling+Coveo+for+Sitecore+Over+Multiple+Hosts).

There is no point on trying to rebuild or refresh manually these sources, they are plugged to the search provider and are commanded under the cover by the Sitecore Indexing Manager. What you can do however, is the good old "turn it off and on again" that the IT world has been relying on since the beginning of the computer era. To do so here, click on one of the sources, it will lead you to the source status page. From there, you will be able to disable and re-enable the live-monitoring operation. Keep an eye on the CES Console since it will tell you straight away (and in bright red) if anything is wrong. You can also use the check boxes to select multiple sources and use the drop-down box to disable and enable live monitoring. Most of the time, this will resume the indexing operation.

**2. The security provider handbrake.**

The security provider is now created automatically by the Admin service, thus reducing the configuration errors which were frequents with earlier connectors. Still, a downed Sitecore can prevent the security provider to load properly, triggering an handbrake on the indexing operation. Usually, Coveo will be nice enough to warn you with the following message on the status page of the Coveo Administration Tools:

<span style="color: red;">A security provider is not properly configured.</span>

Simply navigate to your Sitecore Security Provider under the <span style="color: gray;">Configuration</span> &gt;&gt; <span style="color: gray;">Security</span> tab and reload it by clicking on <span style="color: gray;">Accept Changes</span> at the bottom of the page. Once it is done, simply disable and enable the live monitoring operation on the source and you should be good to go.

**3. QueueURI invalid part 2.**

There are two locations where you can set the QueueURI, the <span style="color: gray;">Coveo.SearchProvider.config</span> file and the Coveo Administration Tool. As I mentioned before, an invalid QueueUri in the .config file will break the indexing process in Sitecore. Same goes on Coveo side but it can be harder to spot and if it is not fixed quickly, it could end up filling the Queue, and your disk at the same time.

The QueueURI is defined in the source’s general properties under the <span style="color: gray;">Index</span> &gt;&gt; <span style="color: gray;">Sources and Collections</span> tab. It is set automatically by the Admin Service when you first perform a rebuild in Sitecore, so a mismatch is not a common error but it is worth keeping it as a reminder in your troubleshooting guide. If you have to change it, do not forget to accept the changes at the bottom of the page.


### RabbitMQ

The newest fluffy addition to the Coveo and Sitecore relationship is RabbitMQ. The default access point of the management is <span style="color: gray;">http://localhost:15672/</span> and the username and password are <span style="color: gray;">guest/guest</span>. RabbitMQ will give you a simple and user friendly overview of the current crawling operation. While rebuilding, an empty queue will be a clear sign that nothing left Sitecore, while a full and idle queue will reveal a Coveo issue.

![](/images/rabbit_mq_management_plugin_2.png)

<span style="color: red;">WARNING: If you ran several indexing operations that are not being picked up by Coveo or you changed the source name multiple times, the documents will not be automatically cleared from the Queue. This could end up filling up the drive on which your RabbitMQ is installed. By clicking on the Queue, you will be able to Delete or Purge it. We don't recommend to use the purge unless the Queue is not used anymore, in case of a source name change for example.</span>

LAST TIP: Coveo supports [log4net](https://developers.coveo.com/display/public/SC201406/Using+the+Sitecore+Search+Provider#UsingtheSitecoreSearchProvider-UsingLoggingforDebuggingPurposes), do not hesitate to use it!

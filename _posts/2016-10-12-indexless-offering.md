---
layout: post

title: "Coveo's upcoming 'indexless' offering"

author:
  name: Martin Laporte
  bio: R&D Director
  twitter: martinlaporte
  image: mlaporte.jpg
---

The Coveo R&D delegation just came back from Dreamforce in San Francisco and we had a fantastic week. Coveo sends a pretty large contingent every year, which includes part of our teams working directly or indirectly on our Coveo for Salesforce product.

One thing of great importance to me is that we finally got to announce our upcoming freemium offering, which will allow our customers and partners to use Coveo's advanced UIs, Usage Analytics, and machine learning based ranking at a very low price (even for free, in some cases!). I've been working on this project on and off for almost a year now (starting from a late night prototype), and it has since grown into a full product. I can't wait to see people using this in the field.

<!-- more -->

We R&D folks call it the "indexless" version, and it can be seen as the little brother of our existing Coveo for Salesforce offering. Granted, this is not a catchy name (as some of our execs are keen to remind us - hi guys!). But this is a technical blog, and I'll be looking at it with my nerd goggles so it makes sense to use this name here. Also, it describes pretty much exactly what this product is all about.

In short, this offering allows one to use a large part of the Coveo stack, including our highly configurable UIs, Usage Analytics, and machine learning based ranking, without having to index content in a separate structure hosted in our Cloud Platform. The trick is that deep into our own stack we use Salesforce's own search APIs (through SOSL and SOQL) to run the low level queries on their own index, meaning that we don't have to maintain one within our own infrastructure.

Not having to maintain an index means very low costs for us (it's *by far* the most expensive part of our infrastructure), which makes an entry-level "free-forever" offering possible.

![Architecture Diagram](/images/2016-10-12-indexless/diagram.png "Architecture Diagram")

The Salesforce index & APIs have some pretty big limitations, but we've tried to work around those as best as we could. For example, it provides no native support for facets, but we implemented some basic ones on top of their APIs. Also, it doesn't really allow searching several type of objects at once (internally, Salesforce maintains a separate index for each type of object, for any organization of a significant size). But by using Coveo Machine Learning and some clever rescoring on our part, we are able to simulate this to a certain extent.

From an end-user or developer of view, using an "indexless" organization is very similar to a regular Coveo organization. The query syntax and APIs are exactly the same (we parse queries using our own parser, and then transform those into SOSL or SOQL by navigating the AST). There are a few corner cases that we couldn't map to the Salesforce API, but those are weird enough not to cause a real problem.

Another big difference compared to the full Coveo version is that it is not possible to use Coveo's connectors to index external content. But, in the last few years, we've been investing heavily in features that bring value even when a single source of content is involved (Salesforce in this case). For example:

* Our [open-source UI framework](https://github.com/coveo/search-ui) & query pipeline are extremely configurable, and are great tools to build search pages that fit customer's specific needs.
* Our Usage Analytics solution records everything that happens in the aforementioned UI, and allows building reports providing very detailed insights about how users are making use of the search page, what content they are using, etc.
* Our Coveo [Machine Learning](https://www.coveo.com/go?dest=cloudhelp&lcid=9&context=177) technology uses the data accumulated in our Usage Analytics to immensely enhance the quality of search results, among other things.

In our opinion, combining those features on top of the Salesforce index makes perfect sense, and we can clearly see integrators making use of this to help deliver great value to their customers. And in the case where a customer really needs external connectivity, we'll provide an easy upgrade path to using the Coveo index.

For the moment, we will focus our efforts on use cases targeting Community Cloud & Community Builder. Coveo already ships with a set of components making it very easy to replace the built-in search in a Lightning Community with our own UI; we will adapt those components so that they work well with the "indexless" version.

Here are some screenshots of a search page running our Indexless version within Salesforce's own Capricorn Cafe demo:

![Search Page](/images/2016-10-12-indexless/search-page.png "Search Page")

![Usage Analytics](/images/2016-10-12-indexless/analytics.png "Usage Analytics")

We plan on releasing this new version somewhere in Q1 2017. In the meantime, if you are a Salesforce integrator working with Lightning Communities and would like to be part of a beta program, please contact us at salesforce@coveo.com.


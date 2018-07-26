---
layout: post

title: "Deep Learning Showdown"
#subtitle: ""

author:
  name: Joseph Szymborski
  bio: Machine Learning Developer @ Coveo R&D, and habitual maker of funky graphs
  twitter: jszym
  image: jszym.jpg
---

If you're one of the many passengers on the deep learning hype-train (welcome aboard), you've at some point almost certainly experienced the great confusion of having to choose a deep learning framework.

If you're trying to choose a framework, or maybe re-evaluating your choices, I might be able to help! 

I've done a lot of the leg work for you, having made a pretty comprehensive report on the state of DL frameworks that compares their strengths and weaknesses.

<!-- more -->

I compared these frameworks based on three categories that we value most (Support & Community, API, and Platform), and used (as much as possible) quantitative measures to compare each one. A bit of warning, this is a long post, so you can always [**skip ahead to the overall results**](#podium) if you're impatient.

## Table of Contents

* [**Methodology Summary**](#matchrules)
* [**Frameworks in this Comparison**](#belidgerents)
* [**Overall Results**](#podium)
* [**Round One: Support & Community**](#round1)
* [**Round Two: API & Internals**](#round2)
* [**Round Three: Platform**](#round3)
* [**Discussion**](#discussion)

{:#matchrules}

## Match Rules: Methodology Summary

Each framework was scored on three categories, each with its own sub-criteria:

* [**Round One: Support &amp; Community**](#round1)
  * Sponsor --- *How is this framework funded?*
  * Activity --- *Is it actively developed?*
  * Ecosystem --- *Are people using it?*

* [**Round Two: API & Internals**](#round2)
  * Sym/Dyn Graph Building --- *Does the framework support dynamic, or old-school symbolic graph computational building?*
  * Numerics --- *What numeric backend is being used? Is it actively developed? Easy to use?*
  * OOTB NN Ops --- *What are the out-of-the box neural network layers and operations that are supported?*

* [**Round Three: Platform**](#round3)
  * Scalability --- *Does this framework support (easy-to-use) multi-machine training/prediction?*
  * Languages --- *Are there many, mature, language bindings?*
  * OS Support --- *Are many OS environments supported?*
  * AWS Support --- *Is it easy to use in the AWS cloud?*
  * ONNX Support --- *Can we serialise models to the ONNX format?*

*"How are each of these criteria measured?!"* I hear the throng of data-hungry quants cry out in anguish and anticipation --- don't worry, I go into detail for each category's methodology in sections to come 🤓.

Without further ado, let's meet the frameworks.

{:#belidgerents}

## The Belligerents: Frameworks in this Comparison

This isn't an exhaustive list of *all deep learning frameworks in existence&trade;*, but it's a pretty comprehensive list of frameworks that have either (1) some sort of following or (2) interesting properties.


||Framework|Primary Association|Year of First<br/>Public Release|Comments|  
|:--:|:----:|:----:|:----:|---------|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/bigdl.png" width="60" />|[BigDL](https://github.com/intel-analytics/BigDL)|[Intel Analytics](https://www.intel.com/content/www/us/en/analytics/overview.html)|2017|Big data focus (Spark, Hadoop, & friends).|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/caffe.png" width="60" />|[Caffé](http://caffe.berkeleyvision.org/)|[Berkley's BAIR](http://bair.berkeley.edu/)|At least [2014](https://arxiv.org/abs/1408.5093)|Very large model zoo.|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/caffe2.png" width="60" />|[Caffé2](https://caffe2.ai/)|[Facebook's FAIR](https://research.fb.com/category/facebook-ai-research/)|2017|Used at Facebook in production.|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/chainer.png" width="60" />|[Chainer](https://chainer.org/)|[Preferred Networks, Inc](https://www.preferred-networks.jp/en/)|2015|Uses dynamic auto-differentiation. 🎉|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/ms.png" width="60" />|[CNTK](https://www.microsoft.com/en-us/cognitive-toolkit/)|[Microsoft Research](https://www.microsoft.com/en-us/research/)|2016|Very good Azure support (predictably).|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/dl4j.png" width="60" />|[Deeplearning4J](https://deeplearning4j.org/)|[Skymind.ai](http://skymind.ai)|2014|Just released a [1.0 in beta](https://github.com/deeplearning4j/deeplearning4j/releases/tag/deeplearning4j-1.0.0-beta).|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/mx.png" width="60" />|[Apache MXNet](https://mxnet.apache.org/)|[Apache Software Foundation](https://www.apache.org/)|At least 2015 |AWS ["framework of choice"](https://www.allthingsdistributed.com/2016/11/mxnet-default-framework-deep-learning-aws.html). |
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/neon.png" width="60" />|[Neon](https://ai.intel.com/neon/)|[Intel Nervana](https://ai.intel.com/intel-nervana/)|2015|Designed with speed as a primary focus.|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/paddlepaddle.gif" width="60" />|[PaddlePaddle](http://www.paddlepaddle.org/)|[Baidu Research](http://research.baidu.com/)|2016|Major version still 0.x. Much of the example documentation is in Mandarin.|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/pytorch.jpg" width="60" />|[PyTorch](https://pytorch.org/)|[Facebook's FAIR](https://research.fb.com/category/facebook-ai-research/)|2017|Still 0.x, but 1.0 is coming very soon. Also, dynamic auto-diff!|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/tf.png" width="60" />|[TensorFlow](https://www.tensorflow.org/)|[Google Brain](https://ai.google/research/teams/brain)|2015|GCP Support.|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/torch.png" width="60" />|[Torch](http://torch.ch)|Ronan, Clément, Koray, & Soumith|[2002](http://citeseerx.ist.psu.edu/viewdoc/download;jsessionid=CBB0C8A5FE34F6D6DAFF997F6B6A205A?doi=10.1.1.8.9850&rep=rep1&type=pdf)|Lua, Started out with S. Bengio et al.|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/theano.png" width="60" />|[Theano](http://www.deeplearning.net/software/theano/)|[MILA](https://mila.quebec/)/LISA|At least 2008|[No longer supported](https://groups.google.com/d/msg/theano-users/7Poq8BZutbY/rNCIfvAEAwAJ) by MILA.|

### A Notable Omission

{:#foot0_origin}
A perhaps noticeable omission in this list is Keras, a framework headed by François Chollet, whose API is easy to use and aims to be a sort of *lingua franca*, fronting a TensorFlow, Theano, CNTK, or MXNet backend<sup>[0](#foot0)</sup>. Keras got excluded from this comparison for a couple of reasons, not least of which are:

0. Most of the criteria here would change depending on what backend Keras is using.
1. All of Keras' stable and experimental backends are contestants in the showdown.

If you're currently evaluating Keras as a solution and want to use this guide, the [API & Internals](#round2) score of the framework you're considering as a backend is probably the most relevant part for you.

{:#podium}

## The Podium: Overall Results

We've all got deadlines, so I'll cut straight to the overall scores of each framework (below). These overall scores are an average of the three category score. Again, for my fellow detail-geeks, I break down each category in later sections.

{:.center}
![Overall Scores]({{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/annotated-overall-white.svg.png)

{:.center}
![Radar Plots of Categories]({{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/radars-double-white.svg.png)

{:.caption}
I promise the marketing team didn't make me make the radar plots look like the Coveo logo

The tiers here (and elsewhere in this document) aren't standardised and don't have a whole lot of meaning outside of the fact that it's a convenient way of thinking about how frameworks have clustered in their scores.

You can continue on to the break-down of how frameworks fared in each category below, or [skip ahead to the discussion](#discussion) that attempts to tie all these findings up in a nice narrative bow.

{:#round1}

## Round One: Support &amp; Community

If you're going to invest time and effort in a code-base that depends on a framework, you want to know that there's a community of  battle-testing, bug-reporting, ticket-answering, and fix-merging devs somewhere in the world.

Another great side-effect of having a large user-base is that it's more and more common to find implementations of popular papers and architectures that were originally written in another framework or (sadly more often) not supplied at all.

### Category Criteria

{:#foot2_origin}
|Criterion|Question it answers|Rationale|Scoring|
|---|-------|----------|----------|
|Sponsor|*How is the development of the framework funded?*|The more money a framework has, the more likely it's going to stay active long term.|**0** for an individual,<br/>**1** for sponsors who allocated few resources, and<br/>**2** for sponsors who allocated many resources.
|Activity|*What is the dev't activity of the framework?*|Bugs are more likely to be patched and features to be merged with active dev't.|Score is assigned as the sum of (1) the inverse of the last **commit in weeks**, and (2) the number of **pull requests merged** this month.|
|Ecosystem|*Are people building models with this framework?*|Having ready-made models of popular architectures and pre-trained weights can be a huge speed-up to development.|Sum of the number of the log **GitHub repos** and the log of **StackOverflow questions**<sup>[1](#foot1)</sup>.|
|Documentation|*Are the docs complete?*|Ever try writing code for a framework with bad documentation? Nigh impossible. Undocumented features might as well not exist.|Currently qualitative score from one to three<sup>[2](#foot2)</sup>.|

### Results
Below are the Support & Community scores, as well as a break down of each criteria by framework.

{:.center}
![Support & Community Overall Score]({{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/annotated-snc3-white.svg.png)

{:.center}
![Criteria Score Breakdown for Support & Community Category]({{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/snc_criteria_annotated-white.svg.png)

{:.caption}
Breakdown of each criteria in this category by framework.

{:#foot3_origin}
One of the more interesting scores in this category, in my opinion, is the `ecosystem` score. No framework's `ecosystem` score can really hold a candle to TensorFlow. It should be said, however, that while it is far and away from 3 year-old TensorFlow's score<sup>[3](#foot3)</sup>, PyTorch has in 1 year amassed an `ecosystem` that is not dissimilar to that of the far-older leaders of yesteryear like Theano, Caffé, or it's older brother Torch. With growth like that, it's not hard to see PyTorch as a challenger to TensorFlow's current seat on the throne of developer mind-share.

CNTK and MXNet are two other frameworks with deep-pocket sponsors, but are hobbled in this category by middling ecosystem and development activity scores.

Finally, the pioneering trio of Theano, Caffé, and Torch have development rates that have reached maintenance levels for reasons one can speculate could range from approaching feature-completeness to being abandoned (as is [certainly the case with Theano](https://groups.google.com/d/msg/theano-users/7Poq8BZutbY/rNCIfvAEAwAJ)).

{:#round2}

## Round Two: API & Internals

This a under-the-hood, wheel-kicking section, where we look at what these frameworks can and can't do, and what underlying tech they use to do it. Here's how I measured that:

### Category Criteria

{:#foot4_origin}

|Criterion|Question it answers|Rationale|Scoring|
|---|-------|----------|----------|
|Sym/Dyn Graph<sup>[4](#foot4)</sup>|*Does the framework support dynamic, or old-school symbolic computational graph building?*|There's too much to say on the topic to fit here, but here's [a great talk](https://insidehpc.com/2017/12/deep-learning-automatic-differentiation-theano-pytorch/). The main take-away for us is that symbolic graph builders need their own API and require a compile step while dynamic ones don't.|**2** for dynamic,<br/>**1** for symbolic, and<br/>**0** for neither/manual.
|Numerics|*What numeric backend is being used? Is it actively developed? Easy to use?*|Deep learning libraries are often deeply integrated with numerics libraries, and having mature, easy-to-use numerics libraries is very important to being able to write custom layers as well as downstream applications.|Score of **0-5** for maturity, score of **0-5** for ease-of-use, activity score equal to sum of the inverse of the **number of weeks since last commit** and number of **merged pull requests** in the last month. |
|OOTB NN Ops|*What are the out-of-the box neural network layers and operations that are supported?*|The pre-built Legos that make up all networks, you definitely want to be able to reach for a wide variety of layer types, ranging from run-of-the-mill convolutional layers, to LSTMs.|**1** point for every implemented layer/optimiser of a sample of 32 that I identified. **0.5** for cases where implementing the layer is particularly trivial.|

### Results

Below are the API & Internals scores, as well as a break down of each criteria by framework.

{:.center}
![API & Internals Overall Score]({{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/annotated-api-scores-white.svg.png)

{:.center}
![Criteria Score Breakdown for API & Internals Category]({{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/internals_criteria_white.svg.png)

{:.caption}
Breakdown of each criteria in this category by framework.<br/>
I wasn't able to determine a numerics score for Caffé, Caffé2, and PaddlePaddle, so that criteria is not factored in their category average.


{:#foot5_origin}
This category is largely skewed by the `symbolic/dynamic graph building` score, but that's as intended. From personal experience and the anecdotal experience of [smart people I respect](http://www.fast.ai/2017/09/08/introducing-pytorch-for-fastai/), dynamic-graph building offers a flexibility and natural flow that Keras/Lasagne's<sup>[5](#foot5)</sup> familiar and forgiving "stacked-layers" approach is often incapable of.

I can't help but precognise the grumblings of TensorFlow loyalists who have by now realised I've marked TensorFlow as having a symbolic computational graph builder despite the new "[Eager Execution](https://www.tensorflow.org/guide/eager)" mode it rolled out fairly recently. While there are a number of reasons why I did not consider it, it mostly boils down to the "eager" mode striking me as a bit of a second thought; suffering from [performance issues](https://github.com/tensorflow/tensorflow/issues/14130) and likely not being suitable for production use. Still, it's very cool to see that TensorFlow has the introspective capacity (and developer hours) to address concerns over a more usable PyTorch developer experience.

In regard to out-of-box neural network operations, most modern networks have more or less coalesced on a set of flexible and reusable operations that make everyones life easier. Still, some more exotic but useful layers like Hierarchical Softmax layers are few and far in-between (which is probably fine, but I'd personally would love not having to reimplement it every time I move between frameworks). I know I might be "dynamic graph fanboy"'ing a bit, but having a dynamic graph also helps you to use operations in a more portable way, allowing you not to have to require as much on built-in ops and the framework's specific API.

{:#round3}

## Round Three: Platform

Being able to integrate a framework into your existing code-base and stack is a big consideration when deploying deep-learning models in production. This category tries to measure your ability to do so with ease by taking into account things like the number of mature API bindings, OS support, and built-in solutions for scalability.

### Category Criteria

|Criterion|Question it answers|Rationale|Scoring|
|---|-------|----------|----------|
|API Languages|*Are there many, mature, language bindings?*|Having multiple language bindings offers flexibility for integrating into existing code bases, as well as ergonomics when APIs are written in expressive, dynamic languages like Python.|**+1** for each language, weighted by maturity **(0-1)** of the binding.|
|Scalability|*Does this framework support (easy-to-use) multi-machine training/prediction?*|Deep Learning is a fellow hype-word and best friend to Big Data, which means easy cluster computer and data parallelism is very valuable.|**0** if none available,<br/>**1** for 3<sup>rd</sup> party solutions, and<br/>**2** for out-of-the-box support|
|OS Support|*Are many OS environments supported?*|Being able to develop and deploy on any OS makes developing in teams and in heterogeneous environments a lot easier.|**+1** for each OS *officially* supported.|
|AWS Support|*Is it easy to use in the Amazon cloud?*|Being able to deploy to autoscaling clusters in the cloud is a beautiful thing. We're focusing on AWS here because Coveo's cloud services are powered by Amazon.|**3** for officially endorsed,<br/>**2** for officially supported,<br/>**1** for example of it working,<br/>**0** for no information.|
|ONNX Support|*Can we serialise models to the ONNX format?*|[ONNX is an exciting open format](https://onnx.ai/) whose goal is to make models and their weights portable between frameworks.|**2** for built-in support,<br/>**1** for community support,<br/>**0** for no support.|

{:.center}
![Oveall Platform Score]({{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/platform_white.svg.png)

{:.center}
![Criteria Score Breakdown for Platform Category]({{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/platform_criteria_white.svg.png)

{:.caption}
Breakdown of each criteria in this category by framework.

Well, there's no way other way to say it: MXNet blew past the competition here. It's not much of a surprise, however, as being able to run on a wide variety of machine is is pretty much MXNet's *raison d'être*; considering it's tagline "A Scalable Deep Learning Framework".

ONNX invites the very interesting proposition of writing your code in a framework you find flexible and easy to debug (*e.g.* PyTorch) and deploy it on a framework which has either the language bindings you need, or works well in a certain cloud environment (*e.g.* Apache MXNet or CNTK). The only more recent framework not to have some degree of built-in support of ONNX is really TensorFlow, and that's largely due to some boring politicking. Worth mentioning, while I couldn't find any references to ONNX support in DL4J, they do support import Keras models, which can be a useful way of designing architectures or training networks and deploying them on the JVM. All the same, it's not quite ONNX, as Keras isn't exactly a panacea (despite being very popular).

{:#discussion}
## Discussion

### Closing the Hardware-Software Gap

If you haven't already heard the much-repeated and over-simplified<sup>[6](#foot6)</sup> parable of how Neural Network came to be the stuff of hype-legend, it begins with [some](https://en.wikipedia.org/wiki/Walter_Pitts) [ahead-of-their-time](https://en.wikipedia.org/wiki/Celeste_McCollough) [visionaries](https://en.wikipedia.org/wiki/Frank_Rosenblatt) in the 60's that [over-promised](https://www.nytimes.com/1958/07/08/archives/new-navy-device-learns-by-doing-psychologist-shows-embryo-of.html), [under-performed](https://www.quora.com/Why-cant-the-XOR-problem-be-solved-by-a-one-layer-perceptron), and eventually lead the field into becoming a [research-funding pariah](https://en.wikipedia.org/wiki/AI_winter). Not to discount the [theoretical](https://doi.org/10.1007/BF01931367) [advances](https://doi.org/10.1038/323533a0) that happened during that time, but one of the largest barriers that were lifted between the AI winter of the 1970s and the deep-learning mania of the 2010s is the **hardware barrier**. Accessible and affordable compute units were being pumped out *en masse* in the form of consumer GPUs marketed towards the gaming and PC enthusiast community.

I think that if the explosion of the number of deep learning frameworks and the lack of clear winner tells us that we're behind the eight-ball when it comes to mature software solutions to take advantage of the surprisingly bountiful compute harvest GPUs have given us. Part of that is that while the hype-train is traveling with great acceleration, it only left the station somewhere around 2012. We'll close the gap eventually, and post like these will disappear, but what that future will look like is, as always, uncertain...

{:.center}
![The number of GPU cores has exploded over the ears, and interest in Deep Learning has followed behind.]({{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/hardware_and_usage_white.svg.png)

{:.caption}
I'm not asserting [correlation implies causation](http://www.tylervigen.com/spurious-correlations), but I am trying to illustrate that mindshare in AI has been outpaced by hardware advancements.

### Monoculture, Triumvirate, or Plurality?

It's clear that Google is banking on a TensorFlow hegemony; from their hesistance to join ONNX, to how they've positioned TensorFlow in the [Google Cloud Platform](https://cloud.google.com/ml-engine/), not to mention the resources they've spent on software and [hardware](https://www.tomshardware.com/news/google-tensor-processing-unit-machine-learning,31834.html) development.

However, with the efforts of Facebook's devs and Amazon's platform support, we might just as likely see a triumvirate of tech giants; each sharing equal bits of market share and staking out segments like academics or people running on the Google Cloud. While that might seem to be the case at the moment, much like the Roman Triumvirates, I don't for see them being [particularly stable or lasting long](https://en.wikipedia.org/wiki/Assassination_of_Julius_Caesar). Developers long for interoperability and the ability to bring tech to whatever stack is in fashion.

Which bring us to what I think is the most likely outcome: a wide plurality of interoperable frameworks. I think there are a couple of factors that support this. The first being that, as mentioned earlier, devs want to be able to move software between stacks. Secondly, an often underestimated consideration, in my opinion, is that there are far more people who can make use of existing neural network architectures, than those who know or need to design new ones. What's more is that ratio is probably only going to increase over time as more public models get written.

### The Take-Away?

My advice? You don't need to chose a framework that's both great at prototyping/designing an architecture as well as deploying and serving those models.

First, find a framework that you enjoy programming in that exports to ONNX (my personal favourite is PyTorch). Then, when/if you need to move to a non-Python code-base or need to deploy to a cluster or mobile environment that your prototyping framework doesn't play nicely with, switch to a framework that supports your environment best and can import ONNX (which is likely going to be Apache MXNet).
{:.foot7_origin}
Projects like [TVM](https://tvm.ai/about)<sup>[7](#foot7)</sup> have already embraced this hybrid approach, leaving the programmer productivity to existing frameworks, and focusing on support a diverse number of deploy languages and platforms.

I hope that was helpful! Leave any questions, concerns, or overwhelmingly positive feedback down in the comments box below!

## Footnotes
{:#foot0}
**0.** There are a number of experimental backends like MXNet and DL4J also in the pipeline. Writing backends for Keras is actually not a horrible experience, which is pretty cool. [&#x2B8C;](#foot0_origin)
{:#foot1}
**1.** It's important to bear in mind that this measure is on a log scale later on. It means that TensorFlow is super dominant and that Neon might as well not exist. [&#x2B8C;](#foot2_origin)
{:#foot2}
**2.** If you can think of a less subjective measure for this or any other metric, leave a comment! Would love to read them. [&#x2B8C;](#foot2_origin)
{:#foot3}
**3.** Again, just a reminder that the `ecosystem` score is logarithmic, so even small differences here are important. [&#x2B8C;](#foot3_origin)
{:#foot4}
**4.** The definitions I use for "symbolic" and "dynamic" graph builders are from [this presentation](https://www.slideshare.net/slideshow/embed_code/key/BJCTiY3U8UZ7AO) (slide 43 and onward). Some people term what I refer to as "symbolic computational graph building" as "[static](https://stackoverflow.com/questions/46154189/what-is-the-difference-of-static-computational-graphs-in-tensorflow-and-dynamic) computational graph building.[&#x2B8C;](#foot4_origin)
{:#foot5}
**5.** [Lasagne](https://github.com/Lasagne/Lasagne), for those summer children out there, is/was(?) a predescessor to Keras that had a very similar API, but built for Theano exclusively. It was pretty awesome at the time.[&#x2B8C;](#foot5_origin)
{:#foot6}
**6.** For an in-depth version that doesn't resort to simplifications bordering on apocrypha for narrative's sake, you can check out [this great article](http://www.andreykurenkov.com/writing/ai/a-brief-history-of-neural-nets-and-deep-learning/). [&#x2B8C;](#discussion)
{:#foot7}
**7.** TVM wasn't included in this comparison because it's less of a framework for the designing of networks, and more of a way to compile models into environments the original frameworks don't support. It's a super interesting project that I think deserves more attention. [&#x2B8C;](#foot7_origin)

<style>
.center {
  text-align: center;
}
.caption {
  text-align: center;
  margin-top:-30px;
  font-style:italic;
}
</style>
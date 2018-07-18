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

If you're one of the many passangers on the deep learning hype-train (welcome aboard), you've at some point almost certainly experienced the great confusion of having to choose a deep learning framework.

If you're trying to choose a framework, or maybe re-evaluating your choices, I might be able to help! 

I've done a lot of the leg work for you, having made a pretty comprehensive report on the state of DL frameworks that compares their strengths and weaknesses.

<!-- more -->

I compared these frameworks based on three categories that we value most (Support & Community, API, and Platform), and used (as much as possible) quantitative measures to compare each one.

Without further ado, let's meet the frameworks.

## Frameworks in this Comparison: The Belidgerents

This isn't an exauhstive list of *all deep learning frameworks in existence&trade;*, but it's a pretty comprehensive list of frameworks that have either (1) some sort of following or (2) interesting properties.


||Framework|Primary Association|Year of First<br/>Public Release|Comments|  
|:--:|:----:|:----:|:----:|---------|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/bigdl.png" width="60" />|[BigDL](https://github.com/intel-analytics/BigDL)|[Intel Analytics](https://www.intel.com/content/www/us/en/analytics/overview.html)|2017|Big data focus (Spark, Hadoop, & friends)|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/caffe.png" width="60" />|[Caffé](http://caffe.berkeleyvision.org/)|[Berkley's BAIR](http://bair.berkeley.edu/)|At least [2014](https://arxiv.org/abs/1408.5093)|Very large model zoo|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/caffe2.png" width="60" />|[Caffé2](https://caffe2.ai/)|[Facebook's FAIR](https://research.fb.com/category/facebook-ai-research/)|2017|Used at Facebook in production|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/chainer.png" width="60" />|[Chainer](https://chainer.org/)|[Preferred Networks, Inc](https://www.preferred-networks.jp/en/)|2015|Uses dynamic auto-differentiation 🎉|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/ms.png" width="60" />|[CNTK](https://www.microsoft.com/en-us/cognitive-toolkit/)|[Microsoft Research](https://www.microsoft.com/en-us/research/)|2016|Very good Azure support|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/dl4j.png" width="60" />|[Deeplearning4J](https://deeplearning4j.org/)|[Skymind.ai](http://skymind.ai)|2014|Just released a [1.0 in beta](https://github.com/deeplearning4j/deeplearning4j/releases/tag/deeplearning4j-1.0.0-beta)|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/mx.png" width="60" />|[Apache MXNet](https://mxnet.apache.org/)|[Apache Software Foundation](https://www.apache.org/)|At least 2015 |AWS ["framework of choice"](https://www.allthingsdistributed.com/2016/11/mxnet-default-framework-deep-learning-aws.html) |
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/neon.png" width="60" />|[Neon](https://ai.intel.com/neon/)|[Intel Nervana](https://ai.intel.com/intel-nervana/)|2015|Designed with speed as a primary focus|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/paddlepaddle.gif" width="60" />|[PaddlePaddle](http://www.paddlepaddle.org/)|[Baidu Research](http://research.baidu.com/)|2016|Major version still 0.x. Much of the example documentation is in Mandarin.|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/pytorch.jpg" width="60" />|[PyTorch](https://pytorch.org/)|[Facebook's FAIR](https://research.fb.com/category/facebook-ai-research/)|2017|Still 0.x, but 1.0 soon. Also, dynamic auto-diff!|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/tf.png" width="60" />|[Tensorflow](https://www.tensorflow.org/)|[Google Brain](https://ai.google/research/teams/brain)|2015|GCP Support|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/torch.png" width="60" />|[Torch](http://torch.ch)|Ronan, Clément, Koray, & Soumith|[2002](http://citeseerx.ist.psu.edu/viewdoc/download;jsessionid=CBB0C8A5FE34F6D6DAFF997F6B6A205A?doi=10.1.1.8.9850&rep=rep1&type=pdf)|Lua, Started out with S. Bengio et al.|
|<img src="{{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/logos/theano.png" width="60" />|[Theano](http://www.deeplearning.net/software/theano/)|[MILA](https://mila.quebec/)/LISA|At least 2008|No longer supported by MILA.|

## Methodology Summary: Match Rules

Each framework was scored on three categories, each with its own sub-criteria:

* **Support &amp; Community**
  * Sponsor --- *How is this framework funded?*
  * Activity --- *Is it actively developped?*
  * Ecosystem --- *Are people using it?*

* **API**
  * Sym/Dyn Autodiff --- *Does the framework support dynamic, or old-school symbolic automatic differentiation?*
  * Numerics --- *What numeric backend is being used? Is it actively developped? Easy to use?*
  * OOTB NN Ops --- *What are the out-of-the box neural network layers and operations that are supported?*

* **Platform**
  * Scalability --- *Does this framework support (easy-to-use) multi-machine training/prediction?*
  * Languages --- *Are there many, mature, language bindings?*
  * OS Support --- *Are many environments supported?*
  * AWS Support --- *Is it easy to use in the AWS cloud?*
  * ONNX Support --- *Can we serialise models to the ONNX format?*

*"How are each of these criteria measured?!"* I hear the throng of data-hungry quants cry out in anguish and anticipation --- don't worry, I go into detail for each category's methodology in sections to come 🤓.

{:#foot0_origin}
A perhaps noticeable omission in this list is Keras, a framework headed by François Chollet, whose API is easy to use and aims to be a sort of *lingua franca*, fronting a TensorFlow, Theano, or CNTK backend<sup>[0](#foot0)</sup>. Keras got excluded from this comparison for a couple of reasons, not least of which are:

0. Most of the criteria here would change depending on what backend Keras is using.
1. All of Keras' stable and experimental backends are contestants in the showdown.

If you're currently evaluating Keras as a solution and want to use this guide, the API score of the framework you're using as a backend is probably the most relevant part for you.

## Overall Results: The Podium

We've all got deadlines, so I'll cut straight to the overall scores of each framework (below). These overall scores are an average of the three category score. Again, for my fellow detail-geeks, I break down each category in later sections.

{:.center}
![Overall Scores]({{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/annotated-overall-white.svg.png)

You can get a break down of how every framework performs in each category and sub-criteria in the sections below to get a better idea of how a framework got its score.

{:.center}
![Radar Plots of Categories]({{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/radars-double-white.svg.png)

{:.caption}
I promise the marketing team didn't make me make the radar plots look like the Coveo logo

The tiers here (and elsewhere in this document) aren't standardised and don't have a whole lot of meaning outside of the fact that it's a convenient way of thinking about how frameworks have clustered in their scores.

<!-- TODO: a brief write-up of overall results -->

## Round One: Support &amp; Community

If you're going to invest time and effort in a code-base that depends on a framework, you want to know that there's a community of  battle-testing, bug-reporting, ticket-answering, and fix-merging devs somewhere in the world. 

Another great side-effect of having a large user-base is that it's more and more common to find implementations of popular papers and architectures that were originally written in another framework or (sadly more often) not supplied at all.

### Category Criteria

|Criterion|Question it answers|Rationale|Scoring|
|---|-------|----------|----------|
|Sponsor|*How is the development of the framework funded?*|The more money a framework has, the more likely it's going to stay active long term.|**0** for an individual,<br/>**1** for sponsors who allocated few resorces, and<br/>**2** for sponsors who allocated many resources.
|Activity|*What is the dev't acitivity of the framework?*|Bugs are more likely to be patched and features to be merged with active dev't.|Score is assigned as the sum of (1) the inverse of the last **commit in weeks**, and (2) the number of **push requests merged** this month.|
|Ecosystem|*Are people building models with this framework?*|Having ready-made models of popular architectures and pre-trained weights can be a huge speed-up to development.|Sum of the number of the log **GitHub repos** and the log of **StackOverflow questions**<sup>1</sup>.|
|Documentation|*Are the docs complete?*|Ever try writing code for a framework with bad documentation? Nigh impossible. Undocumented features might as well not exist.|Currently qualitiative score from one to three<sup>2</sup>.|

### Results
Below are the Support & Community scores, as well as a break down of each criteria by framework.

{:.center}
![Support & Community Overall Score]({{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/annotated-snc3-white.svg.png)

{:.center}
![Criteria Score Breakdown for Support & Community Category]({{ site.baseurl }}/images/2018-06-26-deep-learning-showdown/snc_criteria_annotated-white.svg)

{:.caption}
Breakdown of each criteria in this category by framework. 

Older frameworks like Torch, Caffe, and Theano are buoyed by their ecosystem, but are still rivaled in that criteria by 1 year old PyTorch and 3 year old TensorFlow.


<!-- TODO: a brief write-up of overall results -->

## Round Two: API

## Footnotes
{:#foot0}
0. There are a number of experimental backends like MXNet and DL4J also in the pipeline. Writing backends for Keras is actually not a horrible experience, which is pretty cool. [&#x2B8C;](#foot0_origin)

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
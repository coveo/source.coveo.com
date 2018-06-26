---
layout: post

title: "Deep Learning Showdown"
#subtitle: ""

author:
  name: Joseph Szymborski
  bio: Machine Learning Developer @ Coveo R&D, and maker of funky graphs
  twitter: jszym
  image: jszym.jpg
---

If you're one of the many passangers on the deep learning hype-train (welcome aboard), you've at some point almost certainly experienced the great confusion of having to choose a deep learning framework.

If you're trying to choose a framework, or maybe re-evaluating your choices, I might be able to help! 

I've done a lot of the leg work for you, having made a pretty comprehensive report on the state of DL frameworks that compares their strengths and weaknesses.

<!-- more -->

I compared these frameworks based on three categories that we value most (Support & Community, Internals, and Platform), and used (as much as possible) quantitative measures to compare each one.

Without further ado, let's meet the frameworks.

## The Belidgerents 

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

## Final Results
I'm going to cut straight to the chase and show you what the final scores are for each framework. 
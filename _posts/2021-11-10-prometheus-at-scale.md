---

layout: post

title: "Prometheus at scale"

tags: [Prometheus, Thanos, high-availability, scaling, Coveo, Kubernetes]

author:
  name: Samuel Bégin
  bio: Cloud infrastructure team
  image: 2021-11-11-prometheus-at-scale/samuelbegin.jpg

---

As the company continually grow year after year, by bringing in new clients, deploying in new regions, integrating new technologies, so must our infrastructure on which it sits. This explosion in data and event volumes demands companies to find scalable solution to match their ambitions. I'ts a bit more complicated than simply throwing buzzwords like incantations, so I'll help you dive a bit into this world.

<!-- more -->

![asd]({{ site.baseurl }}/images/2021-11-11-prometheus-at-scale/dilbert-kubernetes.jpeg)

Most companies working with cloud-native, distributed and scalable technologies will aim at scaling on demand, or rather _scale with your wallet_, so that for example no human actions are required in preparation for black friday. But unfortunately, it's not as easy as it sounds. Whether you're moving from three to ten virtual machines, from a dozen micro-services to a hundred, or you're preparing your ~100 nodes kubernetes cluster to hit 300 in the next year, scaling up will inevitably lead to unforeseen problems. One of them is ensuring monitoring and alerting stays reliable for an ever-increasing number of virtual machines, micro-services and other components.

## Prometheus

This time-series database has been one of the most popular monitoring software solutions for the last decade. It's a [Cloud Native Computing Foundation](https://www.cncf.io/) project, available on [Github](https://github.com/prometheus/prometheus), and its role is to gather information regularly about all the monitoring targets you configure, evaluate rules that can trigger alerts, and also expose all of its information under a query language (PromQL). The most basic use case for Prometheus could be to gather uptime information about a Server, and have it post an alert in Slack when it's down. You can also build dashboards on a visualization tool such as [Grafana](https://grafana.com/), that makes all sorts of queries on all your running applications.

![prometheus-single]({{ site.baseurl }}/images/2021-11-11-prometheus-at-scale/prometheus-single.png)

In this article I'll refer to our multiple _monitoring targets_ as **exporters**, since its the [piece of software](https://prometheus.io/docs/instrumenting/exporters/) that knows how to present information to Prometheus. Our targets can be virtual machines, clusters, applications, cloud services, etc. Prometheus will periodically fetch information from all exporters to build his time series. And then we use our visualization platform **Grafana**, that asks prometheus directly for information.

Pinch your nose as we dive deeper into the various ways in which Prometheus can made reliable and scalable.

## High availability

At first, a single prometheus instance will be enough for millions of time series, though it can be fragile as there is no redundancy. This of course will not do, since monitoring and alerting are required to know as soon as a client facing application is having trouble fulfilling its destiny.

Two solutions are available to us. And we choose to have both in place.

The first and obvious one is to have an external component that will alert us if prometheus is down. This will drastically reduce the risk of blackout as both systems would have to be down at the same time. So the more different this component is, the safer we are from simultaneous outages.

The second solution is to have multiple prometheus instances with the same configuration (we'll call them **replicas**), and later filter out duplicate metrics. Since prometheus is essentially a database, we can't easily host more identical instances like any stateless container. There are a few solutions that enables prometheus to be highly available: [Prometheus federation](https://prometheus.io/docs/prometheus/latest/federation/), [Promxy](https://github.com/jacksontj/promxy), [Thanos](https://github.com/thanos-io/thanos), [Cortex](https://github.com/cortexproject/cortex), etc. We chose to work with Thanos for various reasons, such as centralized querying, longer retention period, and of course, high availability. Also, we currently have two replicas, and you could have more, but that is a balance of cost/reliability that you have to find for your specific use-case.

![prometheus-replicas]({{ site.baseurl }}/images/2021-11-11-prometheus-at-scale/prometheus-replicas.png)

```shell
> kubectl get pods -n monitoring
NAME               READY   STATUS
prometheus-0       3/3     Running
prometheus-1       3/3     Running
```

In Kubernetes, we can greatly reduce the chances that the two instances are down at the same time using these features:

- `anti-affinity` and `pod-topology-constraints`, so that our prometheus replicas are not hosted on the same physical machine, and even in the same data-center.
- `pod-disruption-budget` to tell kubernetes to never intentionally shutdown both replicas at the same time.

Furthermore, we now need an intermediary for **Grafana** to get its information. The Thanos Querier component takes care of serving the two prometheus instances under a single endpoint, and also deduplicates the data both prometheus would have in common. The Querier also implements the PromQL language to mimic prometheus behavior.

The alerts can still be evaluated by both prometheus at the same time, as they will be deduplicated by alertmanager down the line.

## Vertical Scaling

As our clusters continue growing in size, there is more and more data being gathered by prometheus, and more unique ways to categorize it. We are wondering how to manage the ever-increasing memory consumption of prometheus. As of now, we have implemented dedicated nodes with high memory, but it will only get us so far. Our biggest prom instance uses ~70gb (and can peek at ~100gb on boot) on a cluster of ~100 nodes. Another issue, is that it can take a while for prometheus to start.

The single most important factor in memory consumption is the cardinality of time series. This represents the sum of unique characteristics a metric can have. To keep track of the high cardinality metrics and labels, go to the prometheus interface, under `/status`. There is a handy overview of the highest cardinality metrics, and a bit more...

```shell
Name                                        Count
apiserver_request_duration_seconds_bucket   38836
container_tasks_state                       16790
container_memory_failures_total             13432
```

You can read more on how we optimize our memory consumption in [this blog post]({{ site.baseurl }}/2021/03/03/prometheus-memory/).

Sadly, vertical scaling is not good enough, because it requires manual interventions, dedicated virtual machines, and the boot time is just gonna get worse. We must find another way to scale.

## Horizontal Scaling

If we can't have bigger instances, let's have more of them!

To scale horizontally, we must split the scrape targets in groups. It's called **sharding** the scrape metrics. This will split prometheus into multiple smaller instances, which we can host on different nodes, thus easily scaling by increasing the amount of nodes in the cluster when required.

We can do that logically, by dividing the targets by services, such as rabbitmq, elasticsearch, kubernetes, etc. Or we could have one prometheus shard per kubernetes namespace. But I think the best approach is to use a pseudo-random division of all our scrape targets, so that it can be managed as one big prometheus stack and also scaled on demand, without human interactions.

To accomplish that, an entity controlling all prometheus shards will be in charge of splitting the configuration, using a modulo of the desired amount of shards on a hash of our scrape targets. This entity can be the [prometheus operator](https://github.com/prometheus-operator/prometheus-operator), living alongside our prometheus and alertmanager pods.

![prometheus-shards]({{ site.baseurl }}/images/2021-11-11-prometheus-at-scale/prometheus-shards.png)

```shell
> kubectl get pods -n monitoring
NAME                  READY   STATUS
prometheus-shard-0    3/3     Running
prometheus-shard-1    3/3     Running
```

As with our highly available replicas, we need to have a centralized query endpoint. In our case, using Thanos Querier, we can ask questions on all prometheus instances at once.

With sharding in place, prometheus rules won't work anymore, because half the metrics will be on _shard A_, and the other half over _shard B_. So you have to evaluate all the rules and alerts on a component that will have all of your metrics combined. In our case this is the [Thanos Ruler](https://thanos.io/tip/components/rule.md/), which feeds off the Thanos Querier.

And there we have a solid solution for scaling on demand. We can further divide the pool of monitoring targets into more prometheus shards, splitting the resource demand on multiple instances.

## Putting it all together

In order to have both high availability and scaling potential, the setup must look like the following schema. Both shards now have each their own replica pairs, and the Thanos Querier makes sense of all that using a bit of configuration.

![prometheus-final]({{ site.baseurl }}/images/2021-11-11-prometheus-at-scale/prometheus-final.png)

```shell
> kubectl get pods -n monitoring
NAME                    READY   STATUS
prometheus-0-shard-0    3/3     Running
prometheus-0-shard-1    3/3     Running
prometheus-1-shard-0    3/3     Running
prometheus-1-shard-1    3/3     Running
```

With that tested and deployed, we can now scale horizontally at will, adding more shards as we go.

## Querying multiple clusters

In our setup, this monitoring software stack is in place in each kubernetes cluster, which we have a dozen of. This results in a lot of places to look at when you want to visualize the same metric over multiple clusters.

Now I hear you ask, _but is there a place I can see all of that at the same time?_

Well yes! To do that, we have a special cluster in a dedicated environment (lets call it observability) which will be able to talk to all other clusters. Since the Thanos Query component can also use other Queriers as data sources, we can use them to bridge our different clusters in order for Grafana to have a unified view of everything!

![prometheus-multi-cluster]({{ site.baseurl }}/images/2021-11-11-prometheus-at-scale/prometheus-multi-cluster.png)

# Whats next?

We could include the prometheus adapter in our architecture to help distribute the discovery and scraping load on dedicated components, but it's still a work in progress on prometheus's side. I will follow the development of this feature.

But as far as we go, using the architecture described in this post, Prometheus will now scale with our ambition and our wallet!

Onto the next component!

*Do you like working on this type of challenge? Check out our [careers](https://www.coveo.com/en/company/careers) page.*

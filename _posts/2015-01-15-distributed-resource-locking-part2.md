---
layout: post

title: "Distributed resource locking using memcached - part 2"
tags: [Java]

author:
  name: Jonathan Rochette
  bio: Analytics API Jedi Master
  twitter: JoRochette
  image: jrochette.jpg
---


Following some strong reactions about my last post (that were caused, I believe, by a poor use of the word lock on my part), I decided to write a little follow up post to remedy the situation. I will explain why what we wanted was to avoid duplicate work, not prevent it at all cost[^footnote].

<!-- more -->

  [^footnote]: Special thanks to M. Sean Cribbs for [this way of saying it](http://source.coveo.com/2014/12/29/distributed-resource-locking/#comment-1787329448)

Let's start by taking a look at the definition of a lock. [Wikipedia](http://en.wikipedia.org/wiki/Lock_(computer_science)) says : 

> In computer science, a lock is a synchronization mechanism for enforcing limits on access to a resource in an environment where there are many threads of execution. A lock is designed to enforce a mutual exclusion concurrency control policy.

Locking resources using memcached respects the first part of that definition. It does enforce limits regarding access to a resource. The issue is that it does not respect the second part of the definition (which is kind of the important part of the definition). Mutual exclusion cannot be achieved using memcached because the information about the lock is not persistent, there could be synchronization problems when memcached in running on a cluster composed of multiple instances, lock state could be lost in case of network partition problems, etc. What would happen if, for instance, the Memcached server crashed or an entity held the lock for a long time and the cache entry expired? It would be as if the resource was never locked and concurrent operations on a critical section could (and, according to [Murphy's law](http://en.wikipedia.org/wiki/Murphy%27s_law), would)  happen. That kind of locking is called [*ghetto locking*](https://code.google.com/p/memcached/wiki/NewProgrammingTricks#Ghetto_central_locking) by the fine people of Memcached. We could call it probabilistic locking or resource access control.

This brings me to the second confusing point of my previous post : the use case I described was, well, not so well described. I will try to explain it better here. We use Amazon Redshift for our analytics application in which a lot of data that is rarely updated (some flag values are updated according to what was added after) is inserted. This data is exposed via an API and is then used to generate very customizable reports to help our customers improve their search experience. We encountered a problem called transaction cycles. These are caused by concurrent transactions touching multiple tables in a database. For example, a scheduled task updating table A based on data contained in table B, a process inserting events in the table B and an api query joining tables A and B. The transaction cycle would cause the queries to fail, which is quite problematic. Because of our fault tolerance mechanisms, the operations would eventually succeed : the scheduled task would be rescheduled later and the insertion would be retried immediately after a failure is detected. Redshift already does an amazing job managing concurrent write operations on his cluster, but if the timing was perfect, these transaction cycles could still happen. That is why we needed some external mechanisms to avoid falling into these annoying traps.

We decided to go with *ghetto locking* because it met the needs I described in my original post (distributed, transparent to read operations, no deadlocks and short-lived locks). Also, we did not want to add another building block to our stack (which would have been required if we wanted persistent lock in a database, or using distributed synchronization  systems such as Zookeeper) as it necessarily introduces more risks. The *persistent lock in a database* would require an additional component to the application because database we use has strong limitations when it comes to locks. As a matter of fact, the only lock supported is an [access exclusive lock](http://docs.aws.amazon.com/redshift/latest/dg/r_LOCK.html) on a table. Also, from what we experienced with Redshift, numerous small queries on the database (which would have been required to check the locks states) had a negative impact on the overall performance of the cluster, making using a table to persist locks information undesirable.

As I said in introduction, what we truly wanted to achieve was to *avoid duplicate work, not prevent it at all cost*. With this solution, we achieved exactly that. We moved from 2 or 3 transaction cycles per week to no transaction cycle since it reached the production environment. 

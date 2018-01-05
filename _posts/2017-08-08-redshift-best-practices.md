---
layout: post

title: "AWS Redshift best practices, tips and tricks"
tags: [AWS, Redshift]

author:
  name: Jonathan Rochette
  bio: Usage Analytics Team Lead
  twitter: JoRochette
  image: jrochette.jpg
---

Over the last 4 years, I have been part of the team that builds the Usage Analytics solution here at Coveo. This solution is based on AWS Redshift, a petabyte scale columnar store. We were early adopters of this data warehousing solution and while it is an awesome product today, I probably don't need to tell you that we hit some bumps along the way. Here are some of the tips, tricks, and overall best practices we gathered during those years.

<!-- more -->

## Sort keys

This one is pretty simple: every table in a cluster should have a sort key. Basically, a sort key determines which column(s) will be used to order the rows. The Redshift query engine will use it to optimize the queries. It will skip entire data blocks by only looking at the min and max value of the sort key for this block. It is very important to choose the good sort key. There are a lot of [good guides](https://www.blendo.co/amazon-redshift-guide-data-analyst/data-modeling-table-design/understanding-selecting-sort-keys/) and [documentation](http://docs.aws.amazon.com/redshift/latest/dg/c_best-practices-sort-key.html) on this subject, so be sure to check them out!

## Sort keys... always and forever

I can't stress enough how important sort keys are, so I decided to talk about them again. Make sure to always (or as often as possible) use the column(s) of the sort key in the `WHERE` clauses of a query (and that means even in the sub and sub sub queries), otherwise your cluster will waste a lot of resources scanning unnecessary data. Also, if you decided to use a compound sort key, keep in mind that queries that are not filtering on the first column specified in the sort key will not use the other columns, even if they are included in the `WHERE` clause of the query.

## Sort k ... ok, I'm kidding -> dist keys

Dist keys will determine how the data of a table is distributed, or split, accross the nodes of the cluster. There are a couple of things to keep in mind when choosing a dist key:
- It should result in an even distribution, so something like a UUID is a good choice
- If some tables are often joined together, they should have the same dist key. 
  - This means that the data for both tables will be on the same node, and queries on this data will not be transferred between nodes. It will save you a ton of network time.
- Watch out for those `DISTSTYLE ALL` (this one is not about dist key, but it's close enough). 
  - The `ALL` distribution style will greatly increase the space required, load time, and maintenance work for the same data.

## Use data compression

When creating your schema, don't forget to include a compression type for your columns. It will reduce the space occupied by the data which will ultimately improve query performance (it reduces the required disk I/O and amount of data sent on the network). Redshift even offers a [function](http://docs.aws.amazon.com/redshift/latest/dg/r_ANALYZE_COMPRESSION.html) that will analyze your data and recommend the best compression to use.

> Do not use compression on the sort keys. It will have the reverse effect and worsen the performance of the query (the query engine can't use the full potential of the sort keys if they are compressed)

I feel like I've said enough for now. Keep those tips and best practices in mind when designing a schema in AWS Redshift and you will be about to achieve awesome stuff! Also, keep your eyes open for part 2!




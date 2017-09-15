---
layout: post

title: "AWS Redshift best practices, tips and tricks - part 2"
tags: [AWS, Redshift]

author:
  name: Jonathan Rochette
  bio: Usage Analytics Team Lead
  twitter: JoRochette
  image: jrochette.jpg
---

In my [last post](http://source.coveo.com/2017/08/08/redshift-best-practices/), I shared some of the wisdom I gathered over the 4 years I've worked with AWS Redshift. Since I'm not one for long blog posts, I decided to keep some for a second post. Here goes!

<!-- more -->

## Keep your custer clean - Vacuum and Analyze

I talked a lot in my last post about the importance of the sort keys and the data being sorted properly in Redshift. One way to do that is to run `VACUUM` and `ANALYZE` commands. The `VACUUM` will clean up the data, i.e. remove deleted rows to reclaim space and sort the newly inserted data and the `ANALYZE` will update metadata used by the query planner. Keep those things in mind when running those operations:
- `VACUUM`s are heavy on both CPU and disk space, so it's better to run it during a period of low usage.
- Depending on your use case, you may not need to run those operations often.
  - From what we experienced, once a week is enough and once a day is optimal. More often then that had negative performance impacts.
- Always run an `ANALYZE` after a `VACUUM`.
- Be aware of the thresholds. By default, `VACUUM` will not sort if 95% of the rows in a table are already sorted and `ANALYZE` will be skipped for any table with less than 10% of changed rows.
  - This means that, at some point when you have a lot of data, cleanup operations might stop running as often as configured. Keep that in mind!
- `VACUUM`s will be a lot faster if your data is inserted in sort key order.
Check the documentation about [vacuuming tables](http://docs.aws.amazon.com/redshift/latest/dg/t_Reclaiming_storage_space202.html) and [analyzing tables](http://docs.aws.amazon.com/redshift/latest/dg/t_Analyzing_tables.html) (it was greatly improved over the years and is now pretty neat).

## Keep spots to run important queries - WLM queues setup

Workload Management (WLM) queue configuration is very important for query performance. It allows you to assign more memory for critical queries, how many queries can run concurrently, set a higher timeout for longer queries, etc. Be sure to adapt the WLM queues configuration to fit your use case. In our case, we try to minimize the response time of reporting queries. Data insertion and long running _maintenance_ queries are less important. 
Here is what our configuration looks like:
- Reporting queue with a 2 minutes timeout, concurrency of 15 and 90% of the cluster's memory.
- Maintenance queue with a 1 hour timeout, concurrency of 3 and 5% of the cluster's memory.
- Insertion queue with a 15 minutes timeout, concurrency of 3 and 5% of the cluster's memory.
> Keep in mind that the total concurrency of the cluster cannot be greater than 25.

## Keep enough space to run queries - Disk space

In Redshift, when scanning a lot of data or when running in a WLM queue with a small amount of memory, some queries might need to use the disk. Be sure to keep enough space on disk so those queries can complete successfully. For us, the sweet spot was under 75% of disk used.

## Keep your data clean - No updates if possible

`UPDATE` statements are really not the strong suit of Redshift. They take a lot of CPU to process, unsort the afftected rows and, are usually pretty long to complete. For those reasons, the best thing is to do as little `UPDATE` as possible. A good way to do that is to insert data in a staging table, where it can be modified, before being moved to the _master_ table.

## Keep your writes batched - Use COPY (batches) instead of inserts

This one is a pretty common best practice when dealing with large amounts of data. Try to insert new data in batches (large ones if possible) and use the `COPY` statement to do it. From Redshift's documention:
> We strongly encourage you to use the COPY command to load large amounts of data. Using individual INSERT statements to populate a table might be prohibitively slow.

That's pretty much all I got. I hope this can help you get the best of the awesome product that AWS Redshift is. My last advice, read the [documentation](http://docs.aws.amazon.com/redshift/latest/dg/c_redshift_system_overview.html), it is pretty good. 

P.S.: Don't just blindly apply those tips and tricks. Test them first to validate that they really do help with your use case.

---
layout: post

title: "Distributed resource locking using memcached"
tags: [Java]

author:
  name: Jonathan Rochette
  bio: Analytics API Jedi Master
  twitter: JoRochette
  image: jrochette.jpg
---


As Coveo's cloud usage analytics product matures, more and more events are logged every seconds and a lot more people are using the analytics dashboards from the cloud admin. That increased load is great and the usage analytics handles it easily, but there was one thing we did not see coming: transaction cycles in the database. They did not happen often, but this was still problematic as continuous increase in the load on the service only meant more transaction cycles. These cycles were the result of scheduled jobs running when insertion of new events and reporting queries occurred at the same time. 

<!-- more -->

Amazon Redshift is already doing a pretty good job at [handling concurrent operations on the cluster](http://docs.aws.amazon.com/redshift/latest/dg/c_Concurrent_writes.html) but we needed a little more, so we decided to go with resource locking (where the resources are the different tables in the database). There are a lot of ways to implement such a solution, but we also had some constraints :

- Our service is running on multiple instances, so we needed a distributed locking mechanism.
- The resource locking had to be transparent to read operations (ie. no impact on reporting queries).
- Deadlocks were not acceptable.
- Locks had to have a short lifespan. We did not want to lock insertions and updates for an extended period of time.


With these in mind, we quickly discarded some solutions like the [LOCK](http://docs.aws.amazon.com/redshift/latest/dg/r_LOCK.html) feature offered by Amazon Redshift because it impacted all queries, from the simple `select 1;` to the complicated triple `full outer join` of doom, without forgetting any inserts or updates.

After consideration, we were left with two possible solutions :

- Sharing locks using a cache service (in our case, a Memcached cluster provided by Amazon Elasticache)
- Sharing locks using a table in the database

We finally decided to go with the cache service, mainly because of the timeout capabilities that would allow us to easily circumvent the deadlock issue, better performance and it was much simpler to implement than the database option.

Here is what it looks like :

{% highlight java linenos %}
public class MemcachedResourceLocker implements ResourceLocker
{
    private CacheService resourceLockCache;
    private String[] resourceId;
    private String lockerId;
    private Duration lockDuration;

    public MemcachedResourceLocker(CacheService resourceLockCache,
                                   String[] resourceId,
                                   Duration lockDuration)
    {
        this.resourceLockCache = resourceLockCache;
        this.resourceId = resourceId;
        this.lockDuration = lockDuration;
        try {
            this.lockerId = InetAddress.getLocalHost().getHostName() + "-" + Thread.currentThread().getName() + "-"
                    + DateTime.now().toString();
        } catch (UnknownHostException e) {
            this.lockerId = "unknown_service_host" + "-" + Thread.currentThread().getName() + "-"
                    + DateTime.now().toString();
        }
    }

    @Override
    public void lock() throws CouldNotAcquireLockException
    {
        if (!resourceLockCache.add(RESOURCE_LOCK_CACHE_PREFIX, resourceId, lockerId, lockDuration.toStandardSeconds()
                                                                                                 .getSeconds())) {
            logger.debug("Could not acquire lock on resource '{}'. Someone else has it.", Arrays.toString(resourceId));
            throw new CouldNotAcquireLockException(Arrays.toString(resourceId));
        }
    }

    @Override
    public void unlock()
    {
        String currentLockerId = resourceLockCache.get(RESOURCE_LOCK_CACHE_PREFIX, resourceId, String.class);
        if (currentLockerId != null && currentLockerId.equals(lockerId)) {
            resourceLockCache.delete(RESOURCE_LOCK_CACHE_PREFIX, resourceId);
        }
    }
}
{% endhighlight %}

{% highlight java linenos %}
public class RetryableLockResource extends AbstractRetryableTask
{
    private ResourceLocker resourceLocker;

    public RetryableLockResource(Duration delay,
                                 int maxRetry,
                                 ResourceLocker resourceLocker)
    {
        super(delay, maxRetry);
        this.resourceLocker = resourceLocker;
    }

    @Override
    protected void call() throws RetryableTaskException
    {
        try {
            resourceLocker.lock();
        } catch (CouldNotAcquireLockException e) {
            throw new RetryableTaskException(e);
        }
    }

    public static void tryLock(ResourceLocker resourceLocker) throws RetryableTaskFailedException
    {
        new RetryableLockResource(resourceLocker).execute();
    }
}
{% endhighlight %}

{% highlight java linenos %}
public abstract class AbstractRetryableTask
{
    private Duration delay;
    private int maxRetry;

    public AbstractRetryableTask(Duration delay,
                                 int maxRetry)
    {
        this.delay = delay;
        this.maxRetry = maxRetry;
    }

    protected abstract void call() throws RetryableTaskException;

    protected boolean handle(RetryableTaskException e)
    {
        return false;
    }

    public void execute() throws RetryableTaskFailedException
    {
        boolean exit = false;

        for (int iteration = 1; !exit; iteration++) {
            try {
                call();
                exit = true;
            } catch (RetryableTaskException e) {
                if (iteration >= maxRetry) {
                    throw new RetryableTaskFailedException(e);
                } else {
                    exit = handle(e);
                    if (!exit) {
                        ThreadUtils.sleepNoThrow(delay);
                    }
                }
            }
        }
    }
}
{% endhighlight %}

Here is an example of how we use it in an actual "real code" situation in a scheduled job (scheduling is done with [Quartz](http://quartz-scheduler.org/):

{% highlight java linenos %}
public void execute(JobExecutionContext context) throws JobExecutionException
{
    String account = context.getJobDetail().getJobDataMap().getString(SchedulerWrapper.ACCOUNT_NAME_PARAM);
    ResourceLocker allEventsLocker = null;
    try {
        allEventsLocker = resourceLockerFactory.createLockerForAllEvents(account);
        RetryableLockResource.tryLock(allEventsLocker);

        dal.updateAllEvents(account);
    } catch (RuntimeException | RetryableTaskFailedException | FailedToRetrieveDimensionException e) {
        throw new JobExecutionException(e);
    } finally {
        RetryableUnlockResource.tryUnlock(allEventsLocker);
    }
}
{% endhighlight %}

This solution works great. Since we implemented our distributed resource locking using Memcached, we increased the number of scheduled jobs and the load on the service has more than doubled, but we have not seen any transaction cycle or performance degradation, which is nice.

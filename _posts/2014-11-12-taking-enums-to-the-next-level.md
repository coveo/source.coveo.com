---
layout: post

title: "Taking Enums to the next level with Java 8"
published: false

author:
  name: Jonathan Rochette
  bio: Analytics API Jedi Master
  twitter: JoRochette
  image: jrochette.jpg
---

Taking Enums to the next level with Java8
===================


In our awesome cloud Usage Analytics API, there is a call that returns the analytics data in data points format (these are meant to be used to build a graph). Recently, we added a feature allowing the user to chose the time period (initially, only *days* was available). Problem is, the code was strongly coupled with the *day* period...

<!-- more -->

![image](/images/graphexemple.png)

For exemple, take this snippet :
{% highlight java linenos %}
private static List<DataPoint> createListWithZerosForTimeInterval(DateTime from,
                                                                  DateTime to,
                                                                  ImmutableSet<Metric<? extends Number>> metrics)
    {

        List<DataPoint> points = new ArrayList<>();
        for (int i = 0; i <= Days.daysBetween(from, to).getDays(); i++) {
            points.add(new DataPoint().withDatas(createDatasWithZeroValues(metrics))
                                      .withDayOfYear(from.withZone(DateTimeZone.UTC).plusDays(i).withTimeAtStartOfDay()));
        }
        return points;
    }
{% endhighlight %}

**Note:** Days, as well as Minutes, Hours, Weeks and Months in the snippet a little further bellow, come from the [Joda-Time Java date and time API](http://www.joda.org/joda-time/).

Even if the name of the method does not reflect it, it is very strongly binded to the concept of *days*.

As I was looking for a way to use different time periods (*months*, *weeks*, *hours* for exemple), I saw the oh so nasty **switch/case** staement slowy sneaking its way into the code .  

----------
You have to understand that the notion **switch/case = evil** was drilled into my mind when I was attending college and in two internships I made, so I tend to try to avoid those at any cost, mainly because they often violate the [*open-closed principle*](http://en.wikipedia.org/wiki/Open/closed_principle). I strongly believe that this principle is one of the most important best practices for writing object-oriented code. And I am no the only one. Robert C. Martin once said :
>In many ways [the open-closed principle] is at the heart of object oriented design. Conformance to this principle is what yeilds the greatest benefits claimed for object oriented technology; i.e. reusability and maintainability.[^footnote]

  [^footnote]: [http://www.objectmentor.com/resources/articles/ocp.pdf](http://www.objectmentor.com/resources/articles/ocp.pdf)

------------
I told myself : "We just started using Java8. Maybe I can find a way to use some awesome new feature to avoid that switch/case death trap." Using the new [*functions*](http://docs.oracle.com/javase/8/docs/api/java/util/function/package-summary.html) in Java8 (well not so new, but you know what I mean), I decided to add a little meat to an *enum* that would represent the different time periods available.

{% highlight java linenos %}
public enum TimePeriod
{
    MINUTE(Dimension.MINUTE, (from,
                              to) -> Minutes.minutesBetween(from, to).getMinutes() + 1, Minutes::minutes, from -> from.withZone(DateTimeZone.UTC)
                                                                                                                      .withSecondOfMinute(0)
                                                                                                                      .withMillisOfSecond(0)),
    HOUR(Dimension.HOUR, (from,
                          to) -> Hours.hoursBetween(from, to).getHours() + 1, Hours::hours, from -> from.withZone(DateTimeZone.UTC)
                                                                                                        .withMinuteOfHour(0)
                                                                                                        .withSecondOfMinute(0)
                                                                                                        .withMillisOfSecond(0)),
    DAY(Dimension.DAY, (from,
                        to) -> Days.daysBetween(from, to).getDays() + 1, Days::days, from -> from.withZone(DateTimeZone.UTC)
                                                                                                 .withTimeAtStartOfDay()),
    WEEK(Dimension.WEEK, (from,
                          to) -> Weeks.weeksBetween(from, to).getWeeks() + 1, Weeks::weeks, from -> from.withZone(DateTimeZone.UTC)
                                                                                                        .withDayOfWeek(1)
                                                                                                        .withTimeAtStartOfDay()),
    MONTH(Dimension.MONTH, (from,
                            to) -> Months.monthsBetween(from, to).getMonths() + 1, Months::months, from -> from.withZone(DateTimeZone.UTC)
                                                                                                               .withDayOfMonth(1)
                                                                                                               .withTimeAtStartOfDay());

    private Dimension<Timestamp> dimension;
    private BiFunction<DateTime, DateTime, Integer> getNumberOfPoints;
    private Function<Integer, ReadablePeriod> getPeriodFromNbOfInterval;
    private Function<DateTime, DateTime> getStartOfInterval;

    private TimePeriod(Dimension<Timestamp> dimension,
                       BiFunction<DateTime, DateTime, Integer> getNumberOfPoints,
                       Function<Integer, ReadablePeriod> getPeriodFromNbOfInterval,
                       Function<DateTime, DateTime> getStartOfInterval)
    {
        this.dimension = dimension;
        this.getNumberOfPoints = getNumberOfPoints;
        this.getPeriodFromNbOfInterval = getPeriodFromNbOfInterval;
        this.getStartOfInterval = getStartOfInterval;
    }

    public Dimension<Timestamp> getDimension()
    {
        return dimension;
    }

    public int getNumberOfPoints(DateTime from,
                                 DateTime to)
    {
        return getNumberOfPoints.apply(from, to);
    }

    public ReadablePeriod getPeriodFromNbOfInterval(int nbOfInterval)
    {
        return getPeriodFromNbOfInterval.apply(nbOfInterval);
    }

    public DateTime getStartOfInterval(DateTime from)
    {
        return getStartOfInterval.apply(from);
    }
}

{% endhighlight %}

Using this enum, I was able to easily change the code to allow the user to specify the time periods for the graph data points. 

This :
{% highlight java linenos %}
for (int i = 0; i <= Days.daysBetween(from, to).getDays(); i++)
{% endhighlight %}
became this (note that the timePeriod was passed to the method after being specified in a query param by the user) :
{% highlight java linenos %}
for (int i = 0; i < timePeriod.getNumberOfPoints(from, to); i++)
{% endhighlight %}

The code behind the getGraphDataPoints call of the Usagae Analytics service is now completly independant and unaware of the time period. And as a bonus, it does respect hat *open/closed principle* I was talking about earlier.

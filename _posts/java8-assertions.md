---
layout: post

title: "Using Java 8 with Mockito"

author:
  name: Guillaume Simard
  bio: Team Lead, UA
  twitter: guisim
  image: guisim.jpg
---

Java 8 is pretty cool. We (finally!) got Lambda Expressions in Java and a lot of other goodies. At Coveo, we started working with Java 8 as soon as the first stable release was available. As mentionned in [my previous blog post]([Some Link]({% post_url 2014-09-23-better-assertions %})), one way we're using Java 8 is in our unit tests.

<!-- more -->

Let's say we want to test that adding an `Employee` to a `Company` correctly invokes the `CompanyDal` class with the right information.

{% highlight java linenos %}
public interface CompanyDal
{
    void registerEmployee(Employee e);
}
{% endhighlight %}

{% highlight java linenos %}
public class Company
{
    private CompanyDal dal;

    public Company(CompanyDal dal)
    {
        this.dal = dal;
    }

    public void addEmployee(Employee employee)
    {
        // Let's say there's a deep copy here
        Employee copiedEmployee = new Employee(employee.getName());
        dal.registerEmployee(copiedEmployee);
    }
}
{% endhighlight %}

{% highlight java linenos %}
public class Employee
{
    private String name;

    public Employee(String name)
    {
        this.name = name;
    }

    public String getName()
    {
        return this.name;
    }
}
{% endhighlight %}

When testing the `Company` class we'll want to mock our `CompanyDal` interface. We use the great [Mockito](https://github.com/mockito/mockito) library for our mocking needs.

{% highlight java linenos %}
public class CompanyTest {
    private Company company;
    private CompanyDal mockedDal;

    @Before
    public void setup()
    {
        mockedDal = mock(CompanyDal.class);
        company = new Company(mockedDal);
    }

@Test
public void addingAnEmployeeRegistersItInTheDal()
{
    Employee employee = new Employee("John");
    company.addEmployee(employee);

    // TODO: Verify that the employee was register with the DAL.
}
{% endhighlight %}

This is a good test as it validates that the `Company` class interacts with the `CompanyDal` class as expected.
Now.. how can we do this verification?

We could be tempted to do 

{% highlight java linenos %}
@Test
public void addingAnEmployeeRegistersItInTheDal()
{
    Employee employee = new Employee("John");
    company.addEmployee(employee);

    verify(mockedDal).registerEmployee(employee);
}
{% endhighlight %}

But that won't work as the two `Employee` instances are not the same. This is caused by the deep copy that takes place in the `Company` class.

_Note: For the sake of this example, let's pretend that we can't override `Employee`'s `equals()` method to use value equality instead of reference equality._

So what we need to do is verify if the `Employee` passed to the `CompanyDal` has the same `name` property as the one passed to the `Company` class.
This can be done using Mockito [Matchers](http://docs.mockito.googlecode.com/hg/latest/org/mockito/Matchers.html).

{% highlight java linenos %}
@Test
public void addingAnEmployeeRegistersItInTheDal()
{
    Employee employee = new Employee("John");
    company.addEmployee(employee);

    verify(mockedDal).registerEmployee(argThat(new ArgumentMatcher<Employee>()
    {
        @Override public boolean matches(Object item)
        {
            return ((Employee)item).getName().equals(employee.getName());
        }

        @Override public void describeTo(Description description)
        {
            description.appendText("Employees must have the same name");
        }
    }));
}
{% endhighlight %}

This will produce the following message in case of test failure

    Argument(s) are different! Wanted:
    companyDal.registerEmployee(
        Employees must have the same name
    );
    -> at com.coveo.CompanyTest.canFindEmployee(CompanyTest.java:71)
    Actual invocation has different arguments:
    companyDal.registerEmployee(
        com.coveo.Employee@7f560810
    );
    -> at com.coveo.Company.addEmployee(CompanyTest.java:46)

This is good! But this test suddenly inflated from 4 lines to 15 lines!
The `matches()` method could easily be replaced by a [`java.util.Predicate`](http://docs.oracle.com/javase/8/docs/api/java/util/function/Predicate.html)!

But we'll need an adapter class to bridge Mockito's `Matcher` with `Predicate`. Introducing `LambdaMatcher`!

{% highlight java linenos %}
import java.util.Optional;
import java.util.function.Predicate;

import org.hamcrest.BaseMatcher;
import org.hamcrest.Description;

public class LambdaMatcher<T> extends BaseMatcher<T>
{
    private final Predicate<T> matcher;
    private final Optional<String> description;

    public LambdaMatcher(Predicate<T> matcher)
    {
        this(matcher, null);
    }

    public LambdaMatcher(Predicate<T> matcher, String description)
    {
        this.matcher = matcher;
        this.description = Optional.ofNullable(description);
    }

    @SuppressWarnings("unchecked")
    @Override
    public boolean matches(Object argument)
    {
        return matcher.test((T) argument);
    }

    @Override
    public void describeTo(Description description)
    {
        this.description.ifPresent(description::appendText);
    }
}
{% endhighlight %}

`LambdaMatcher` is really easy to use. Here's our rewritten `addingAnEmployeeRegistersItInTheDal` test.

{% highlight java linenos %}
@Test
public void canFindEmployee()
{
    Employee employee = new Employee("John");
    company.addEmployee(employee);

    verify(mockedDal).registerEmployee(argThat(new LambdaMatcher<>(e -> e.getName()
                                                                         .equals(employee.getName()))));
}
{% endhighlight %}

And if you want a description

{% highlight java linenos %}
@Test
public void canFindEmployee()
{
    Employee employee = new Employee("John");
    company.addEmployee(employee);

    verify(mockedDal).registerEmployee(argThat(new LambdaMatcher<>(e -> e.getName()
                                                                         .equals(employee.getName()),
                                                                   "Employees must have the same name")));
}
{% endhighlight %}

This new code will generate the same nice error message as above.. but it is much simpler! If you want to save even more time, you can create the following static method.

{% highlight java linenos %}
public static <T> T argThatMatches(Predicate<T> predicate)
{
    LambdaMatcher<T> matcher = new LambdaMatcher(predicate);
    return Matchers.argThat(matcher);
}
{% endhighlight %}

Which will result in the following test.

{% highlight java linenos %}
@Test
public void canFindEmployee()
{
    Employee employee = new Employee("John");
    company.addEmployee(employee);

    verify(mockedDal).registerEmployee(argThatMatches(e -> e.getName()
                                                            .equals(employee.getName())));
}
{% endhighlight %}

That's it! Feel free to use the `LambdaMatcher` class in your own projects and add some Lambda to your unit tests!

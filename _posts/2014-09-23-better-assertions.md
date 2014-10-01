---
layout: post

title: "Better unit test assertions in Java"
#subtitle: ""

author:
  name: Guillaume Simard
  bio: Team Lead, UA
  twitter: guisim
  image: guisim.jpg
---

If you've ever written a unit test in Java, you've probably used JUnit 4 and done something like this:
	
    public class CompanyTest {
        private Company company;
        @Before
        public void setup()
        {
            company = new Company();
        }
        
        @Test
        public void getEmployees()
        {
            company.addEmployee("John");
            company.addEmployee("Susan");
            assertEquals(company.getEmployees().size(), 2);
        }	    
    }

This is okay and gets the job done. However, I think there are some issues with this approach.

<!-- more -->

If there's a bug in your `Company` class and the `addEmployee` method does not work, you will get the following message:
	
    java.lang.AssertionError: 
    Expected :0
    Actual   :2

Expected 0? Oops, `assertEquals` takes the expected value first and the actual value second. That's an easy mistake to make. So you fix your test and write it as:

	assertEquals(2, company.getEmployees().size());

And now you get:
	
    java.lang.AssertionError: 
    Expected :2
    Actual   :0

That's better. Now you know that the test expects an integer with a value of 2 but received an integer with a value of 0.

But is that really what your test expects? I would argue that you were expecting a collection with a size of 2, not an integer with a size of 2. Sadly, it is not easy to express this with JUnit 4.

## Introducing [Fest Assertions](https://github.com/alexruiz/fest-assert-2.x/wiki/Using-fest-assertions) (or Fluent Assertions)!

Fest Assertions introduces a new static method, `assertThat` that gives you the power to easily express complex assertions in a way that allows the assertion engine to _know_ what you want to verify.

The best way to write the above unit test would become:

    assertThat(company.getEmployees()).hasSize(2);

If this test fails, you will get the following message:

    java.lang.AssertionError: expected size:<2> but was:<0> for <[]>

This is much better! Now we know that we expected a collection with size 2 but the actual size was zero. We can even see the content of the collection being tested. This technique also addresses the problem of `assertEquals()` parameter order.

Here are some more examples on how `assertThat` can help you.

### Another cleaner error message

*The test*

    // Before
    assertTrue(company.getEmployees().isEmpty());
    // After
    assertThat(company.getEmployees()).isEmpty());

*The assertion message*

    // Before (yes, that's all it says!)
    java.lang.AssertionError
    // After
    java.lang.AssertionError: expecting empty, but was:<['John']>

### Code that reads more like english

*The test*

    // Before
    assertFalse(company.isHiring());
    // After
    assertThat(company.isHiring()).isFalse();

### Powerful assertions

*The test*

    // Before
    assertTrue(company instanceof Company);
    // After
    assertThat(company).isInstanceOf(Company.class);
   
*The assertion message*

    // Before
    java.lang.AssertionError
    // After
    java.lang.AssertionError: expected instance of:<com.coveo.Company> but was instance of:<java.lang.Object>

EDIT: [Here]({% post_url 2014-10-01-java8-mockito%}) is another way you can enhance the readability of your tests using Java 8.

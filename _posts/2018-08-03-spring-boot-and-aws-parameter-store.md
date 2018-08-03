---
layout: post

title: "Spring Boot and AWS Parameter Store"

tags: [Spring Boot, Externalized Configuration, Property Source, Spring Cloud, AWS, Parameter Store]

author:
  name: Frederic Boutin
  bio: Software Developer
  image: fboutin2.jpg

---

Storing parameters securely accross multiple environments with employees having different level of access in each of those can be challenging. [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-paramstore.html) offers a nice solution to that problem with lots of advantages such as: 
- hosted, highly available, and scalable
- history tracking
- encryption with KMS
- audits in CloudTrail
- notifications with CloudWatch or SNS
- granular security using [IAM policies](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-paramstore-access.html)

Every security team's dream.

When we decided to store our deepest secrets in the Parameter Store, I searched right away for an integration with Spring Boot/Cloud for our Java microservices. I was left empty-handed.<!-- more --> There wasn't anything out there at the time[^1].


I looked into [Spring Boot External Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html) to see how I could integrate the Parameter Store to it. After a few hours of digging into Spring Boot code, I had something working that was quite simple and elegant. Any team using Spring Boot could simply add this integration to their project and without editing their code or changing injected property names they could fetch values from the Parameter Store. It was basically plug and play.

Since we've been using this integration in production for over a year now, and it worked pretty well so far, we decided to open source it a few months ago. Here it is on github: [spring-boot-parameter-store-integration](https://github.com/coveo/spring-boot-parameter-store-integration) and on [maven central](http://search.maven.org/#search%7Cga%7C1%7Ca%3A%22spring-boot-parameter-store-integration%22).

# Adding a Property Source to Spring Boot
To create a Property Source with Spring Boot, there is one simple class to code. This class needs to extend `PropertySource<T>` where `T` is a source of properties. This can basically be any class. So implementing a Property Source for the Parameter Store would go like this:

{% highlight java %}
public class ParameterStorePropertySource extends PropertySource<AWSSimpleSystemsManagement> {
    public ParameterStorePropertySource(String name, AWSSimpleSystemsManagement source) {
        super(name, source);
    }

    @Override
    public Object getProperty(String name) {
        try {
            return source.getParameter(new GetParameterRequest().withName(propertyName)
                                                                .withWithDecryption(true))
                         .getParameter()
                         .getValue();
        } catch (ParameterNotFoundException e) {
            return null;
        }
    }
}
{% endhighlight %}

As you can see, I put a try/catch in there to prevent throwing when a parameter is not found. A Property Source must return null when it can't find a property. This is how Spring Boot knows to fallback on other Property Sources. Note also that the source is in fact the SSM client from the [AWS SDK](https://docs.aws.amazon.com/systems-manager/latest/APIReference/Welcome.html).

We now need to add this Property Source to the application context. To do this I used an `EnvironmentPostProcessor`. It's as simple as:
{% highlight java %}
public class ParameterStorePropertySourceEnvironmentPostProcessor implements EnvironmentPostProcessor {
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        environment.getPropertySources()
                   .addFirst(new ParameterStorePropertySource("AWSParameterStorePropertySource",
                                                              AWSSimpleSystemsManagementClientBuilder.defaultClient()));
    }
}
{% endhighlight %}
Here I used the `addFirst` method to make sure the `ParameterStorePropertySource` has the highest precedence, but you could also do otherwise by using other `add` methods (`addBefore`, `addAfter`, `addLast`).

That's almost it, to enable an `EnvironmentPostProcessor`, you need to add a `spring.factories` file to your resources in the `META-INF` folder. See this [section](https://docs.spring.io/spring-boot/docs/current/reference/html/howto-spring-boot-application.html#howto-customize-the-environment-or-application-context) of Spring Boot's documentation. In our case: 
{% highlight bash %}
org.springframework.boot.env.EnvironmentPostProcessor=com.coveo.configuration.parameterstore.ParameterStorePropertySourceEnvironmentPostProcessor
{% endhighlight %}

If you try to boot this, it will try to fetch _every_ property to the Parameter Store before looking into other default Property Sources. This is probably not a good idea. Making that much calls to the Parameter Store for lots of properties that will end up being resolved locally is not great. Let's see what we can do about that.

## Limit Calls to AWS 
To limit the AWS calls to a minimum, I've added a required prefix. Since the Parameter Store supports `/` to simulate folders, it seemed natural to force it as a prefix. Here is what our `getProperty` method looks like with this change:

{% highlight java %}
@Override
public Object getProperty(String name) {
    if (name.startsWith("/")) {
        try {
            return ssmClient.getParameter(new GetParameterRequest().withName(propertyName)
                                                                   .withWithDecryption(true))
                            .getParameter()
                            .getValue();
        } catch (ParameterNotFoundException e) {
        }
    }
    return null;
}
{% endhighlight %}
Great! Now we have a small piece of code that enables the Parameter Store using a prefix.

What if we want to migrate lots of microservices with lots of already named properties that don't start by `/`? Or worse, what if we need to store a property that is not defined in our code, but is a built-in Spring Boot property? Then what if we need to rename a property in AWS? We would need to edit the code to do so. As you can see it is not yet a viable solution.

# Spring Boot Placeholder Saving the Day

After thinking for a while, I remembered we were using [placeholders](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html#boot-features-external-config-placeholders-in-properties) somewhere to point two properties to a same value. Let's say you have some properties `a` and you want it to have the same value as `b`. You can inject `${b}` in `a` and you would get the wanted result without copying the actual value. Here is a `yaml` example to make things clearer:

{% highlight yaml %}
a: ${b} # will resolve to "test" at runtime
b: test
{% endhighlight %}
This is possible because Spring Boot parses any property it loads seeking for `${}` recursively until it finds an actual value. This seems simple and innocent, but fixed all of our problems. Instead of editing code so that property names match the ones in Parameter Store, we can simply inject as an environment variables or in a `yaml`: `${/my/param/store/property}` in any given property. It will resolve to the value stored in `/my/param/store/property` from the Parameter Store. For example, this code:
{% highlight java %}
@Value("${password}")
private String myPassword;
{% endhighlight %}

with this `application.yaml`:
{% highlight yaml %}
password: qwerty // a local environment password
{% endhighlight %}

add to this an environment variable injected at runtime in production:
{% highlight bash %}
password=${/prod/password}
{% endhighlight %}

and finally this parameter in the Parameter Store:
{% highlight bash %}
/prod/password=azerty
{% endhighlight %}

Lets take a look at what would happen here. First, if you boot this app locally without the environment variable, the value `"qwerty"` would be injected in the field `myPassword`. Things get exciting when you run it in production with the environment variable above. In that situation, Spring Boot prioritizes environment variables over the `application.yaml` and will resolve `${password}` to `${/prod/password}`. Then it figures out it should look for a property named `/prod/password` because of the surrounding `${}`. Finally, using our custom Property Source, it finds it in the Parameter Store and injects the production password `"azerty"` in `myPassword`.

This right there saved us an incredible amount of work and added lots of flexibility to change names in the Parameter Store on the fly.

# Halt Boot to Prevent Production Incidents

Looking at the last example, you can easily guess what happens if someone forgets to add the parameter `/prod/password` in the production Parameter Store... Yup, you guessed right, the local environment password ends up in production. There are multiple ways to fix this. A simple way is to ship code without any `yaml` configuration. This way your app won't boot because of the missing property. In our case that is not possible, at least not easily. We have a default configuration for every microservice that makes it easy for a developer to pick up a repository, clone it, and boot the app in his favourite IDE to debug it. So to prevent production incidents, I added a wrapper around the Parameter Store client to halt the boot if any property prefixed by `/` isn't found in AWS. Here is the resulting class:

{% highlight java %}
public class ParameterStoreSource {
    private AWSSimpleSystemsManagement ssmClient;
    private boolean haltBoot;

    public ParameterStoreSource(AWSSimpleSystemsManagement ssmClient, boolean haltBoot) {
        this.ssmClient = ssmClient;
        this.haltBoot = haltBoot;
    }

    public Object getProperty(String propertyName) {
        try {
            return ssmClient.getParameter(new GetParameterRequest().withName(propertyName).withWithDecryption(true))
                            .getParameter()
                            .getValue();
        } catch (ParameterNotFoundException e) {
            if (haltBoot) {
                throw new ParameterStoreParameterNotFoundRuntimeException(propertyName, e);
            }
        }
        return null;
    }
}
{% endhighlight %}

this `ParameterStoreSource` is then used as the `Source` of `ParameterStorePropertySource` replacing the Parameter Store client, like this :

{% highlight java %}
public class ParameterStorePropertySource extends PropertySource<ParameterStoreSource> {
    public ParameterStorePropertySource(String name, ParameterStoreSource source) {
        super(name, source);
    }

    @Override
    public Object getProperty(String name) {
        if (name.startsWith("/")) {
            return source.getProperty(name);
        }
        return null;
    }
}
{% endhighlight %}

That's pretty much it. Add to this a bit of sugar like wrapping AWS exceptions with a helpful message, some configurations to enable or disable the Property Source and the result is here on [github](https://github.com/coveo/spring-boot-parameter-store-integration) and here on [maven central](http://search.maven.org/#search%7Cga%7C1%7Ca%3A%22spring-boot-parameter-store-integration%22). Simple enough, but quite useful, this little lib helped us be more secure by using AWS Parameter Store without much change to our code. I hope it can help others too!

 [^1]: There since has been a merged [PR](https://github.com/spring-cloud/spring-cloud-aws/pull/308) to integrate the Parameter Store in an upcoming version of Spring Cloud (still not released). Our tiny library is still relevant though: if you don't want to add Spring Cloud to your project, it supports Spring Boot without it, and as described in this post, there is a configuration to halt boot that can save you many problems.
---
layout: post

title: "Microservices and exception handling in Java with Feign and reflection"

tags: [Microservices, Java, Reflection, Feign, Exception handling]

author:
  name: Jacques-Etienne Beaudet
  bio: Software developer and tinkerer
  image: jebeaudet.png

---
Exception handling across microservices can be tedious, let's see how the Java reflection API can help us ease the pain!
<!-- more -->

# Microservices architecture
When it comes to building a complex application in the cloud, microservices architecture is the newest and coolest kid in town. It has numerous advantages over the more _traditional_ monolithic architecture such as :

- modularization and isolation, which makes the development easier in a big team;
- more efficient scaling of the critical paths of the application;
- possibility to upgrade only a microservice at a time, making the deployments less risky and less prone to unexpected side effects;
- technology independance : by exposing an API with a clearly defined contract with a set of common rules shared by all microservices, you don't have to care which language or database is used by the microservice.

I could go on for a while on this, microservices are a great way to build applications in the cloud. There are lots of awesome OSS projects from our friends at [Netflix](https://netflix.github.io/) and [Spring](https://spring.io/) that will help you doing this, from [service discovery](https://github.com/Netflix/eureka) to [mid-tier load balancing](https://github.com/Netflix/ribbon) and [dynamic configuration](https://github.com/Netflix/archaius), there's a library for most requirements you'll have to meet. It's also great to see Spring coming aboard with [Spring Cloud](http://projects.spring.io/spring-cloud/) collaborating and integrating some of the Netflix librairies into a very useful and simple library to use with your new or existing Spring application!

## Caveats
It wouln't be fair to avoid talking about the downsides of microservices as they do present some challenges and are not suited to everyone and every application out there. Splitting an application into microservices bring some additional concerns like :

- complex configuration management : 10 microservices? 10 configuration profiles, 10 Logback configurations, etc. (using a centralized [configuration server](https://github.com/spring-cloud/spring-cloud-config) can help you on this though);
- performance hit : you need to validate this token? No problem, just make a POST to this endpoint with the token in the body and you'll get the response in no time! While this is true for most cases, the network overhead, serialization/deserialization process can become a bottleneck and you always have to be resilient for network outages or congestion;
- Interacting with other microservices brings a lot of boilerplate code : whereas a single additional method to a class was needed in a monolithic architecture, in a microservices you need a resource implementing an API, a client, some authorization mechanism, exception handling, etc.

# Dynamic exception handling using [Feign](https://github.com/Netflix/feign) and reflection

In a monolithic application, handling exceptions is a walk in the park. However, if something goes wrong during an inter-service call, most of the times you'll want to propagate this exception or handle it gracefully. The problem is, you don't get an exception from the client, you get an HTTP code and a body describing the error or you may get a generic exception depending on the client used.

For some of our applications at Coveo, we use [Feign](https://github.com/Netflix/feign) to build our clients across services. It allows us to easily build clients by just writing an interface with the parameters, the endpoint and the thrown exceptions like this : 
{% highlight java %}
interface GitHub {
  @RequestLine("GET /users/{user}/repos")
  List<Repo> getUserRepos(@Param("user") String user) throws UserDoesNotExistException;
}
{% endhighlight %}
When using the client, you are able to easily decode errors using the `ErrorDecoder` interface with the received `Response` object when the HTTP code is not in the 200 range. Now, we only need a way to map the errors to the proper exception. 

## Required base exception

Most of our exceptions here at Coveo inherit from a base exception which defines a readable `errorCode` that is unique per exception : 
{% highlight java %}
public abstract class ServiceException extends Exception
{
    private String errorCode;
    //Constructors omitted
    public String getErrorCode()
    {
        return errorCode;
    }
}
{% endhighlight %}
This allows us to translate exceptions on the API into a `RestException` object with a consistent error code and message like this : 
{% highlight json %}
{
    "errorCode": "INVALID_TOKEN",
    "message": "The provided token is invalid or expired."
}
{% endhighlight %}
Using the `errorCode` as the key, we can use the reflection API of Java to build up a map of thrown exceptions at runtime and rethrow them like there was no inter-service call!

### Using reflection to create a dynamic `ErrorDecoder`
Alright, let's dive into the code. First, we need a little POJO to hold the information for instantiation : 
{% highlight java %}
public class ThrownServiceExceptionDetails
{
    private Class<? extends ServiceException> clazz;
    private Constructor<? extends ServiceException> emptyConstructor;
    private Constructor<? extends ServiceException> messageConstructor;
    //getters and setters omitted
}
{% endhighlight %}
Then, we use reflection to get the thrown exceptions from the client in the constructor by passing the Feign interface as a parameter : 
{% highlight java %}
public class FeignServiceExceptionErrorDecoder implements ErrorDecoder
{
    private static final Logger logger = LoggerFactory.getLogger(FeignServiceExceptionErrorDecoder.class)

    private Class<?> apiClass;
    private Map<String, ThrownServiceExceptionDetails> exceptionsThrown = new HashMap<>();

    public FeignServiceExceptionErrorDecoder(Class<?> apiClass) throws Exception
    {
        this.apiClass = apiClass;
        for (Method method : apiClass.getMethods()) {
            if (method.getAnnotation(RequestLine.class) != null) {
                for (Class<?> clazz : method.getExceptionTypes()) {
                    if (ServiceException.class.isAssignableFrom(clazz)) {
                        if (Modifier.isAbstract(clazz.getModifiers())) {
                            extractServiceExceptionInfoFromSubClasses(clazz);
                        } else {
                            extractServiceExceptionInfo(clazz);
                        }
                    } else {
                        logger.info("Exception '{}' declared thrown on interface '{}' doesn't inherit from 
                                     ServiceException, it will be skipped.", clazz.getName(), apiClass.getName())
                    }
                }
            }
        }
    }
{% endhighlight %}
With the thrown exceptions in hand, knowing that they inherit from `ServiceException`, we extract the `errorCode` and the relevant constructors. It supports empty constructor and single `String` parameter constructor : 
{% highlight java %}
private void extractServiceExceptionInfo(Class<?> clazz)
        throws Exception
{
    ServiceException thrownException = null;
    Constructor<?> emptyConstructor = null;
    Constructor<?> messageConstructor = null;

    for (Constructor<?> constructor : clazz.getConstructors()) {
        Class<?>[] parameters = constructor.getParameterTypes();
        if (parameters.length == 0) {
            emptyConstructor = constructor;
            thrownException = (ServiceException) constructor.newInstance();
        } else if (parameters.length == 1 && parameters[0].isAssignableFrom(String.class)) {
            messageConstructor = constructor;
            thrownException = (ServiceException) constructor.newInstance(new String());
        }
    }

    if (thrownException != null) {
        exceptionsThrown.put(thrownException.getErrorCode(),
                new ThrownServiceExceptionDetails()
                    .withClazz((Class<? extends ServiceException>) clazz)
                    .withEmptyConstructor((Constructor<? extends ServiceException>) emptyConstructor)
                    .withMessageConstructor((Constructor<? extends ServiceException>) messageConstructor));
    } else {
        logger.warn("Couldn't instantiate the exception '{}' for the interface '{}', it needs an empty or String 
                     only *public* constructor.", clazz.getName(), apiClass.getName());
    }
}
{% endhighlight %}
Bonus feature, when the scanned exception is abstract, we use the Spring `ClassPathScanningCandidateComponentProvider` to get all the subclasses and add them to the map : 
{% highlight java %}
private void extractServiceExceptionInfoFromSubClasses(Class<?> clazz)
        throws Exception
{
    Set<Class<?>> subClasses = getAllSubClasses(clazz);
    for (Class<?> subClass : subClasses) {
        extractServiceExceptionInfo(subClass);
    }
}

private Set<Class<?>> getAllSubClasses(Class<?> clazz) throws ClassNotFoundException
{
    ClassPathScanningCandidateComponentProvider provider = 
            new ClassPathScanningCandidateComponentProvider(false);
    provider.addIncludeFilter(new AssignableTypeFilter(clazz));

    Set<BeanDefinition> components = provider.findCandidateComponents("your/base/package/here");

    Set<Class<?>> subClasses = new HashSet<>();
    for (BeanDefinition component : components) {
        subClasses.add(Class.forName(component.getBeanClassName()));
    }
    return subClasses;
}
{% endhighlight %}
Finally, we need to implement Feign `ErrorDecoder`. We deserialize the body into the `RestException` object who holds the `message` and the `errorCode` used to map to the proper exception : 
{% highlight java %}
@Override
public Exception decode(String methodKey,
                        Response response)
{
    private JacksonDecoder jacksonDecoder = new JacksonDecoder();
    try {
        RestException restException = (RestException) jacksonDecoder.decode(response, RestException.class);
        if (restException != null && exceptionsThrown.containsKey(restException.getErrorCode())) {
            return getExceptionByReflection(restException);
        }
    } catch (IOException e) {
        // Fail silently here, irrelevant as a new exception will be thrown anyway
    } catch (Exception e) {
        logger.error("Error instantiating the exception to be thrown for the interface '{}'", 
                     apiClass.getName(), e);
    }
    return defaultDecode(methodKey, response, restException); //fallback not presented here
}

private ServiceException getExceptionByReflection(RestException restException)
        throws Exception
{
    ServiceException exceptionToBeThrown = null;
    ThrownServiceExceptionDetails exceptionDetails = exceptionsThrown.get(restException.getErrorCode());
    if (exceptionDetails.hasMessageConstructor()) {
        exceptionToBeThrown = exceptionDetails.getMessageConstructor().newInstance(restException.getMessage());
    } else {
        exceptionToBeThrown = exceptionDetails.getEmptyConstructor().newInstance();
    }
    return exceptionToBeThrown;
}
{% endhighlight %}

# Success!
Now that wasn't so hard was it? By using this `ErrorDecoder`, all the exceptions declared thrown, even the subclasses of abstract base exceptions in our APIs, will get a chance to live by and get thrown on both sides of an inter-service call, with no specific treatment, just some reflection magic! 

Hopefully this will come in handy for you, thanks for reading!

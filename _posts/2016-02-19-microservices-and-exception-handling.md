---
layout: post

title: "Microservices and exception handling with Feign and reflection"

tags: [Microservices, Java, Reflection, Feign, Exception handling]

author:
  name: Jacques-Etienne Beaudet
  bio: Software developer and tinkerer
  image: jebeaudet.png

---
Exception handling across microservices can be tedious, let's see how the Java reflection api can help us ease the pain!
<!-- more -->
# Microservices architecture
When it comes to building a complex application in the cloud, microservices architecture is the newest and coolest kid in town. It has numerous advantages over the more _traditional_ monolithic architecture such as :

- modularization and isolation, which makes the development easier in a big team;
- more efficient scaling of the critical paths of the application;
- possibility to upgrade only a microservice at a time, making the deployments less risky and less prone to unexpected side effects;
- technology independance : by exposing an api with a clearly defined contract with a set of common rules shared by all microservices, you don't have to care which language or database is used by the microservice.

I could go on for a while on this, microservices are a great way to build applications in the cloud. There are lots of awesome OSS projects from our friends at [Netflix](https://netflix.github.io/) and [Spring](https://spring.io/) that will help you doing this, from [service discovery](https://github.com/Netflix/eureka) to [mid-tier load balancing](https://github.com/Netflix/ribbon) and [dynamic configuration](https://github.com/Netflix/archaius), there's a library for most requirements you'll have to meet. It's also great to see Spring coming aboard with [Spring Cloud](http://projects.spring.io/spring-cloud/) collaborating and integrating some of Netflix librairies into a very useful and simple library to use with your new or existing Spring application!

## Caveats
It wouln't be fair to avoid talking about the downsides of microservices as they do present some serious caveats and are not suited to everyone and every application out there. Splitting an application into microservices bring some additional challenges like : 
- complex configuration management: 10 microservices? 10 configuration profiles, 10 Logback configurations, etc. (using a centralized [configuration server](https://github.com/spring-cloud/spring-cloud-config) can help you on this though);
- complicated build, packaging and deployment processes;
- performance hit : you need to validate this token? No problem, just make a POST to this endpoint with the token in the body and you'll get the response in no time! While this is true for most cases, the network overhead, serialization/deserialization process can become a bottleneck and you always have to be resilient for network outages or congestion;
- Interacting with other microservices brings a lot of boilerplate code : whereas a single additional method to a class was needed in a monolithic architecture, in a microservices you need a resource implementing an API, a client, some authorization mechanism, exception handling...

# Inter-service communication
## Resource, API and client architecture
When it comes to dealing with microservices, you'll have to deal with many cases of inter-services communication. To do this properly, you need to implement you APIs so that so that the endpoints, parameters and thrown exceptions follow along nicely during development. A good way to do that is have 3 seperate projects for the API, the resource and the client (we're using Spring annotations here but the logic stands for any framework and libraries used) :  
**FooApi.java**
```java
public interface FooApi
{
    @RequestMapping(method = RequestMethod.GET, value ="/bar/{id}")
    Bar getBar(@PathVariable String id) throws BarDoesNotExistException;
}
```
**FooResource.java**
```java
@RestController
public class FooResource implements FooApi
{
    @Override
    public String getBar(String id) throws BarDoesNotExistException
    {
        someService.getBar(id);
    }
}
```
**FooClient.java**
```java
@FeignClient("Foo")
public class FooClient extends FooApi
{
}
```
Both the client and the resource project link on the API project so they are decoupled and changes on the api will follow along on the api and client automatically. This is possible with [Feign](https://github.com/Netflix/feign) version 8.13 and up using Feign annotations or with Spring annotations using `SpringMvcContract` in Spring Cloud Netflix. 

## Dynamic exception handling in Feign
In a monolithic application, handling exceptions is a walk in the park. However, when using an inter-service call and something goes wrong, most of the times you'd like to propagate this exception or handle it gracefully. The problem is, you don't get an exception from the client, you get a HTTP code and a JSON body describing the error or you may get a generic exception depending on the client used.

Using Feign, you are able to easily decode errors using the `ErrorDecoder` interface with the received `Response` object when the HTTP code is not in the 200 range. Now, we only need a way to map the errors to the proper exception. At Coveo, most of our exceptions inherit from a base exception which defines a readable `errorCode` that is unique per exception : 
```java
public abstract class ServiceException extends Exception
{
    private static final long serialVersionUID = 1L;
    private String errorCode;
    //Constructors omitted
    public String getErrorCode()
    {
        return errorCode;
    }
}
```
This allows us to return a consistent error message on the api like this : 
```json
{
    "errorCode": "INVALID_TOKEN",
    "message": "The provided token is invalid or expired."
}
```
Using this key, we can use the reflection api of Java to build up a map of thrown exceptions at runtime and rethrown them like there were no inter-service call!
### Using reflection to create a dynamic ErrorDecoder
Alright, let's dive into the code. First, we need a little POJO to hold the information for instantiation : 
```java
public class ThrownServiceExceptionDetails
{
    private Class<? extends ServiceException> clazz;
    private Constructor<? extends ServiceException> emptyConstructor;
    private Constructor<? extends ServiceException> messageConstructor;
    //getters and setters omitted
}
```
Then, we use reflection to get the thrown exceptions from the client (it supports both Spring `@RequestMapping` and Feign `@RequestLine` annotation and scanning subclasses!) : 
```java
public class FeignServiceExceptionErrorDecoder implements ErrorDecoder
{
    private Class<?> apiClass;
    private Map<String, ThrownServiceExceptionDetails> exceptionsThrown = new HashMap<>();

    public FeignServiceExceptionErrorDecoder(Class<?> apiClass) throws Exception
    {
        this.apiClass = apiClass;
        for (Method method : apiClass.getMethods()) {
            if (method.getAnnotation(RequestMapping.class) != null || 
                method.getAnnotation(RequestLine.class) != null) {
                for (Class<?> clazz : method.getExceptionTypes()) {
                    if (ServiceException.class.isAssignableFrom(clazz)) {
                        if (Modifier.isAbstract(clazz.getModifiers())) {
                            extractServiceExceptionInfoFromSubClasses(clazz);
                        } else {
                            extractServiceExceptionInfo(clazz);
                        }
                    } else {
                        //log warning as exception doesn't inherit from ServiceException
                    }
                }
            }
        }
    }
```
With the thrown exceptions in hand, knowing that they inherit from `ServiceException`, we extract the `errorCode` and the relevant constructors. It supports empty constructor and single `String` parameter constructor : 
```java
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
        //log warning as there are no compatible constructors
    }
}
```
Bonus feature, when the scanned exception is abstract, we use the Spring `ClassPathScanningCandidateComponentProvider` to get all the subclasses and add them to the map : 
```java
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
}
```
Finally, we implement Feign `ErrorDecoder`, deserialize the body into the `RestException` object we use who hold the `errorCode` and `message` and we use this to return the proper exception : 
```java
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
        //log error
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
```

# Success!
Now that wasn't so hard was it? By using this `ErrorDecoder`, all the exceptions declared thrown, even the subclasses of abstract base exceptions in our APIs will get a chance to live by and get rethrown on both sides of an inter-service call, with no specific treatment, no gigantic switch case, just some reflection magic! 

Hopefully you have learned a thing or two today, thanks for reading!

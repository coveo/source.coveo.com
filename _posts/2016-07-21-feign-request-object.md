---
layout: post

title: "Using request objects with Feign"
tags: [Java, Feign, Api]

author:
  name: Jonathan Rochette
  bio: Analytics API Jedi Master
  twitter: JoRochette
  image: jrochette.jpg
---
We recently decided to move our functional tests stack from python to Java, mainly to make coding them easier (our project's backend is coded in Java) and thus increase the number of tests getting written. We needed a few things to make this possible and one of them was a complete and comprehensive Java client for the Usage Analytics API. Since a lot of the Java API clients we use internaly are built with [Netflix's Feign](https://github.com/OpenFeign/feign), I decided to give it a go.

<!-- more -->

After playing with Feign a little, I started to really like the tool. Writing an HTTP client with it is pretty easy, and it would not be a lot of work to maintain. I only had one major concern: there was no out of the box support for request objects.

Using request objects is a simple pattern that help maintain methods with many optional parameters, which is the case for some our API's methods. Without request objects, calling a method would look like this:

```java
statsApi.getCombinedData(from,
                         to,
                         dimensions,
                         metrics,
                         null,
                         null,
                         null,
                         null,
                         true,
                         null,
                         null,
                         null);
```

Not looking so good, right? Using a request object transforms the method call into this:

```java
statsApi.getCombinedData(new GetCombinedDataRequest(from,
                                                    to,
                                                    dimensions,
                                                    metrics)
                         .withIncludeMetadata(true));
```

Way better! 

For the request objects, we settled for a constructor that would take the required parameters of the API call in arguments. The optional parameters can then be added to the request with setters or via the fluent interface pattern.

So, this is all very nice, but it does not fix my initial concern with Feign. I have some really nice request objects, but I cannot use any of them, as they are not supported. But, since Feign is very easily extendable, I simply added support for the request objects via a homemade encoder. And thus, the ReflectionEncoder was born.

```java
public class ReflectionEncoder implements Encoder
{
    private static final String DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSZZ";
    private ObjectMapper mapper;
    private Encoder fallbackEncoder;

    public ReflectionEncoder(ObjectMapper mapper,
                             Encoder fallbackEncoder)
    {
        this.mapper = mapper;
        this.fallbackEncoder = fallbackEncoder;
    }

    @Override
    public void encode(Object parametersObject, Type bodyType, RequestTemplate template)
      throws EncodeException {
      if (Request.class.isAssignableFrom(parametersObject.getClass())) {
        Map<String, Object> params = new HashMap<>();
        try {
          // Prepare the requestTemplate
          for (Method method : parametersObject.getClass().getMethods()) {
            if (method.isAnnotationPresent(QueryParam.class)) {
              String key = method.getAnnotation(QueryParam.class).value();
              Object value = method.invoke(parametersObject);
              if (value != null) {
                if (Collection.class.isAssignableFrom(method.getReturnType())) {
                  value =
                      ((Collection<?>) value)
                          .stream()
                          .map(v -> String.valueOf(v))
                          .collect(Collectors.toList());
                } else if (DateTime.class.isAssignableFrom(method.getReturnType())) {
                  value = ((DateTime) value).toString(DEFAULT_DATETIME_FORMAT);
                } else {
                  value = String.valueOf(value);
                }
                params.put(key, value);
                template.query(key, keyToTemplate(key));
              }
            } else if (method.isAnnotationPresent(PathParam.class)) {
              String key = method.getAnnotation(PathParam.class).value();
              Object value = method.invoke(parametersObject);
              if (value != null) {
                params.put(key, String.valueOf(value));
              }
            } else if (method.isAnnotationPresent(BodyParam.class)) {
              template.body(mapper.writeValueAsString(method.invoke(parametersObject)));
            }
          }

          // Replace templates with actual values
          template.resolve(params);
        } catch (
            IllegalAccessException
            | IllegalArgumentException
            | InvocationTargetException
            | JsonProcessingException e) {
          throw new EncodeException("Could not encode parameter object correctly", e);
        }
      } else {
        fallbackEncoder.encode(parametersObject, bodyType, template);
      }
    }

    private String keyToTemplate(String key)
    {
        return "{" + key + "}";
    }
}
```

It may look complicated, but it's in fact pretty simple. Here is how it works: if the object received by the encoder is of the right type, it will use reflection to find the getters of the object, and depending on the annotation, inject the parameter at the right place in the RequestTemplate. Otherwise, it will use a fallback encoder. 

Now, simply set the ReflectionEncoder in your client class with the builder provided by Feign and you are ready to go!

Here is a complete example of a simple client using request objects.

```java
public interface CustomDimensionsApi extends ClientFactory.Api
{
    @RequestLine("PUT /" + ApiVersion.VERSION + "/dimensions/custom/{apiName}")
    DimensionResponse editDimension(EditDimensionRequest request);
}
```

```java
public class EditDimensionRequest extends BaseRequest
{
    private String apiName;
    private Boolean updatePastEvents;
    private CustomDimensionModel customDimensionModel;

    public EditDimensionRequest(String apiName,
                                CustomDimensionModel customDimensionModel)
    {
        this.apiName = apiName;
        this.customDimensionModel = customDimensionModel;
    }

    @PathParam("apiName")
    public String getApiName() { return apiName; }
    public void setApiName(String apiName) { this.apiName = apiName; }

    @QueryParam("updatePastEvents")
    public Boolean getUpdatePastEvents() { return updatePastEvents; }
    public void setUpdatePastEvents(Boolean updatePastEvents) { this.updatePastEvents = updatePastEvents; }

    @BodyParam
    public CustomDimensionModel getCustomDimensionModel() { return customDimensionModel; }
    public void setCustomDimensionModel(CustomDimensionModel customDimensionModel) { this.customDimensionModel = customDimensionModel; }

    public EditDimensionRequest withUpdatePastEvents(Boolean updatePastEvents){
        setUpdatePastEvents(updatePastEvents); return this;
    }
}
```

There you have it: a very simple HTTP client built with Feign, using a request object. It made coding our functional tests way easier and made them much cleaner. The next steps for us would be to combine that with [better exception handling](https://source.coveo.com/2016/02/19/microservices-and-exception-handling/) (awesome post by my friend Jacques-Etienne Beaudet, go check it out) and we would be unstoppable!


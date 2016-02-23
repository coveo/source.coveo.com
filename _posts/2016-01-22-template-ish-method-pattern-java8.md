---
layout: post

title: "Template-ish method pattern using java 8"
tags: [Java, Java 8, Design Patterns]

author:
  name: Jonathan Rochette
  bio: Analytics API Jedi Master
  twitter: JoRochette
  image: jrochette.jpg
---

In the Usage Analytics service, there is a layer that validates if a user is allowed to perform the requested action. This should not be a surprise for anybody as all applications have some kind of security or permission check somewhere. Since the UA service is built in a layer architecture, that’s the job of the permission layer. The code is pretty boilerplate and very similar for all the different calls. It follows this logic :

* Extract user identity and account from token
* Check if the user has the required permissions
    * If he does, call the service layer
    * If he doesn’t, throw an exception

<!-- more -->

This rang a bell in my head. Surely, there’s a design pattern that could help make this code more straightforward and with less duplication. The pattern that seemed the best fit was the [template method pattern](https://en.wikipedia.org/wiki/Template_method_pattern). It is a well known design pattern that can sometimes have a pretty big drawback : with many different implementations come many classes (and it can sometimes be a pain to maintain that many classes). I decided to use some of the goodies that came with Java 8 to solve this problem.

Here is what it looks like :

{% highlight java %}

public class UserServiceWithToken
{
    private UserService userService;
    private TokenCacheWrapper tokenCacheWrapper;
    private TokenService tokenService;
    private PermissionsService permissionService;

    @Inject
    public UserServiceWithToken(UserService userService,
                                TokenCacheWrapper tokenCacheWrapper,
                                TokenService tokenService,
                                PermissionsService permissionService)
    {
        this.userService = userService;
        this.tokenCacheWrapper = tokenCacheWrapper;
        this.tokenService = tokenService;
        this.permissionService = permissionService;
    }


    public Set<Report> getReportsByUser(String token,
                                        String userId,
                                        Optional<String> org) throws UsageAnalyticsException
    {
        return executeIfAuthorized(org,
                                   tokenCacheWrapper.getTokenInfo(token),
                                   account -> userService.getReportsByUser(account, userId),
                                   Permissions.VIEW_REPORTS);
    }

    public void setAllowedReportsOnUser(String token,
                                        String id,
                                        Set<String> reports,
                                        Optional<String> org) throws UsageAnalyticsException
    {
        executeIfAuthorized(org,
                            tokenCacheWrapper.getTokenInfo(token),
                            Functions.consumerToFunction(account -> userService.setReportsOnUser(account,
                                                                                                 id,
                                                                                                 reports)),
                            Permissions.EDIT_REPORTS);
    }


    private <T> T executeIfAuthorized(Optional<String> org,
                                      TokenInfo tokenInfo,
                                      FunctionE1<String, T, UsageAnalyticsException> executer,
                                      Permission... permissions) throws UsageAnalyticsException
    {
        String account = tokenService.extractAccount(tokenInfo, org);
        for (Permission permission : permissions) {
            permissionService.throwIfDoesNotHavePermission(tokenInfo, account, permission);
        }
        return executer.apply(org.orElse(account));
    }

}

{% endhighlight %}

And here is the little _consumerToFunction_ trick I used to only have one _executeIfAuthorized_ method :

{% highlight java %}

    public static <T> Function<T, Void> consumerToFunction(Consumer<T> consumer)
    {
        return x -> {
            consumer.accept(x);
            return null;
        };
    }

{% endhighlight %}

I could have used AOP ([Aspect Oriented Programming](https://en.wikipedia.org/wiki/Aspect-oriented_programming)) to implement a similar solution, similar in the way that it would have achieved the same goals :cleaner code and less code duplication. I chose the template method pattern because I think AOP was overkill for what I was trying to do, like killing a fly with a rocket launcher. Although AOP has its advantages, it would have required more refactoring and the introduction of a new AOP framework. Also, the team is not used to work with AOP. Those familiar with the template method design pattern will recognize that the code above is not exactly an implementation of this pattern, but all in all, I like the result. The implementation is concise, easy to read and adding a new method in the permission layer is very easy. As a bonus, it does not affect the testability of the code as it is fairly easy to mock and unit test.

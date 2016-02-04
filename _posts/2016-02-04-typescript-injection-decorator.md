---
layout: post

title: "Typescript Dependency Injection and Decorators"
tags: [Typescript, Injection, Decorator, Javascript, ES7]

author:
  name: Germain Bergeron
  bio:  Software Ninjaneer
  image: gbergeron.jpg
---

In July 2015, Microsoft announced the release of Typescript 1.5, introducing [decorators]( https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#decorators), based on the ES7 decorator proposal. I had to test it!

<!-- more -->

>It should be noted that decorators are still in [stage 1 proposal](https://github.com/wycats/javascript-decorators) and their actual implementation could change anytime 

This article will demonstrate the possibility of using decorators to do dependency injection in Typescript.

##Why uses injection?

1.	Injection avoids the pollution of the global namespace with object instances.

2.	It provides an easy way to share an object instance across our application, without the need to pass the object everywhere.
    
    In our constantly growing Single Page Application, we have some objects that are constants through a user visit. E.g., the visitor's browser and the logged User. The first offers us some utility methods like `browser.isMobile()` or `browser.isIE()`. The second which contains a set of permissions, email, etc., is used, among other things, to determine which panels the user can access.

3.	The injected object is always up-to-date.

    We use Backbone to periodically refresh our models with the state from the server. Our injector allows us to create the instance once and use it where we need it.


##Implementation

I made a simple [project]( https://github.com/GermainBergeron/dose) on GitHub that provides the Injector and decorator. Feel free to contribute!
 
It's also available on npm: `npm install dose`.

It uses a small registry that stores values in a map. There's a lot to improve in there, but it met my requirements.

{% highlight javascript %}
export default class Injector {

    private static registry: {[key: string]: any} = {};

    static getRegistered(key: string): any {
        var registered = Injector.registry[key];
        if (registered) {
            return registered;
        } else {
            throw new Error(`Error: ${key} was not registered.`);
        }
    }

    static register(key: string, value: any) {
        var registered = Injector.registry[key];
        if (registered) {
            throw new Error(`Error: ${key} is already registered.`);
        }
        Injector.registry[key] = value;
    }
}
{% endhighlight %}

The Injector can now be used like this:
{% highlight javascript %}
/* FileA.ts */
import User from 'User';
import Injector from 'Injector';

/* Register the User */
let instance = new User('John', 'Smith', 25);
Injector.register('user', instance);

/* Register Application Settings */
let settings = {DEBUG: false};
Injector.register('settings', settings);
{% endhighlight %}

{% highlight javascript %}
/* FileB.ts */ 
import Injector from 'Injector';

function test() {
    let user = <User>Injector.getRegistered('user');
    console.log(user.name);
}
test();
{% endhighlight %}

It works and it's far from magic. We must cast the registered value in `User` because `getRegistered` returns an object of type `any`.

###Enters the decorator
First, let's look at the simpler injector:
{% highlight javascript %}
function injectProperty(...keys: string[]) {
    return (target: any, property: string) => {
        target[property] = Injector.getRegistered(keys[0]);
    };
}
{% endhighlight %}

In this code, `target` is the object instance on which we want to inject and `key` is the property. Let's see the usage:

{% highlight javascript %}
class UserConsumer {
    @inject('user')
    private user: User;
}
{% endhighlight %}
target => UserConsumer

property => user

keys[0] => 'user'

The `injectorMethod` does about the same but accept 1…N keys instead of one.
{% highlight javascript %}
class UserConsumer {
    @injectorMethod ('user', 'settings')
    getUserAge(offset: number, user?: User, settings?: any) {
        if (settings.DEBUG) {
            console.log('Getting user age');
        }
        return offset + user.age;
    }
}
{% endhighlight %}

>Note that it adds parameters to the methods. I have yet to make it work directly in the method parameters

Nice! But we can do better. We don't want to have a decorator for the method and another for the property. Let's wrap them with a small function that detects the type, so we can use `@inject('key')` on both methods and parameters

{% highlight javascript %}
export function inject(...keys: string[]) {
    return (...args: any[]) => {
        var params = [];
        for(var i=0;i<args.length; i++){
            args[i] ? params.push(args[i]) : null;
        }
        switch (params.length) {
            case 2:
                return injectProperty(keys[0]).apply(this, args);
            case 3:
                return injectMethod(...keys).apply(this, args);
            default:
                throw new Error("Decorators are not valid here!");
        }
    };
}
{% endhighlight %}

Here's the complete UserConsumer code. A small demo project is available on [GitHub](https://github.com/GermainBergeron/injector).
{% highlight javascript %}
import {inject} from '../node_modules/dose/dist/Dose';
import User from './User';
import InjectableKeys from './InjectableKeys';

export default class UserConsumer {

    @inject(InjectableKeys.User)
    private user: User;

    @inject(InjectableKeys.Settings)
    private settings: {DEBUG: boolean};

    @inject(InjectableKeys.User, InjectableKeys.Settings)
    getUserAge(user?: User, settings?: {DEBUG: boolean}) {
        if (settings.DEBUG) {
            console.log('Getting user age');
        }
        return user.age;
    }

    getUserName() {
        console.log(this.settings);
        if (this.settings.DEBUG) {
            console.log('Getting user name');
        }
        return this.user.name;
    }
}
{% endhighlight %}

The official Typescript [decorator page](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md) has a lot more information on what is possible with the decorators.

###Try it
Create a npm projet that depends on dose & Typescript >= 1.5. Then you can run `npm install` to download the dependencies. 

Import the injector & the inject decorator and you are all set!

Be sure to pass the `–experimentalDecorators` flag to your typescript compiler 

That's it!
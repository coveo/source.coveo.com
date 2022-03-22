---
layout: post

title: "Software Engineering: It’s All About Abstraction"

tags: [abstraction, single responsibility principle, srp, don't repeat yourself, dry, test, readability]

author:
  name: Kevin Lalumiere
  bio: Software Developer, Indexing Infrastructure
  image: klalumiere.jpg

---

Next summer, I'm going to drink a beer under a tree.

Right now you probably have an image of me, under a tree, with a beer: you understood my _intent_.
What's interesting is that the details of this image will probably be significantly different for each person that is reading.
This is because I did not talk about the implementations; _beer_ and _tree_ are abstractions, they convey a general idea efficiently without getting lost in the details.
_Efficiently_ is the key word here: imagine if I had to describe the detailed implementation of a tree or a beer each time I want to talk about them! 😰

Since abstractions are a key part of the way humans communicate, they are also a key part of software engineering. 
Indeed, since software engineering is about [_programming over time_](https://www.goodreads.com/book/show/48816586-software-engineering-at-google), it is in part about using source code to communicate ideas to other developers.
This won't come as a surprise to most of you: we, developers, know that abstractions are a key part of our job.
That being said, it's not always clear how abstractions link to our day-to-day programming and to our leading practices.
[Single Responsibility Principle (SRP)](https://en.wikipedia.org/wiki/Single-responsibility_principle), [Design Patterns](https://www.goodreads.com/book/show/85009.Design_Patterns), [Don't Repeat Yourself (DRY)](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) and test readability are all somehow related to abstractions.
This post explores these connections and it shows how understanding them helps to make better decisions about our programs.
<!-- more -->

![manUnderTree]({{ site.baseurl }}/images/2022-03-31-software-engineering-it-s-all-about-abstraction/manUnderTree.jpg)

## Abstractions and SRP

The SRP is colloquially known as "a function or a class should do one thing".
The problem of this statement is that the definition of "one thing" is not very clear.
Many people mitigated this issue by stating the SRP in other, more precise ways.
Some of these alternative formulations are very helpful, but what help me the most to implement SRP is the following guideline

> The level of abstraction in a function implementation should be constant and as high as the locality of information allows.

For instance, consider the recipe

```c++
Pizza CreateMargheritaPizza() {
    Dough base{};
    base += TomatoSauce{};
    base += Cheese{};

    // Grow basil
    Flowerpot pot;
    pot.Fill(Earth{});
    pot.Plant(BasilSeed{});
    pot.Age(std::chrono::weeks{4});

    return Cook(base) + OliveOil{} + pot.Harvest();
}
```

The function operates at the ingredient abstraction level, except for the basil, where it goes into details about where it comes from.
This is a SRP transgression smell, as is the "paragraph" in the function.
Interestingly, this paragraph starts with a helpful comment, `// Grow basil`.
This comment suggest the abstraction that should be created in order to simplify the function, `Basil`:

```c++
Pizza CreateMargheritaPizza() {
    Dough base{};
    base += TomatoSauce{};
    base += Cheese{};
    return Cook(base) + OliveOil{} + Basil{};
}
```

Now, you've probably heard (or said), at least once in your career, something along the lines

> I wanted to keep my code simple and to know what it does, so I wrote everything in a single function.

This kind of comment stems from years of witnessing horrible abstractions,

```c++
int main(int argc, char* argv[]) {
    doSomething(argc, argv);
}

// In another file

void doSomething(int argc, char* argv[]) {
    MyType a{argc};
    a.visit(argv);
}

// In another file

class MyType: public BaseVisitor {
public:
    using BaseVisitor::BaseVisitor;
};

// In another file from another repository...
```

This is where locality of information comes in.
A good abstraction keeps the information of _what_ it does, but hides the information of _how_ it does it.
An example of such a good abstraction is `quicksort(input)`.

An important conclusion that stems from this discussion is that SRP is _not_ about naively distributing the code in many small functions, it is about finding the abstractions hidden in your code and using the appropriate mechanisms (classes, functions, modules) in order to represent them.

One reason why we still see a lot of large classes and functions is that writting good abstraction can be very hard.
Sometimes, there is not even a word that exists to describe the concept that you are trying to express.
For instance, in the seminal book [Design Patterns](https://www.goodreads.com/book/show/85009.Design_Patterns), we can read

> The purpose of this book is to record experience in designing object-oriented software as design patterns. Each design pattern systematically names, explains, and evaluates an important and recurring design in object-oriented systems.

In other words, arguably one of the most important contributions of the [Gang of Four](https://en.wikipedia.org/wiki/Design_Patterns) is to have _named_ typical abstraction that software engineers were using.
Hence, thanks to them, we could now discuss more easily about these patterns and label their use in our code so other developers would understand in a blink our intent.

## Abstractions show when to be DRY

The DRY principle states that we should not repeat ourselves.
It is hard to overestimate the importance of this principle: we all experienced many bugs created by forgetting to change one of the `N` copy-pasted pieces of code in a code base.
However, you might also have seen cases where the application of the principle seemed, to say the least, far-fetched...

Consider a dockerfile written by a team responsible for the microservice `BasilService`,

```dockerfile
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends --assume-yes \
        python3 \
        tini
```

and then, another service's dockerfile, `OliveOilService`, contains

```dockerfile
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends --assume-yes \
        python3 \
        python3-pip \
        tini
```

There is clearly a duplication in both dockerfile: both depends on `python3` and `tini`.
So, what should we do from here?
Create a base container image that contains both `python3` and `tini`, named `UbuntuWithPython3AndTini`, or perhaps the typical `BaseService`?
Doing so would eliminate the duplication, but it would also create a coupling between the `BasilService` and the `OliveOilService` who, semantically, should have nothing in common.
As we'll see in the next paragraph, what might seem like a complicated trade-off driven decision becomes a lot simpler when we look at the problem from the perspective of abstractions.

The problem with duplication is change coupling, that is, when changing the code in a file `A` implies that you should remember to also change it in a file `B`.
For instance, let's say you find out that, in our previous example about `Basil`, you need to add the call `pot.Water` between the calls `pot.Plant` and `pot.Age`, perhaps in a loop so that you water the poor basil plant regularly.
If you repeated the code to grow basil at 10 places in your code base, you'll need to make 10 modifications, which will take time and which is error-prone.
The interesting thing is that, if you correctly identify and use an appropriate mechanism to represent the abstraction of creating basil, like for instance the class `Basil`, you will also eliminate the duplication.
In other words, when you see change coupling, there is often also a hidden abstraction.

Going back to our previous examples with the dockerfiles, we can see that there is no change coupling between both.
For instance, `BasilService` could stop depending on `python3` at any time without impacting `OliveOilService`.
Hence, using the vocabulary of [Fred Brooks](https://en.wikipedia.org/wiki/No_Silver_Bullet), we say that the duplication is **accidental**, not **essential** (I'm not the first to use these words in the DRY context, see for instance [this excellent blog post written by Marius Bongarts](https://medium.com/@mariusbongarts11/when-you-should-duplicate-code-b0d747bc1c67)).

## What about tests

Sometime unit tests are considered a special case when it comes to programming.
However, as [Adam Tornhill points out in Software Design X-Rays](https://www.goodreads.com/book/show/36517037-software-design-x-rays), a lot of technical debt is actually in test code.
So, are tests really special?

Not so if we consider them from the perspective of the discussion above.
For instance, consider the two tests

```c++
TEST(Concatenation, EmptyString) {
    ASSERT_EQ("arbitrary", concatenate("","arbitrary"));
}

TEST(Concatenation, TwoStrings) {
    ASSERT_EQ("arbitrary", concatenate("ar","bitrary"));
}
```

Some might say that the second test is not DRY and that `"arbitrary"` should be stored in a variable.
Others would point out that storing `"arbitrary"` in a variable actually makes the test harder to read.
However, the trade-off is an illusion because there is no DRY transgression: the duplication is **accidental**, not **essential**!

Another problem one might encounter is tests that are quite large,

```c++
TEST(CookingClass, CanCookJambalaya) {
    // Arrange
    // ... [Big block of code]

    // Act
    // ... [Big block of code]

    // Assert
    // ... [Big block of code]
}
```

When the `Arrange` block gets large, it means that setting up your the class under test is hard.
In a worse case scenario, the class under test might not be ready to use before `N` particular methods are called (in order) to initialize it.
This is problematic because it means that using your code is very error-prone.
Hence, to ease the live of the users of your class Application Programming Interface (API), you should probably consider adding tools to simplify the creation of the class in a "ready to use" state: perhaps a factory function with sane and safe defaults.
If you need to inject [stubs](https://en.wikipedia.org/wiki/Method_stub) (like an in-memory database for instance) during your test, you could also create a (different) factory function that initializes your class under test with the stubs.
This would help people to use your class in some other tests.

If the `Act` block of code gets large, it can mean that you are testing the behavior of your class when `N` methods of your API are called in a particular order.
In other words, it can mean that the methods of the class under test interact in a non-trivial way.
This interaction will make your API harder to use, or more precisely easier to misuse.
Hence, you should consider redesigning your API so that the users can directly do what they want to do with a single (or as few as possible) method call.

Finally, a large `Assert` block can mean two things.
First, the state of objects of your class might be hard to observe.
This design choice might give you a slight increase in encapsulation, but it will make future logging and debugging a lot harder.
A large `Assert` block could also mean that you should write a new custom `ASSERT` function.
Most test frameworks let you do that in some way: the challenge here will be to idenfity the abstraction that the new `ASSERT` function should represent.

## Love your abstractions

Writing a program is creating and using abstractions.
By choosing good abstractions, separating them properly and making sure that they are well named, you make it easier for the next person that will read your code.
Considering that code is written `O(1)` times and that it is read `O(N)` times, taking the time to do so is a sound investment as soon as your code lives for a little while. 
So next time you do software development, don't hesitate to take the time required to make your abstractions beautiful.

---
layout: post

title: "Error Handling Tradeoffs and Crashing in Production"

tags: [error handling, throw, catch, raise, exception, return code, errno, crash, terminate, exit]

author:
  name: Kevin Lalumiere
  bio: Staff Software Developer, Indexing Infrastructure
  image: klalumiere.jpg

---

# Error Handling Tradeoffs and Crashing in Production

There are only [two hard things](https://martinfowler.com/bliki/TwoHardThings.html) in Computer Science: memory problems, error handling, and of course off-by-1 errors.

For years, I've felt uncertain about what to do when something unexpected happens in a program I wrote.
Should I return an error code, crash, crash in debug builds only, throw an exception...
This uncertainty lit up my curiosity, and slowly, while I accumulated the years of experience, I became more aware of the tradeoffs behind each strategy.
Because, of course, the answer is, as always, _it depends_.

# Return code, side channel and crashing

The first programming language I learned when I was a teenager was C[^1].
In this language, I saw that functions like [`printf`](https://en.cppreference.com/w/c/io/fprintf) return an error code when they failed.
Some of these functions would also use other communication channels to communicate about failures, for instance a preprocessor macro named [`errno`](https://en.cppreference.com/w/c/error/errno).

It was not until university, when I was learning about [defensive programming](https://en.wikipedia.org/wiki/Defensive_programming), that I heard about [C's assert](https://en.cppreference.com/w/c/error/assert).
The principle is that you use a macro called `assert` to verify conditions that should always be true about your program, something like

```c
assert(pointer != NULL);
*pointer = 42;
```

The condition will be verified in debug builds, and the program will crash if it's not true.
In release builds, the check is removed in order to save precious CPU cycles, and because you wouldn't want to crash a release program, would you?

# Exceptions

A few weeks after I learned C, I taught myself C++.
I thought that since C was interesting, it's incremented version would be awesome!
This is while learning C++ that I learned about _exceptions_.
With exceptions, a failing function can `throw` an object that can be `catch` by any other function down the stack.
For instance,

```c++
void RenderBoldHtml() {
    try {
        std::cout << getBoldHtml() << std::endl;
    } catch(const NetworkIsDownException& exception) {
        std::cerr << exception.what();
    }
}

std::string getBoldHtml() {
    std::string boldStart = "<b>";
    std::string boldEnd = "<b>";
    return "<b>" + getHtml() + "</b>";
}

std::string getHtml() {
    if(isNetworkDown()) throw NetworkIsDownException{};
    return getHtmlImplementation();
}
```

Exceptions have many advantages compared to C's return code.
First, they propagate transparently, which facilitate [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns).
For instance, in the example above, the function `getBoldHtml()` doesn't know or need to know that the function `getHtml()` can throw an exception.
This is made possible since object classes in C++ have so-called `destructor` that frees the resources associated to each object.
These destructor are called at the end of the scope of objects or when exceptions are thrown.
This is why the objects `boldStart` and `boldEnd` don't need to be manually cleaned up, including when `getHtml()` throws an exception. 

These advantages are significant, but they are not free.
In C++, exceptions comes with a runtime cost, which made them, according to [Herb Sutter's talk](https://youtu.be/ARYP83yNAWk), a non-zero-overhead abstraction.
This is one of the reasons some businesses like Google famously decided not to use them.
Actually, when you throw an exception, the so-called stack unwinding happens which ends up running a lot of code (for instance the `destructor`s).
Finally, exceptions can be a little bit too transparent.
It is easy to forget to handle an exception that we _had to_ handle for our program to work properly.

## Throw an exception or crash?

A question that I asked myself for a long time is: should I `assert` or should I `throw`.
Yes, `assert` should be for conditions that are _always true_, but my experience as a developer taught me humility: what I think is always true is usually true... until it becomes false!
Sometime, this happens in production code, where the `assert`s were removed.
In this case, the bug can propagate until something bad happen, usually quite far from the place where the `assert` would have failed if it was a debug build.
This behavior made release build hard to debug: perhaps replacing `assert` with `throw` was the answer?

I gave it a lot of thought, I read a lot, listen to a lot of talks, and I came to a surprising conclusion: sometime, you should crash the program in production.
Of course, something should restart the program.
That being said, there's still the risk of getting stuck in a [crashloop](https://stackoverflow.com/a/52215388/3068259).
So, in which condition is it worth risking a crashloop in production?
When your program is in a corrupted state.

The behavior of a corrupted program is no longer predictable.
It is clear with this definition that a corrupted program is dangerous, and the rise of security incidents made the danger of such programs very visible.
For instance, consider the C++ code

```c
assert(i >= 0); // always true
assert(i < arraySize); // always true
array[i] += userInput;
```

If, for some reason that we don't understand, the variable `i` becomes an arbitrary value, this code could, depending on how it is compiled, result in an arbitrary code execution from the user.
Hence, we should definitely not remove those checks in production code.
This is with this principle in mind that the [C++ contract proposal](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2016/p0380r1.pdf) was written.
If the predicate of the contract is `false`, the program will crash, both in release build and in debug build.

Why not throw an exception instead of crashing?
For two reasons:
- We assume that nobody down the stack will have enough information to handle the exception: we are in a situation that we thought as impossible and for all we know, the stack itself could be corrupted!
- As mentioned before, throwing an exception actually execute a lot of code, which is not safe in a context where the program is corrupted, see [this paper](https://www.ndss-symposium.org/wp-content/uploads/2023/02/ndss2023_s295_paper.pdf) for instance.

## Checked exceptions

To make it less likely that developers forget to deal with exceptions that they have to handle, Java introduced checked exceptions.
If a method throws a checked exception, for instance an `IOException`, it _must_ declare it in its signature.
When a method `doX()` doesn't declare that it's throwing an exception, the compiler enforces it.
Hence, if `doX()` calls `doIO() throws IOException`, it needs to do it in a `try` block and to `catch` the `IOException` that could be thrown.
Alternatively, `doX() could declare the exception in its own signature to pass the checked exception to the parent caller.

The powerful compile-time check described in the previous paragraph comes with tradeoffs.
Since checked exceptions are part of the API of the methods, it means that a change in the exceptions thrown will result in an API break.
This is, of course, required in a method where we want, for instance, to catch every exception, like in the `DoX()` example above.
However, there are some context where methods don't need to know if an exception is thrown and where we would like transparent propagation, like in the function `getBoldHtml` mentioned before.
As explained above, this is actually one of the strengths of the exception concept: it allows separation of concerns between business logic and error handling.
Using `RuntimeException`, which are not _checked_, is a typical way to recover the transparency that is used by [Spring](https://spring.io/) for instance.
Java programmers also invented workarounds to allow recovering the transparent propagation with checked exceptions, like using the generic `throws Exception`, but some of these workarounds are equivalent to stop using checked exceptions altogether.

Is it possible to have the best of both worlds, robust compile time checks and transparent propagation?

# The return of the return codes

After the advent of checked exceptions, some programming languages and some libraries started to return, for each function and method call that might fail, an object that contains the result of the computation as well as information about the error that might have occurred.
Go uses this approach, for instance.
Rust also uses this approach, but with a twist, it uses it in a way that allows developers to benefit from the advantage of checked exceptions _and_ of transparent propagation.
To achieve this, the object returned by fallible functions contains either the return value or an error, and the caller _must_ take into account the failure modes in order to get to the underlying return value.
The caller can also easily propagate errors without handling them.
All of this can sound a bit abstract, so let's dive in with examples! 😄

In Rust, every error must be handled explicitly, _but_, the operator `?` allows propagating the error to the calling function.
For instance, consider the function[^2]

```rust
fn read_username_from_file() -> Result<String, io::Error> {
    let mut username_file = File::open("hello.txt")?;
    let mut username = String::new();
    username_file.read_to_string(&mut username)?;
    Ok(username)
}
```

In this example, the `String` that contains the `username` will usually be returned, but if the call `File::open("hello.txt")` or `read_to_string(&mut username)` fails and returns an `io::Error` object, the `?` operator will return this object right away.
An example of main function that calls `read_user_from_file` is

```rust
fn main() {
    let user_result = read_username_from_file();

    match user_result {
        Ok(username) => println!("Hello, {username}!");,
        Err(error) => panic!("Problem opening the file: {:?}", error),
    };
}
```

The more astute readers might notice that the transparent propagation problem is not solved yet.
Indeed, `read_username_from_file` needs to know that `File::open` and `read_to_string` can return `io::Error`, and then it needs to declare it in the return type in its signature `-> Result<String, io::Error>`.
Hence, if `File::open` started to throw a new error type, for instance `io::ErrorInterface`, the signature of `read_username_from_file` would need to be modified.
Luckily for us, there are libraries that handle the error abstraction problem, like [thiserror](https://docs.rs/thiserror/latest/thiserror/) and [miette](https://docs.rs/miette/latest/miette/).
These libraries were implemented in part thanks to the powerful Rust macro system.

# Closing thoughts

From C to Rust, the facilities that we can use to handle errors have evolved quite a bit.
What used to look like mutual exclusive tradeoffs are now available to us at the same time, making it easier to design programs that are as reliable as exciting!

_Thanks to (TODO) YOU who were kind enough to review this blog post._

If you love evaluating the implication of tradeoffs in different contexts in order to make the right choice and produce efficient software, make sure to check out our [careers](https://www.coveo.com/en/company/careers/open-positions?utm_source=tech-blog&utm_medium=blog-post&utm_campaign=organic#t=career-search&numberOfResults=9) page and apply to join the team!

[^1]: Actually, it was HTML, but does it really count as a programming language? 😉
[^2]: This example is taken from the excellent [Rust book](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html)

---
layout: post

title: "Interaction between Move Semantic and Copy Elision in C++"

tags: [C++, C++11, C++14, C++17, Move Semantic, Copy Elision]

author:
  name: Kevin Lalumiere
  bio: Software Developer, Index
  image: klalumiere.jpg

---

C++11 introduced [move semantic](https://en.cppreference.com/w/cpp/utility/move), which allows, as its name suggests, to move objects instead of copying them.
The *move* process typically involves copying pointers to some resources, and then setting the original pointers to `nullptr`, so they cannot be used to access the resources anymore.
Of course, all of this is done transparently to the user of the class.

With this power comes a complexity, which is enhanced when it is coupled with [copy elision](https://en.cppreference.com/w/cpp/language/copy_elision).
Copy elision is the general process where, when returned from a function, an object is not copied nor moved, *resulting in zero-copy pass-by-value semantics*.
It includes both return value optimization (RVO) and named return value optimization (NRVO).

While the links on *cppreference* provided above probably contain all the information you might want to know about the interaction of move semantic with copy elision, they can be a bit of an arid reading.
The goal of this post is to give a quick and incomplete introduction on the subject.
This introduction is then used to present an interesting difference between the `g++` and `clang++` 3.8 compilers.
<!-- more -->

## Returning a local variable

Consider the following code:
```c++
class Verbose {
public:
    Verbose() { std::cerr << "Constructed\n"; }
    Verbose(const Verbose&) { std::cerr << "Copied\n"; }
    Verbose(Verbose&&) { std::cerr << "Moved\n"; }
};

Verbose create() {
    Verbose result;
    return result;
}

int main() {
    Verbose v = create();
    return 0;
}
```
When compiled using the `clang++ -std=c++14 -fno-elide-constructors move.cpp` command, this code prints:
```bash
Constructed
Moved
Moved
```
The result object is `Constructed`, and then it is `Moved`. At first, it is moved from the `create` to the `main` function, and then from the right hand side to the left hand side of `Verbose v = create();`.
This happpens because the `result` variable is eligible for copy elision, and in C++11 or more, a variable eligible for copy elision will be moved if the optimization doesn't take place (see [return statement](https://en.cppreference.com/w/cpp/language/return#Notes)).

Notice that the compilation option `-fno-elide-constructors` was used.
If it's not used, the output is:
```bash
Constructed
```
The object is *constructed in place* and it is never copied or moved; this is [copy elision](https://en.cppreference.com/w/cpp/language/copy_elision) in action.
Notice that, in C++14, it is an optimization (so it might not happen), but in C++17, [it is required by the standard](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2017/n4713.pdf#page=258).

Consider adding a `std::move()` on the `return` line in `create`:
```c++
Verbose create() {
    Verbose result;
    return std::move(result);
}
```
When compiled with `clang++ -std=c++14 move.cpp`, i.e., without `-fno-elide-constructors`, we observed:
```bash
Constructed
Moved
```
Copy elision does not take place since NRVO can only happen when the expression on the `return` line is *the name of a non-volatile object with automatic storage duration* (see [Copy elision](https://en.cppreference.com/w/cpp/language/copy_elision#Explanation)).
More precisely, the wording on [cppreference](https://en.cppreference.com/w/cpp/language/copy_elision#Explanation), which is similar to the wording [in the standard's draft](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2014/n4296.pdf#page=308), suggests that NRVO can only take place with an [lvalue](https://en.cppreference.com/w/cpp/language/value_category#lvalue) and RVO with a [prvalue](https://en.cppreference.com/w/cpp/language/value_category#prvalue), while `std::move(result)` is an [xvalue](https://en.cppreference.com/w/cpp/language/value_category#xvalue).

## Compilers with different perspectives

Let's now discuss a confusing difference between `g++` and `clang++` 3.8.
Consider:
```c++
class VerboseChild: public Verbose {
public:
    void functionOnlyOnChild() {}
};

std::unique_ptr<Verbose> createPointer() {
    auto pointer = std::make_unique<VerboseChild>();
    pointer->functionOnlyOnChild();
    return pointer;
}
```
Click <a href="https://gcc.godbolt.org/#g:!((g:!((g:!((h:codeEditor,i:(j:1,lang:c%2B%2B,source:'%23include+%3Ciostream%3E%0A%23include+%3Cmemory%3E%0A%0Aclass+Verbose+%7B%0Apublic:%0A++++Verbose()+%7B+std::cerr+%3C%3C+%22Constructed%5Cn%22%3B+%7D%0A++++Verbose(const+Verbose%26)+%7B+std::cerr+%3C%3C+%22Copied%5Cn%22%3B+%7D%0A++++Verbose(Verbose%26%26)+%7B+std::cerr+%3C%3C+%22Moved%5Cn%22%3B+%7D%0A%7D%3B%0A%0Aclass+VerboseChild:+public+Verbose+%7B%0Apublic:%0A++++void+functionOnlyOnChild()+%7B%7D%0A%7D%3B%0A%0Astd::unique_ptr%3CVerbose%3E+createPointer()+%7B%0A++++auto+pointer+%3D+std::make_unique%3CVerboseChild%3E()%3B%0A++++pointer-%3EfunctionOnlyOnChild()%3B%0A++++return+pointer%3B%0A%7D%0A%0AVerbose+create()+%7B%0A++++Verbose+result%3B%0A++++return+result%3B%0A%7D%0A%0Aint+main()+%7B%0A++++Verbose+v+%3D+create()%3B%0A++++return+0%3B%0A%7D'),l:'5',n:'0',o:'C%2B%2B+source+%231',t:'0')),k:50,l:'4',n:'0',o:'',s:0,t:'0'),(g:!((g:!((h:compiler,i:(compiler:g540,filters:(b:'1',binary:'1',commentOnly:'1',demangle:'1',directives:'1',execute:'1',intel:'1',trim:'1'),lang:c%2B%2B,libs:!(),options:'-std%3Dc%2B%2B14',source:1),l:'5',n:'0',o:'x86-64+gcc+5.4+(Editor+%231,+Compiler+%231)+C%2B%2B',t:'0')),header:(),k:50,l:'4',m:9.015256588072125,n:'0',o:'',s:0,t:'0'),(g:!((h:output,i:(compiler:1,editor:1,wrap:'1'),l:'5',n:'0',o:'%231+with+x86-64+gcc+5.4',t:'0')),header:(),l:'4',m:90.98474341192791,n:'0',o:'',s:0,t:'0')),k:50,l:'3',n:'0',o:'',t:'0')),l:'2',n:'0',o:'',t:'0')),version:4">here to compile with `g++`</a> and <a href="https://gcc.godbolt.org/#g:!((g:!((g:!((h:codeEditor,i:(j:1,lang:c%2B%2B,source:'%23include+%3Ciostream%3E%0A%23include+%3Cmemory%3E%0A%0Aclass+Verbose+%7B%0Apublic:%0A++++Verbose()+%7B+std::cerr+%3C%3C+%22Constructed%5Cn%22%3B+%7D%0A++++Verbose(const+Verbose%26)+%7B+std::cerr+%3C%3C+%22Copied%5Cn%22%3B+%7D%0A++++Verbose(Verbose%26%26)+%7B+std::cerr+%3C%3C+%22Moved%5Cn%22%3B+%7D%0A%7D%3B%0A%0Aclass+VerboseChild:+public+Verbose+%7B%0Apublic:%0A++++void+functionOnlyOnChild()+%7B%7D%0A%7D%3B%0A%0Astd::unique_ptr%3CVerbose%3E+createPointer()+%7B%0A++++auto+pointer+%3D+std::make_unique%3CVerboseChild%3E()%3B%0A++++pointer-%3EfunctionOnlyOnChild()%3B%0A++++return+pointer%3B%0A%7D%0A%0AVerbose+create()+%7B%0A++++Verbose+result%3B%0A++++return+result%3B%0A%7D%0A%0Aint+main()+%7B%0A++++Verbose+v+%3D+create()%3B%0A++++return+0%3B%0A%7D'),l:'5',n:'0',o:'C%2B%2B+source+%231',t:'0')),k:50,l:'4',n:'0',o:'',s:0,t:'0'),(g:!((g:!((h:compiler,i:(compiler:clang380,filters:(b:'1',binary:'1',commentOnly:'1',demangle:'1',directives:'1',execute:'1',intel:'1',trim:'1'),lang:c%2B%2B,libs:!(),options:'-std%3Dc%2B%2B14',source:1),l:'5',n:'0',o:'x86-64+clang+3.8+(Editor+%231,+Compiler+%231)+C%2B%2B',t:'0')),header:(),k:50,l:'4',m:9.015256588072125,n:'0',o:'',s:0,t:'0'),(g:!((h:output,i:(compiler:1,editor:1,wrap:'1'),l:'5',n:'0',o:'%231+with+x86-64+clang+3.8',t:'0')),header:(),l:'4',m:90.98474341192791,n:'0',o:'',s:0,t:'0')),k:50,l:'3',n:'0',o:'',t:'0')),l:'2',n:'0',o:'',t:'0')),version:4">here to compile with `clang++` 3.8</a>.

As you can see, this compiles without any problems with `g++`, but this does *not* compile with `clang++` 3.8.
This is because we are using [covariance](https://cpptruths.blogspot.com/2015/11/covariance-and-contravariance-in-c.html) here.
Hence, the return type in the signature of the function is not the same than the type of the object returned.
It seems that the `clang++` 3.8 developers decided that, since the types are actually different, `pointer` should not be eligible for copy elision, thus it should not be moved.
On the other hand, the `g++` developers seem to have decided that implementing covariance properly required the covariant types to behave as a single type in this particular case.

The solution for the code to compile is to add a `std::move` in these cases, and to add a comment to explain why it is required since somebody compiling your code with `g++` could be surprised by this `std::move` and be tempted to remove it when refactoring.
```c++
std::unique_ptr<Verbose> createPointer() {
    auto pointer = std::make_unique<VerboseChild>();
    pointer->functionOnlyOnChild();
    return std::move(pointer); // required by clang++ 3.8 since covariant
}
```
An alternative fix is to use a version of clang greater or equal to 3.9.0.
This might seem like an easy fix considering that the latest version of clang is 7.0.0, but many people still use 3.8.0 since the popular Ubuntu 16.04 is packaged with it.

## Conclusion

One of the goal of the design of move semantic seems to be transparency.
When possible, the user of a class defining a move constructor should be able to enjoy the performance gain due to move semantic without any special syntax required.
The interaction of move semantic with copy elision follow that principle: what could be simpler than returning by value?

There *is* a complexity, but a typical user should be shielded from it, especially if they follow leading practices like the [single responsibility principle (SRP)](https://en.wikipedia.org/wiki/Single_responsibility_principle).
This goes along with what seems to be the usual philosophy of C++, i.e., to make a language which is performant and easy to use at the cost of a high complexity behind the scene.
After all, did you understand [overloading](https://en.cppreference.com/w/cpp/language/overload_resolution) in depth the first time you wrote `std::cout << "Hello World" << std::endl;`?

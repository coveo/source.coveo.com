---
layout: post

title: "Adding support for 'require' in Nashorn"

author:
  name: Martin Laporte
  bio: R&D Director
  twitter: martinlaporte
  image: mlaporte.jpg
---

Some part of Coveo's query pipeline is [extensible using JavaScript](http://source.coveo.com/2014/09/23/adding-server-side-scripting/), but we recently had to switch to a new JS engine, namely Nashorn that comes out-of-the-box starting with Java 8. The engine works pretty well, but it's missing built-in support for the `require` function that is used with CommonJS modules.
<!-- more -->
Since it's a pretty handy feature, we have decided to [open source](https://github.com/coveo/nashorn-commonjs-modules) it and publish it on [Maven Central](http://mvnrepository.com/artifact/com.coveo/nashorn-commonjs-modules).

Using it is pretty straightforward: you simply need to call the `Require.enable` method in your Java code, passing it your instance of `NashornScriptEngine` as well as an implementation of a special interface called `Folder`, responsible of loading JavaScript files from the backing medium of your choice. Here is an example:

```java
FilesystemFolder rootFolder = FilesystemFolder.create(new File("/path/to/my/folder"), "UTF-8");
Require.enable(engine, rootFolder);
```

Pretty simple, right? Once this is done you can use `require` in your JavaScript code, just as you would within NodeJS:

```js
var foo = require('./foo.js');
```

As for loading files, we provide out-of-the-box implementations for using the filesystem and Java resources. Providing your own implementation is a straightforward process --- as an example, here at Coveo we have an implementation that is backed by an SQL database.

As far as I know, the library fully implements the NodeJS API for loading modules (as described [here](https://nodejs.org/api/modules.html)). It even supports loading modules from the `node_modules` folder and subfolders, so you can use `npm` to download libraries and their dependencies. Of course, Nashorn doesn't support the Node APIs to most modules simply won't work, but you can still use it to download portable libraries such as [Underscore](http://underscorejs.org/).

Enjoy!

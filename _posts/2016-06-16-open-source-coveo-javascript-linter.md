---
layout: post

title: "How to prevent frequent JavaScript mistakes"

tags:
  - JavaScript
  - Lint
  - Eslint
  - Code style

author:
  name: Lucien Bénié
  bio: Salesforce integration wizard
  github: https://github.com/lbenie
  imageURL: https://avatars.githubusercontent.com/lbenie
---

When writing JavaScript, I spend a lot of time fixing simple mistakes. Unlike
compiled languages you are more likely to make mistakes. It is easy for syntax
errors to sneak into your code without realizing it until you actually try and
run your code.

How many times have I got an `undefined` variable because I refactored some code
and forgot to rename *that* variable.

Even tough it has been more than 5 years since I wrote my first `Hello World`.
The feeling remains the same -- Why did I make this mistake *again* ?

<!-- more -->

To help me fix some of those mistakes, I tried a few linting tools over the
years. From the overly strict `JSLint` to the more flexible variant `JSHint` and
`JSCS`. I recently discovered `Eslint` and fell in love with its
extensibility and features.

# Overview

Linting is a process of checking the source code for *programmatic* as well as
*stylistic* errors. A `Lint` or a `Linter` is a program that supports linting.
They are available for most languages like CSS, Python, JavaScript, HTML, etc...

## Eslint

[Eslint](http://eslint.org/) is the most recent of the four linting tools
previously mentioned. It was created by **Nicholas C. Zakas** in june 2013.

> Its goal is to provide a pluggable linting utility for JavaScript.

Design to be heavily extensible, it comes with a large set of custom rules and
it is really easy to install. It gives precise and concise output by including
the rule name out of the box. You are always aware of which rule was causing an
error.

`Eslint` provides good documentation for its rules. The rules list is easy to
follow and is grouped into logical categories. Each rule gives details about
what it *enforces* or *not* and provides examples of **good** and **bad**
written code for it.

### Pros

-   Customizable: every rule can be toggled, and many rules have extra settings
that can be tweaked
-   ES6/JSX support out of the box
-   Supports custom reporters
-   Has many plugins available and is very extensible
-   Include many rules not available in other linters

### Cons
-   Slow, compared to JSHint or JSCS, but faster than these two if combined
-   Requires some configuration to get started

## Extensibility

Since `ESLint` is extremely extensible, I have created a [shareable config rule
set](https://github.com/coveo/eslint-config-coveo) to help my fellow colleagues
here at [Coveo](www.coveo.com) who write Pure JavaScript.

### Open-sourcing

`eslint-config-coveo` started as an internal project for my team (Salesforce
integration) then we decided -- Hey why not open-source it?

With that in mind, I created a gulp task wrapper that use **our** rule set
defined from [that shareable
config](https://github.com/coveo/eslint-config-coveo). You can find the project
`pretty-javascript` [here](https://github.com/coveo/pretty-javascript).

**Having said all that**

For anyone who wants to write JavaScript like we do it at **Coveo** follow these
simple steps to get you up and running.

-    Install `pretty-javascript` and `gulp` packages from `npm`

```sh
npm install --save-dev pretty-javascript gulp
```

-   Create an `eslint` configuration file

.eslintrc.yaml

```yaml
---
  extends: coveo
  rules:
    ... (they can be overriden)
```

**OR**

.eslintrc.json

```json
{
  "extends": "coveo",
  "rules": {
    ... (they can be overriden)
  }
}
```

-   Create a gulp task to run `eslint`

gulpfile.js

```js
var gulp = require('gulp');
var linter = require('pretty-javascript');

gulp.task('lint', function() {
  gulp
    .src('src/**/*.js')
    .pipe(linter());
});
```

Sit back, relax and enjoy watching your silly mistakes from your terminal
output!

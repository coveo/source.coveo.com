---
layout: post

title: "Setup webpack for multiple dependent project"

tags: [Webpack]

author:
  name: Olivier Lamothe
  bio: A JavaScript dude.
  image: olamothe.png
---

In the past few months, I've been discovering [Webpack](https://webpack.github.io/) , and how to use it to improve the development process in our team.

A problem I ran into was how to setup multiple projects dependent on one another, in different repositories. 
I wanted to make sure that the development environment was as painless as possible.

<!-- more -->

For demonstration purpose, I'll talk about two of the projects I work on, the [Coveo Search UI](https://github.com/coveo/search-ui) and the Interface Editor, which is a standalone web application that allows less technical user to customize their Search UI.

The Search UI lives in it's own repository, and is a completely different product than the Interface Editor.
The Search UI is also released on npm, independently of the Interface Editor. 

Now, as you can imagine, the Search UI is a dependency of the Interface Editor. And, as you can also imagine, it often happens that we need to push code change in the Search UI project in order to improve or fix another issue in the Interface Editor. Concretely, this means that we need to be able to do a code change in the Search UI codebase, and have it available as quickly as possible in the Interface Editor project.

## Dev server

One of the very nice feature of webpack is the [webpack dev server](https://webpack.github.io/docs/webpack-dev-server.html) . It allows to drastically improve and speedup your development workflow. For both project, I setup a webpack dev server. The Search UI dev server is configured to be available on `localhost:8080` and the Interface Editor dev server lives on `localhost:8081`. 

Both work independently, and a developer working on both project will simply open a different browser tab for each server.

## Symlink between multiple projects

A nice feature of npm is the [link](https://docs.npmjs.com/cli/link) command, which allows to very easily link multiple node project with one another.

This tackle the very problem that I was trying to solve.

So, initially, that's what I tried to do. I simply used `npm link coveo-search-ui` Interface Editor repository. 

Sure enough, it looks like it worked. When I would do a code change in the Search UI codebase, both server would automatically reload because the webpack dev server would detect a change in the Search UI bundle. However, what I quickly realized was that the code change would **NOT** actually be available inside the dev server for the Interface Editor.

Concretely speaking, this meant that I would see my code changes on `localhost:8080`, but not `localhost:8081`.

The reason for this is that the dev server does not actually create a "real" bundle file on your filesystem each time it process your code change. Instead, it serves the bundle from "memory". This explains why the `npm link` command was not producing what I was initially expecting. The file linked by npm would not change on the disk each time the webpack dev server did it's job.

## Custom symlink script

To solve this, I created is a simple node script in the Search UI project to do the symlink myself. This way, I could add simple logic to fetch the code change and create a real file on my filesystem every time a bundle is created.

The script, named `link.externally.js` looks like this:

{% highlight javascript %}
'use strict';

const fs = require('fs');
const colors = require('colors');
const Q = require('q');
const rmdir = require('rimraf');
let externalProjects = ['~/coveo-interface-editor'];

const stats = Q.denodeify(fs.lstat);
const unlink = Q.denodeify(fs.unlink);
const link = Q.denodeify(fs.symlink);
const write = Q.denodeify(fs.writeFile);
const fetch = require('node-fetch');


externalProjects.forEach(function (proj) {
const path = proj + '/node_modules/coveo-search-ui';
stats(path)
    .then((fStat)=> {
      if (fStat.isSymbolicLink()) {
        return unlink(path)
      } else if (fStat.isDirectory()) {
        return new Promise((resolve, reject)=> {
          rmdir(path, (err)=> {
            if (err) {
              reject(err);
            }
            resolve(fStat);
          })
        })
      } else {
        return fStat;
      }
    })
    .catch(()=> {
      return '';
    })
    .then(()=> {
      return fetch('http://localhost:8080/js/CoveoJsSearch.js')
          .then((res)=> {
            if (res && res.status === 200) {
              return res.text();
            }
            return '';
          })
          .then((body)=> {
            if (body) {
              return write(process.cwd() + '/bin/js/CoveoJsSearch.js', body);
            }
            return '';
          })
          .catch(()=> {
            return '';
          })
    })
    .then(()=> {
      return link(process.cwd(), path, 'dir');
    })
    .done(()=> {
      console.log(`Link done for ${path}`.black.bgGreen);
    })
})
{% endhighlight %}


Basically, you configure it with an array of "external projects", and it will first check if the dependency is already present in the external folder. If it is, it will delete it.

Then, it will call the webpack dev server, download the bundle file, and write it on the file system.

## Running the script

Then, we need to run the `link.externally.js` script every time the webpack dev server does it's job.

`dev.js` is the node script that we run to start the webpack dev server in the Search UI project.

It looks like this :

{% highlight javascript %}
'use strict';
const colors = require('colors');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const _ = require('underscore');

let webpackConfig = require('../webpack.config.js');
webpackConfig.entry['CoveoJsSearch'].unshift('webpack-dev-server/client?http://localhost:8080/');
const compiler = webpack(webpackConfig);

const exec = (command, args, options, done) => {
  options = _.extend({}, {
    failOnError: true
  }, options);
  
  var p = require('child_process').spawn(command, args, {
    stdio: 'inherit'
  })
    .on('exit', function (code) {
      if (options.failOnError && code != 0) {
        done(command + ' ' + args + ' failed with error ' + code);
      } else {
        done();
      }
    });
};

let debouncedLinkToExternal = _.debounce(()=> {
  console.log('... Compiler done ... Linking external projects'.black.bgGreen);
  exec('node', ['./link.externally.js'], undefined, function () {
    console.log('Link done');
  })
}, 1000);

compiler.plugin('done', ()=> {
  debouncedLinkToExternal();
});

let server = new WebpackDevServer(compiler, {
  contentBase: 'bin/',
  publicPath: '/js/',
  compress: true
});

server.listen(8080, 'localhost', ()=> {});

{% endhighlight %}

We simply add a listener on the `done` event of the compiler, which then run the `link.externally.js` script. 

We debounced it, to guard against weird fringe case(s) where a developer could hit save extremely quickly in his editor, and produce an incomplete or incoherent bundle. 

The debounced function is a hack, because we could not figure out what exactly was happening with the dev server compiler in those situations. 

The hack works well enough though, and has stayed so far in our build process !

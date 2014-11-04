---
layout: post

title: "Optimizing web application build process"

tags: [JavaScript, Gulp, Build Process, Ant]

author:
  name: William Fortin
  bio: JavaScript Ninja, Cloud
  twitter: willyfortin
  image: wfortin.jpeg
---

At Coveo, we love to tackle new technologies. Last year was all about TypeScript, preprocessed stylesheets with LESS/SASS and optimizing our JavaScript applications with minification, concatenation and compression. Since we have a Java stack in the cloud, using the build tools that were already in place was a no brainer. We started with an Ant script to manage the build process of the Cloud Admin Web Application.

<!-- more -->

We created Ant tasks for compiling TypeScript, concatenating JavaScript libraries and compiling LESS to CSS. We then added sprites compilation, unit tests and underscore templates... up to a point where building the whole application took about 30 seconds.

That means that every time a developer had to modify a stylesheet and wanted to test it in a browser, he had to run `ant less`..and wait 6 or 7 seconds. After that, he could refresh the page and see the results. It was the same thing if he had to modify a TypeScript file, add a new library or add a new icon.

We then started to be annoyed by these preprocessors and compilers and having to **manually** trigger each tasks. We were also annoyed by the big pile of XML configuration for Ant. We needed a new build tool better suited to our JavaScript web application needs.

##Then came Gulp

Working with Gulp is a pleasure. What I must insist on is Gulp’s philosophy of **Code Over Configuration**. The biggest pain about Ant is it’s XML configuration. I love the way we can code the build tasks just as you would code regular JavaScript. Also, Gulp is blazing fast since it can run tasks that are not dependent to each other simultaneously. Porting to Gulp led to a 9 seconds build time.

There are a tons of great official and third-party plugins targeting a JavaScript stack. The plugins are all searchable right on [Gulp’s website](http://gulpjs.com/plugins/). Each plugins can be installed via npm and saved to your package.json’s devDependencies.

##Great plugins we use

###Watch

Watch is integrated into Gulp and must be one of its greatest features. Watch allows to select files and monitor for changes. We can hook those changes to specific tasks, so modifications to LESS files will trigger LESS compilation automatically. Watch improves our productivity a lot!

{% highlight javascript %}   
    var gulp = require('gulp');
    
    gulp.task('watch', function () {
        gulp.watch('./stylesheets/**/*.less', ['less']);
	gulp.watch('./templates/**/*.ejs', ['templates']);
	gulp.watch('./src/**/*.ts', ['ts:compile']);
        gulp.watch('./test/src/**/*.ts', ['test:compile']);
    });
{% endhighlight %}

###[Template compile](https://github.com/ingro/gulp-template-compile)

The Cloud Admin Web Application is a [Single Page Application](http://en.wikipedia.org/wiki/Single-page_application) built with [Marionette.JS](http://marionettejs.com/) and our template engine of choice is [Underscore.JS](http://underscorejs.org/). When developing, we want each template separated in their own [EJS files](http://www.embeddedjs.com/), but in production we need the best performance. Sure, we could use underscore’s _.template method on the client as stated in [Vincent’s latest post](http://source.coveo.com/2014/10/19/reusing-templates-underscore/) but [gulp-template-compile](https://github.com/ingro/gulp-template-compile) goes a step further by concatenating all of our templates into a single file and generating plain JavaScript functions that are usable later.

{% highlight javascript %}
    var gulp = require('gulp');
	var template = require('gulp-template-compile');
	var concat = require('gulp-concat');
	
	gulp.task('templates', function () {
	    return gulp.src('./templates/**/*.ejs')
	        .pipe(template({
		        namespace: 'CoveoTemplates'
	        }))
	        .pipe(concat('templates.js'))
	        .pipe(gulp.dest('target/package/templates'));
	});
{% endhighlight %}

Templates are now in `target/package/templates/templates.js` and accessible with `window.CoveoTemplates.templateName(data)`.

###[Gzip](https://github.com/jstuckey/gulp-gzip)

As you may know, the Cloud Admin Web application is hosted on AWS S3. Since S3 is for static file serving and doesn't allow *on-the-fly* compression, we need to gzip files before uploading them to S3. With gulp-gzip we simply pipe gzip() into our task’s stream and we have a compressed gzipped file.

{% highlight javascript %}
    var gulp = require('gulp');
    var gzip = require('gulp-gzip');
    
    // Gzip the file CoveoJsAdmin.js
    gulp.task('gzip', function () {
	    return gulp.src('target/package/js/CoveoJsAdmin.js')
            .pipe(gzip())
            .pipe(gulp.dest('target/package/js'));
	});
{% endhighlight %}

This will output the gzipped `CoveoJsAdmin.js.gz` file in `target/package/js`.

###Minify, concatenate and source maps
[gulp-concat](https://github.com/ingro/gulp-template-compile) allows us to to combine all the files needed into a single file while [gulp-uglify](https://github.com/terinjokes/gulp-uglify/) minifies (and uglifies!) our files to shrink them to a minimum weight. [gulp-sourcemaps](https://github.com/floridoo/gulp-sourcemaps) lets us know which code belongs to which file for easier debugging.  [gulp-if](https://github.com/robrich/gulp-if) allows us to add conditions to tasks. We use a `--min` flag to determine if we minify and gzip or not.

{% highlight javascript %}    
    var gulp = require('gulp');
    var gutil = require('gulp-util');
    var gulpif = require('gulp-if');
    var concat = require('gulp-concat');
    var uglify = require('gulp-uglify');
    var gzip = require('gulp-gzip');
    
    // Check for '--min' flag (true if present)
    var useMinifiedSources = gutil.env.min;
    
    // Minify and gzip
    gulp.task('libraries', function () {
	    return gulp.src('lib/**/*.
	        .pipe(concat('CoveoJsAdmin.Dependencies.js'))
	        .pipe(gulp.dest('target/package/js'))
	        .pipe(gulpif(useMinifiedSources, uglify()))
	        .pipe(gulpif(useMinifiedSources, rename('CoveoJsAdmin.Dependencies.min.js')))
	        .pipe(gulpif(useMinifiedSources, gzip(gzipOptions)))
	        .pipe(gulpif(useMinifiedSources, gulp.dest('target/package/js')));
	});
{% endhighlight %}

This will take all our libraries files (Backbone, JQuery, Underscore, etc) located in `/lib` and bundle them into `CoveoJsAdmin.Dependencies.js`. If the flag `--min` is enabled when calling gulp, it will also minify and rename to `CoveoJsAdmin.Dependencies.min.js`and gzip the file to `CoveoJsAdmin.Dependencies.min.js.gz`. The generated files will be output to `target/package/js`.

###Other notable plugins we use
 - [gulp-clean,](https://github.com/peter-vilja/gulp-clean) to delete generated files and get a fresh start
 - [gulp-util](https://github.com/gulpjs/gulp-util), for easier logging in tasks and passing arguments via the CLI
 - [gulp-less](https://github.com/plus3network/gulp-less), for those awesome stylesheets
 - [gulp-tsc](https://github.com/kotas/gulp-tsc/), to compile our TypeScript

###What’s coming next

Microsoft’s [roadmap to 2.0](http://blogs.msdn.com/b/typescript/archive/2014/10/22/typescript-and-the-road-to-2-0.aspx) is very promising!. Especially with the latest tsc 1.1.0.1 complier that should save us more than 30% compile time. We’re actually updating the compiler and adapting our codebase to support it soon. Some plugins offer [incremental builds](https://github.com/gulpjs/gulp/#incremental-builds), we’re actually looking at some to ensure compile time will be even shorter. Also, we still have development scripts in Python and we would love to translate them to JavaScript to build the project as easily as 

```
    hg pull
```
```
    npm install
```
```
    gulp
```

We’ll get there soon!


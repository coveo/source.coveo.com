---
layout: post

title: "Accelerate your Maven CI builds with distributed named locks using Redis"

tags: [CI, Continuous Integration, Jenkins, Maven, Java]

author:
  name: Jacques-Etienne Beaudet
  bio: Principal Software Engineer, Platform Foundation
  image: jebeaudet.png
 

---

Everybody loves a fast, responsive continuous integration (CI) setup. While it's fun to [battle each others on rolling chairs](https://imgs.xkcd.com/comics/compiling.png), having quick feedback on pull requests builds and fast deployments is an important part of a good development environment and is also something we constantly have to invest time in. 

In this post, we will show you a neat way to safely use your local Maven repository across multiple build processes using the `Named Locks` feature of [Maven Artifact Resolver](https://maven.apache.org/resolver/index.html). This will speed up your concurrent builds by reducing the required time to download dependencies and will also help maximize your CI instances usage.

<!-- more -->

## The problem
Apache Maven uses repositories to persist the jars of dependencies, alongside sources and javadoc jars. You're most likely familiar with the local repository that lives on your hard drive at `$HOME/.m2/repository` and Maven Central, that lives on [https://repo1.maven.org/](https://repo1.maven.org/). The way it works is simple. It keeps all the jars in a hierarchical folders using the `groupId`, `artifactId`, and the `version` defined in the `pom.xml`. When you build your project, it will first check in your local repository for the jar of your dependencies and if it's not found there, it will download it from Maven Central. And that's why developers often joke that a first build of a big project on an empty local repository will download the world!

Now to the CI part of the problem. Naturally, with your experience on initial builds that are slow, you'll want to use that local repository the maximum you can on CI instances. So you set it all up to reuse the same user (hence the same local repository). It works great! Build times are slow for the first initial builds, but are blazing fast after. You're happy. Then, 💥, you hit a weird `Zip file is empty` or other cryptic exception on a build and now nothing works anymore. You google enough to realize that while the local repository is thread safe, it is not safe for multiple concurrent [Maven processes](https://issues.apache.org/jira/browse/MNG-2802)! Fear not, this Jira created in 2007 is now _closed_, and the next section will show you how we've been using it for the past two years without any problem here at Coveo.

## The solution

The Maven Artifact Resolver is the piece of code used by Maven to resolve your dependencies and work with repositories. A lot of work has been put in recent versions (1.7+) to introduce Named Locks with implementations that will allow us to use distributed locking facilities like [Redis](https://redis.io/docs/manual/patterns/distributed-locks/) with [Redisson](https://github.com/redisson/redisson/wiki/8.-Distributed-locks-and-synchronizers) or [Hazelcast](https://hazelcast.com/blog/long-live-distributed-locks/).

The gist of the solution is simple. You spin up a local Redis instance on your CI instance on boot, configure the Redis Named Lock module on all your Maven processes, and off you go.

One problem was that, until January 31st, the latest Maven had a Java 7 requirement on the 3.8.x branch and Artifact Resolver 1.7+ required Java 8. [Now that 3.9.0 has been released](https://maven.apache.org/docs/3.9.0/release-notes.html), we can use the latest developments without having to rely on building a custom Maven binary or by using [these deprecated instructions](https://svn.apache.org/repos/asf/maven/website/components/resolver-archives/resolver-1.6.3/maven-resolver-synccontext-redisson/index.html). Now that it is all behind us, let's dive in!

### Preparing the Maven binary with Docker
To use the Named Lock implementation with Redisson, you need to follow [these instructions](https://maven.apache.org/resolver/maven-resolver-named-locks-redisson/index.html). It is a bit cumbersome to setup but by using Docker, it's relatively easy using this Dockerfile :  

<script src="https://gist.github.com/jebeaudet/8b03d800033ef850f7fb8a3712ecda8e.js"></script>

Now, just build this image with `docker build .` and push it to your favorite repository.

### Using the built image

With this Docker image in hand, you can now use it in your CI instance for all your builds. Here is a simple example using Jenkins: 

```
node("linux") {
  args = '--network host -v /home/jenkins/.m2:/home/jenkins/.m2'
  image = '1234.your.docker.registry.com/repo/maven-redisson:latest'
  sh 'docker pull ${image}'
  withDockerContainer(image: image, args: args) {
    sh 'mvn deploy'
  }
}
```
With your local Redis instance set up, if everything works properly, you should see some logging associated to Redisson at the end of your build.

### Improvements
The gains are obvious. Getting a 200MiB worth of dependencies from your hard drive will [always be faster](https://static.googleusercontent.com/media/sre.google/fr//static/pdf/rule-of-thumb-latency-numbers-letter.pdf) than getting it from a remote repository. From my testing done initially when integrating this back in 2021, a fairly large project would take about 4m48s on an empty repository and 17s on a fully populated repository. A 94% reduction!

## Closing thoughts

Getting a safe shared local Maven repository across multiple Maven processes is now officially supported and quite easy to setup, thanks to the hard work of Maven contributors. The benefits can be enormous depending on your project and it also saves a lot of network transfer, which cloud providers love to charge you every byte of it. 

I want to personally thank Michael Osipov, a long time Maven contributor, who was more than helpful in setting up and debugging some initial issues I had with this. He is also one of the main contributor for this new named locks feature, along with Tamás Cservenák.

If you like optimizing things like we do, [join the Coveo team](https://www.coveo.com/en/company/careers) and work with other folks as passionate as you are!
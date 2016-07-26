---
layout: post

title: Software Quality
tags: "software quality, design, Implementation, Build, Deploy, Monitoring"

author:
  name: Marc-Antoine Veilleux
  bio: Team Lead, Salesforce
  image: maveilleux.jpg
---

When I try to code, I always ask myself what’s right and what’s wrong about software quality. Sometimes, those questions aren’t easy to answer, but as software developers, we must answer them. Over my short time (4 years) as a developer, I developed certain universal and basic questions by reading online, and by questioning myself. Those questions, when answered correctly, can hint at the quality of a software.

<!-- more -->

Every time I code, I answer all of them. Sometimes the answer can be that, for that particular project, I don’t care. Sometimes, for that specific line of code, I don’t have to care because there already is a structure, a framework, or a way of doing things that already makes sure the software is great. The important thing is to be aware of those questions, and to take a decision for each of them.

Those questions aren’t in any particular order. I tried to split them by software project phase: design, implementation, tests, build, deployment, and monitoring. Some questions are useful for more than one phase. For each question, I try to answer it briefly, and offer some potential solutions. Obviously, those solutions are based on my personal knowledge and may - and I hope so - change over time.

## Design
The design phase is where everything is built. Developers must make sure they focus on the problem to solve with the right challenge in mind. Try to divide and conquer by fixing one problem at time. At this point, it is very easy to over design something. Keep in mind the final goal and review it with peers. 

### Compatibility
When creating a software, think about the future. How will it run with other APIs? Can you break the API contract? If not, how can you change it? Most of the time, you must make sure everything stays compatible with your API clients. There aren’t many solutions to that challenge. One of the best ways is to use API versioning. Each time there’s a breaking change on the client side, you change version. Over a long period of time, you can deprecate some API versions to clean up some code. 

### Extensibility
Can a developer easily change or add functionalities to that component? Should a client be able to change its behavior? When designing the software, try to think about those different needs. You can challenge them to make them simpler. Sometimes, the need is really per client, per line of business, or it won’t change at all. Plan ahead and figure out a way to fill all needs. Sometimes, you must let clients code what we want themselves. When they do, design a framework instead of a product. Overall, keep in mind how someone internally or externally can add functionality and whom they target.

### Upgradability
Upgradability is a bit different than extensibility. In extensibility, you make sure you can add features and modify component behavior based on needs. When talking about upgradability, you need to make sure that you can change the whole component as the application evolves. A component of your software should not be completely bound to another system. You should ask yourself these kinds of questions: can we change the database technology easily? How can we change the whole back-end without affecting the clients? Can we change an application layer without major impacts everywhere? 

Overall, it’s a good practice to have a module with a single purpose, that communicates with other parts of the application using a well-known standard. If you don’t, you’ll end up with a house of cards that breaks when anyone tries to change any part of it. Some standard ways to help your modules communicate are [HTTP](https://en.wikibooks.org/wiki/Communication_Networks/HTTP_Protocol) or [SOAP](https://en.wikipedia.org/wiki/SOAP) using XML or JSON and *not* [COM Objects](https://en.wikipedia.org/wiki/Component_Object_Model), binary serialized objects, or Microsoft-Only thingies (I know they are getting better). If you really really really don’t want to use a web server or need more speed, try something like [Google Protocol Buffer](https://developers.google.com/protocol-buffers/) or [Thrift](https://en.wikipedia.org/wiki/Apache_Thrift).

### Debuggable
How can I find a bug in the app? How can I troubleshoot a problem in a production environment? How can I look at variable values? At any time, you must be able to debug an application execution. There will be bugs; make sure your software isn’t a big black box. To do so, you can add internal and external logs everywhere - it will help you understand the app flow. If you can, you can attach to the process or dump the memory to analyze it. 

## Implementation 
Now that you we asked ourselves some question about the design, we are ready to implement it. Obviously, there are still some questions to be answered.

### Best Practices
Am I the first one to ever solve that problem? What is the state of the art about that? How does the industry do these things? Those are big questions that hide a lot of things. Best practices are what you learn at school or work - how to reuse code, to use [designs patterns](https://en.wikipedia.org/wiki/Software_design_pattern), to write comments, etc. I’ve put them all in the same category because the end result is the same - learn and search for outside information. There’s always a good reason behind a community choice. Why do we write comments? To share Knowledge. Why do we reuse code? Because it’s easier to maintain and understand. You see the picture.

Overall, when implementing a solution, try to be lazy and search for existing solutions or parts of solutions. In a world that moves so fast, you can’t objectively go your own way and ignore a whole community.

### Code Review
Should I have my code reviewed by someone else? Can others learn from what I’ve done? Should I enforce a code standard? Code review is done first for quality purposes, but it is an excellent way to learn and share information to the whole team. Over the years, I’ve learned as much as a reviewer then a reviewee. To enable code reviews to your team, there are many tools or processes you can use. You can enforce [pull requests](https://help.github.com/articles/using-pull-requests/) on your master branch or use softwares like [Reviewboard](https://www.reviewboard.org/) or [Crucible](https://www.atlassian.com/software/crucible).

### Maintainability
Is it a quick demo? Will it be in a product? How many end users will use it? How long will it be used? Does it need documentation? A quick one-time demo that will be put to trash at the end of the week doesn’t need the same maintenance effort as a feature in a main product. A great quote about maintainability is “Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live.” 

On another subject, [a group of researchers](http://www.compaid.com/caiinternet/ezine/capersjones-maintenance.pdf) identified some key factors that can affect the maintenance of software. As positive impact factors, they talk about *Maintenance specialists*, *High staff experience*, *Table-driven variables and data*, and *Low complexity of base code*. They also list negative factors like: *Error prone modules*, *Embedded variables and data*, *Staff inexperience*, and *High complexity of base code*.  In other words, make sure to follow best practices, keep it simple and stupid, and have a way to measure your application with tools (complexity analysis, unit testing, etc..).

### Tests
What are the use cases? What could fail? What behavior could change? Do I really want to do this manually each time there’s a release? What should my test cover? Try to find that pesky bug that someone would run into in production. Unit testing reduces your maintenance and saves money - it’s a medium-term investment. A bug found early in the software lifecycle costs a lot less than a bug found by a client.

Each language has its own way of doing unit tests; use it and integrate it in your build process. Try testing the modules individually and together. To do that, you can use mocking framework [Mockito](http://source.coveo.com/2014/10/01/java8-mockito/), [Moq](https://github.com/Moq/moq4/wiki/Quickstart), [JsMockito](http://jsmockito.org/)) to really corner a part of your application and test it easily. Those tests should be lightning fast and run each time someone makes a change. Also, for integration tests, you must mimic the real thing as much as you can. In those cases, you can use external calls, events recording/replaying, or even a real user session emulation (like [Selenium](http://www.seleniumhq.org/) or [PhantomJS](http://phantomjs.org/)). 

An important part of unit testing is making sure a failing test is  investigated - a green build must be a team priority. All those tests will make sure that when you change something in your code, it doesn’t break anything. It will accelerate development times and enable confidence in minor changes. 

## Build & Deploy 
I’ve put together the build and deploy process because they have a lot of common goals. 

### Replicable
Can anyone replicate the same setup easily? Are all environments essentially the same? Are the developers using something that looks like the production environment? A setup that looks like the real thing really helps the developers to code and test potential pitfalls. There are a lot of tools that can help you standardize the build and deploy processes. To help you, you can check some tools like [gulp](http://gulpjs.com/), [msbuild](https://msdn.microsoft.com/en-us/library/dd393574.aspx), and [maven](https://maven.apache.org/) for the build process, and [npm](https://www.npmjs.com/), [pip](https://en.wikipedia.org/wiki/Pip_(package_manager)), and [NuGet](https://www.nuget.org/) for your dependencies management. Typically, each language has its own way of doing things.

Overall, the processes must be so easy that any developer would be able to build and deploy to their dev environment. One person must not have the exclusive knowledge on how to do build or deploy - there shouldn’t have any human single point of failure for the build and deploy processes.

### Uptime
When an error happens, can we recover? Will data be lost? What uptime ([SLA](https://fr.wikipedia.org/wiki/Service_level_agreement)) are we aiming? When maintaining a software, uptime and data integrity are normally very important things. 

There are a lot of ways and articles that talk about how you can achieve a great uptime. To achieve that at Coveo, we normally put the upgraded module in read-only for a certain amount of time and create a parallel module that isn’t active for the clients. Then, we test it and make sure everything works correctly on the new one. When ready, we swap (gradually when we can) the two modules. At any point, we can rollback, and it won't affect any of our client.

To achieve data integrity, there aren’t a lot of things you can do that scales for big volumes. The best thing I know is that you release a change without making the actual breaking change - e.g. removing a database column - in the same release as the upgraded solution. After that release, the software should not use the deleted resource. After a certain amount of releases, when everything falls back on the new solution, you can make the breaking change. This way, you can still rollback and make sure data isn’t lost.

## Monitoring
Last but not least -  the monitoring. Any quality software must have a way to monitor itself so it can improve and fix problems before they arise. Monitoring is a way for your app to communicate to developers - by communicating through logs or alerts, a developer can know if the software is happy or needs something. Don’t mute your app; give it a voice!

### Measurable
What’s happening? What are the software performances? Where should I put effort to optimize the software? There’s a saying in the manager world: “If you can’t measure it, you can’t manage it.” This is also true for any software you write. If someone writes a black box, they can only control the input and monitor the output. As any black box, there are millions and millions of possibilities of what could go wrong.

To give an app a voice, you can use just about anything. Make it blink, beep, or vibrate; it doesn’t really matter - simply make sure you can communicate with it in real time. Obviously, there are solutions better than others (blinking isn’t very convenient). A great way to communicate with your app is by using a log platform ([Sentry](https://getsentry.com/welcome/), [Stackdriver](http://www.stackdriver.com/), [Logstash](https://www.elastic.co/products/logstash), etc.) and integrate it with a logger ([Log4XYZ](http://logging.apache.org/log4j/2.x/), console logs, etc.) This way, you’ll be able to see what’s happening nearly in real time and can produce statistics out of it - it will help tremendously.

### Actionable
Having your app talk to you is great, but you also have to make sure that when it’s yelling, someone is answering the call. So make sure you have a way to detect errors that creates an action item somewhere. Again, there are some platforms that can alert you when something strange happens ([Pager duty](https://www.pagerduty.com/), [VictorOps](https://victorops.com/product/), [IFTTT](https://ifttt.com/)). Monitoring that doesn’t trigger any real action is way less effective.


This is it. These are all the questions I keep asking myself when I write and design any software. There is a lot more content we could write for each of these sections, but I’ve tried to keep it short and only give you a grasp of how I see things. Any feedback is welcome :).






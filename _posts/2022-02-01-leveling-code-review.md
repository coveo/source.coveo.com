---
layout: post

title: "Leveling in code review"
tags: [codereview, review]

author:
  name: Andy Emond
  bio: Machine Learning Platform Developer
  twitter: Drahakar
  image: aemond.jpg
---

Through the years, I’ve heard many different opinions about code review, ranging from “publishing code to the main branch with extra annoying steps” to “I learn so much from it” stepping through “it’s pair programming with delay” and “I can’t push to prod unless someone looks at my stuff”. Being a big fan of code review, I’d like to share how I make the most of it and how I can learn from people who are awesome at it and ideally help you get to a place where you can provide a lot of value with it.
<!-- more -->

Whether you like them or not, bad code reviews are a waste of time for everyone involved. This post is a non exhaustive way to evaluate your current code review quality and provide ideas to increase your value as a code reviewer.

# Level 0: _Should fail the captcha test_

This is the level I call the “highly automatable level”. If you recognize yourself in these code reviews type of comment, despair not! I have some solutions to step up your game :) 

- Comments about formatting
- Comments about compiler warnings
- Dead code

If you do these kinds of comments during code reviews, I would strongly urge you to automate yourself out of it. Compiler warnings, formatting, and deadcode removals are all easily caught or even applied automatically by many tools. To get out of this level, simply add a linter or flag compilation warnings as errors in your continuous integration (CI) process and be done with it. You won’t even have to look at these pull requests as the CI will flag them as broken for you. Win win win.


# Level 1: _Welcome, human (functionality level)_

This is where your value, as a human, comes into play (until the great AI overlord takes over). At this level we can leverage your skills as a human to help improve the code submitted by your colleagues. The good thing about this level is that it doesn’t require a lot of knowledge about the project overall; it’s a great place to start if you are new to a project or the company.

- Is the code easy to understand?
- Are the changes accompanied with unit tests (that are easy to understand)?
- Does the logic make sense according to the feature wanted or the bug that needed to be fixed?
- Could the code be re-written in a more idiomatic/readable way?
- Is the right data structure being used?
- What are the added lines doing? 
- Is there proper logging / instrumentation?

Getting to this level is relatively easy considering how little outside knowledge is required, but it requires you to actually look and think about the code you are reading.


# Level 2: _Oh look! I’m working within a service!_

Now we’re getting to a more valuable place in terms of code review. This is when your code review starts to integrate the context of the service you are running in and the impact the code change has on the code around it. This is a good place to be when you start being familiar with a specific part of the code (or the whole project).

- Is the change located in the right place in the project?
- Is this functionality duplicated from elsewhere in the project (could it be centralized or [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself))?
- Should there be refactoring to improve the code quality of this part of the project?
- What are the removed lines removing? Are they supposed to be removed?
- Could/Should this be done by an external library instead (should we do it instead of pulling a full library for it)?
- Is the error handling properly done / what are the error cases (or the not so happy path)?
- Will this affect the alerting for this specific service?
- Is it following the single responsibility principle?

Getting to this level can be harder, as it requires some knowledge of the service you are working in and of the different [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself), [Single Responsibility](https://en.wikipedia.org/wiki/Single-responsibility_principle) principles and other methodology like [the 12 factor app](https://12factor.net/). That being said, the value it brings is greatly superior to the previous level. It helps improve the global quality and maintainability of the service and catches nasty bugs that could cripple the overall role of this specific service. To get there from level 1, you’ll need to read and understand the code surrounding the changes. The more you do it, the better your code review will be.


# Level 3: _Be one with the system_

At this level of code review, you should not only be taking in consideration your own service but also the whole ecosystem it lives in. A code review of this level can have an impact on multiple teams within your organization and be a tremendous opportunity to learn a lot about your company's inner workings. At this level you are also expected to think about time not as “snapshots” but as a continuum.

Your application will be deployed, so what happens while it is still in transition? If it has to be rolled back, what happens then? Other services will interact with it – is it problematic? You are also to think in terms of organization; is this the right place to put this feature or is there another service that would be better suited to do it? You should be looking at your service as a part of the system, not as “the” system. Although all of those concerns should normally be identified during a design review, often enough some small changes might have unsuspected ramifications with deep architectural and responsibility implications. 

- Is this the right place to add this functionality in the system?
- Is this an issue encountered by many other teams? Could this be generalized to be used by other services?
- What will be the impact of this change during the deployment?
- Is rollback possible if something goes wrong?
- Is this properly monitorable?
- What is the impact of this change if more than one service is doing it at the same time?
- Is this an API breaking change? Is this a feature breaking change?
- What are the impacts of this change on the upstream/downstream systems?
- Should another Subject Matter Expert (SME) be involved in this review?

The best way to get to this level is to start discussing and understanding what other teams, outside of your service, are doing. The more you’ll learn about how they work and their current issue, the better perspective you’ll have on the impact of the changes you are making.


# Is this it?

As you have probably noticed, those levels are mostly oriented towards someone working on a micro/macro service within a company. Nonetheless, I hope there can be some value in there even if this isn’t your current situation. One thing you’ll find is missing from this post is how to provide effective and constructive feedback, which will be covered in a future post on this blog, stay tuned :). If you are impatient, you can go and read what Google has to say about it in their [9th chapter of Software Engineering at Google](https://abseil.io/resources/swe_at_google.2.pdf).

_Thanks to Devin Lafrenière, David Lévesque, Maxime Lachapelle, Alexandre Moreau, Kevin Larose, Samuel Begin, Louis Bompart, Martin Ouellet, and Marc Sanfaçon who were kind enough to review this blog post._

_Do you like leaving or receiving constructive code reviews? Do you long to work on a service where your code can improve the code of others? Check out our [careers](https://www.coveo.com/en/company/careers) page and join the team!_
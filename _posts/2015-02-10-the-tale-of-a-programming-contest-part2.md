---
layout: post

title: "The tale of a programming contest - Part 2"

tags: [Coveo Blitz]

author:
  name: Marc Sanfaçon
  bio: SVP Technology
  twitter: msanfacon
  image: msanfacon.png
---

# Fifth edition

After months of preparation, the fifth edition of Coveo Blitz was held on January 10th 2015. This year, we held the [contest]({{ site.baseurl }}/2014/12/22/the-tale-of-a-programming-contest) in our offices for the third time. A total of 54 students from 7 universities and colleges participated in the fifth edition of our annual contest. Let me tell you a bit on how it went.

<!-- more -->

# Contest creation process

We started working on Coveo Blitz 2015 in late March of 2014. The first step was to find people interested in working on the preparation of the contest among our employees. This was the easy part for Coveo, probably due to the fact that it’s not the first edition and people know what they are getting into.

Then, probably the most important task was to find the challenges the students would have to work on during the contest. This is where I always push to get the challenges more *challenging*. I admit, I’m the one who always thinks it’s going to be too easy. But boy, was I wrong this year!

After a few meetings of brainstorming on ideas around what we do (search engine, usage analytics, …), we decided to ask the students to provide an analytics engine on top of nearly 1 billion log lines of Apache web server. We wanted the engine to provide small metrics such as count by error code or access by country for a specific date range. But we also added a few more complex metrics such as the average response time, the max response time, and others.


The contest was divided in three different parts:

1. **GLORIOUS MAPREDUCER:** a MapReduce component that crunches the data

2. **AWESOME SERVICE:** a server that reads the crunched data and answers the queries our contest platform will submit

3. **MYSTERIOUS USER INTERFACE:** an intuitive user interface that even the boss (that’s me!) can use

A team of ~15 persons was assembled to build all the components, documentation, test data and a bunch of other stuff required for the contest. It took a lot of hours, lunches, dinners, coffees and stubbornness to get it all ready for the day of the contest, and we succeeded.

Every year, we somehow underestimate the cost of modifying our contest platform for the new challenges. This year, adding support for Amazon Elastic MapReduce (EMR) proved to be more complex than we anticipated.

![]({{ site.baseurl }}/images/20150210/image_0.jpg)

Part of the Coveo team working on preparing the contest in late December

# D-Day

We can already feel the vibe the Friday before the contest. The team is working on finalizing the latest details, such as setting up the R&D area for the contestants and the ops team, setting up the projectors or simply rewriting the scoring algorithms. After turning off the lights for the night, it’s time for the traditional [Poutine](https://www.google.ca/search?tbm=isch&q=poutine#tbm=isch&q=poutine+-vladimir), just before bed.

The day of the contest starts early for the team (and most likely for the students as well). I got at the office at around 6:10 am and there was already a team of student preparing their gears for the contest - probably a record. But others decide to be late - usually veterans - and find original places to hang their coats:

![]({{ site.baseurl }}/images/20150210/image_1.png)

We like to think this is one of the best contest for students in the area and we are working hard to keep it that way. One of the things we did this year, with the help of our Amazon account executive who sponsored the event (thanks James), was to provide a $50 credit for Amazon AWS to all participating teams. The idea was to provide as much tools as possible for the teams to be ready for the contest. One month prior the contest we sent an email to all teams with the credit and a text explaining they should use the credit to try out EMR, not mine Bitcoin!

During the presentation of the contest and its multiple challenges, I asked how many people played with EMR and a total of 6 persons raised their hands - ouch! I think the students underestimated the complexity of Coveo Blitz and the fact that being prepared helps. And we underestimated the fact that students are students.

# When the programming contest is too complex

The day was divided into 5 evaluation steps, with each of them adding complexity. Remember I said 1 billion log lines, well, we kind of lowered that number because of the time it took to crunch that amount of data. The first evaluation consisted of only 100 log lines and up to 12.5 million log lines for the last evaluation.

After the first two evaluations, not a single team had points! The Coveo team was running around helping the students with the GLORIOUS MAPREDUCER - we even did a quick crash course to help them.

We were still hoping for some teams to make points on the third evaluation as we were monitoring the teams testing their algorithms with the test data provided. But after the third round when no one scored a single point we had to readjust the contest.

We gave the source code of the GLORIOUS MAPREDUCER for the first evaluation round to everyone. We also decided to rerun the first three rounds in place of the fourth one. We finally got a team scoring points on our super Mario Kart dashboard. You can see it [here](https://www.youtube.com/watch?v=PGXPVTMHcGs#t=260)[.](https://www.youtube.com/watch?v=PGXPVTMHcGs#t=260)

I admit it, the contest was too complex this year and I am certainly a bit responsible for this.

# Some tricks for next year

I have a few advices for people who wants to participate in Coveo Blitz, or any other contest.

1. **Be prepared**<br>
Every year we can see the difference between the teams that spent time to prepare for the contest compared to the ones who did not. The ones who prepared already have the tools they want to used installed on their computer and pretty much know the role of each people in the team. That makes a big difference when you have a limited time to complete the challenges.  You'll have a lot more fun that way, I'm sure!

2. **Know the basics**<br>
Every year we see students choosing the language they want to use, installing the featured components and reading the how-to. Again, this goes to #1, be prepared. You should know your tools and languages if you want to perform in the contest.

3. **Have someone dedicated to the UI**<br>
Coveo Blitz always has a user interface part and every year is the same - most teams do not put the required efforts to have nice user interfaces. It still counts for 25% of the points, at least it was in the last editions of Coveo Blitz.

4. **Set small, incremental goals during the day**<br>
This is crucial to achieving results. You're a team and you need to sync often, and make sure you're all working in the same direction.

During the first edition of Coveo Blitz, a team used agile methodology with the help of a cooking timer. Every 30 minutes they would do a scrum. That was really impressive and worked pretty well - highly suggested!

![]({{ site.baseurl }}/images/20150210/image_2.jpg)



# Wrap up

We learned a lot again this year and we’ll use this added experience to prepare something awesome for Coveo Blitz 2016. We hope to see you there, well prepared! :)

I really liked the T-shirts for this year’s edition, one of the perk for participating at Coveo Blitz!

![]({{ site.baseurl }}/images/20150210/image_3.jpg)

One last note, the code for Coveo Blitz 2015 solution is available on [GitHub](https://github.com/Coveo/Blitz-2015).

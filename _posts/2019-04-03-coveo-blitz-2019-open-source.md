---
layout: post

title: "Coveo Blitz - The Coveo Blitz 2019 code is now available online!"
tags: [Blitz, Coveo Blitz]

author:
  name: Andy Emond
  bio: Machine Learning Platform Developer
  twitter: Drahakar
  image: aemond.jpg

---

It's been a few months since the 2019 edition of Coveo Blitz, our yearly coding competition, where students from across the province must design the best algorithm to outplay their rivals. This year again, the quality of the participants was fantastic and left us to the edge of our seats until the very end of the event. Unfortunately, today's post isn't about giving you all the juicy details of the competition (more posts are coming on that topic 😉 ), but to announce that this year's competition source code is available on our [GitHub](https://github.com/coveo/Blitz2019)! You will find in this repository the main challenge, the "micro-challenges" and a local "test" environment for you to test your bots and solutions.

<!-- more -->


![What took you so long?](/images/2019-04-03/whattookyousolong.gif "What took you so long?")

### The Coveo Blitz was 4 months ago, what took you so long??

I better see a bunch of stars on that repository, you impatient animals! 😉

By its competitive nature, Coveo Blitz is considered a super duper secret project, even within Coveo. We have what I call an informal NDA we make internal participants sign (“it’s a secret or die” warning from our boss acts as an NDA, right?) and because of how secret and awesome it is, everyone tries to bribe you into giving information about what the competition will be. People also try to sneak up on you while you’re hard at work on the project, hoping to get insider information about the challenge, even if it means crawling on the floor over several meters (nice try Francis).


This year, the Coveo Blitz was mostly written in Python, a language that I hum, let's kindly say, do not master but am getting pretty fond of. Because of the aforementioned secrecy, I couldn’t get some of our resident expert Python programmers to review my code before the competition. The code ran well, but I had the feeling that it wasn’t exactly idiomatic or pythonic. Knowing that, I made sure I would get a couple of experts to look at it before I release it to the world. 


## Getting Code Reviewed by Pros

When you’re out of university and receive your first code review, it’s brutal. Going from "it works, push it to production/finish the assignment ASAP” to “yeah it works but there's literally a hundred ways you could make it better” is almost soul crushing. Hopefully, as much as it can be hard at first, it becomes very precious once you get through it a couple of times and see how amazing the final product is. After a couple of years of software development, reviews _normally_ tend to go from a couple of hundreds *gulp* to a handful of comments for each pull request you create, which is what I consider an improvement.

The keyword is _normally_.

I literally had hundreds of improvements suggested by my colleagues - or at least it felt like it!

My colleagues were nice enough to go through the code we built for the [#CoveoBlitz 2019](https://twitter.com/search?f=tweets&vertical=default&q=%23coveoblitz&src=typd) and helped us improve it greatly and made it way more pythonic. I personally learned a bunch of stuff, got to discover a lot of new features from the latest python version and greatly improved the quality of the code. I hope this will help any newcomer understand the code if you ever clone it on GitHub :). 

tl;dr, Code reviews are *awesome*.

## What's next?

Now that the code is online ([https://github.com/coveo/Blitz2019](https://github.com/coveo/Blitz2019)) I hope you’ll send us pull requests if you feel the code could be improved further or if you have any new features you would like to add 😀.

On this note, I’ll go back fiddling around with the rest of the team to figure out the challenge for next year’s Coveo Blitz!

---
layout: post

title: "Blitz - The story behind this year’s challenge"

tags: [Coveo Blitz, Blitz, AI]

author:
  name: William Fortin, Guillaume Simard
  bio: Blitz developers
  image: guillaumewilliam.jpeg
---

## The brainstorm

This year was the sixth edition of Coveo Blitz, our classic programming contest for students. The original purpose of the event is to find great, passionate developers and show them how fun, passionate, and driven our team is. We had the idea to step out of our comfort zone this year and focus on what we’ve learned in the last editions. 
<!-- more -->

We’ve wanted to do a challenge involving artificial intelligence for a long time. With a smaller team working on Blitz this year, we had to leverage existing projects to make it on time. Our search began, we knew [Scalatron](https://scalatron.github.io/), [Berlin AI](http://www.berlin-ai.com/), and found a bunch of interesting projects. We eventually found [Vindinium](http://vindinium.org/). It covered most of our requirements: It is [open source](https://github.com/ornicar/vindinium), customizable, works with most programming languages and has many available starter kits.

![image]({{ site.baseurl }}/images/blitz2016/tv.png)

## Changes to Vindinium

Vindinium out of the box was a great skeleton for our contest. However, it was missing some features in order to be Blitz ready. First, the way bots usually start Vindinium matches is by joining a queue. As soon as 4 bots are ready, the match starts. This was not an acceptable solution for us as we needed to have a tournament bracket and we didn’t want participants to join a match that they weren’t supposed to. In order to do that, we added API calls to list, create, join, delete and start games. We also added an administrator API key that was required to invoke these calls so meddling students wouldn’t create games. This allowed us to create games, send the game id to the appropriate teams, let them join and start the game at our leisure. We even added a Slack integration to our UI that would automatically send an invite with the game id to teams whenever a game they were expected to join was created.

Another thing we wanted to do was to prevent open source Vindinium bots from working. This would ensure that lazy students wouldn’t simply copy a Github project and dominate all other teams. To do this, we modified most constants such as the cost of using a tavern, the life provided by a tavern and the damage done by heroes. We also added spikes, a new type of tile. Spikes can be passed through just like air but they deal damage to your hero.

These changes allowed us to easily manage the Vindinium server (through our custom UI) and created a fun and diverse environment for the participants. Spikes added a surprisingly nice complexity to the game and lead to some interesting pathfinding strategies.

We also learn a lot while coding the challenge, this year we tackled with Scala, Akka, MongoDB, AWS, NodeJS, React and TypeScript.

![image]({{ site.baseurl }}/images/blitz2016/tv.png)

## The contenders

This year we made a roll call to our teammates if they were interested in also participating to Blitz. Needless to say, it took about 10 minutes to build two complete teams. We made sure the Coveo teams didn’t know about the challenge. They needed to be good, they represent Coveo! Luckily for us, the two Coveo teams finished first and second. Congrats to Brute Force It (Alexandre, Frédéric, Vincent and Pierre-Alexandre) and WOW BLITZ AWSOME (Mathieu, Charle, Denis and Jean-Philippe).

![image]({{ site.baseurl }}/images/blitz2016/coveoteams.png)

## The winners

Kudos to the two Coveo team who made it to the finals. Team *Comeo* (François Chantal, Olivier Précourt et Samuel Thériault-Hall) got first prize and each won a GoPro. Team *int elligence;* (Guillaume Chevalier, Nicolas Tremblay, Raphaël Gaudreault et Jean-Benoît Harvey) each got a Best Buy gift card for their second position.

![image]({{ site.baseurl }}/images/blitz2016/winners.png)

## Wrap up

We finished the day by having each team explaining the algorithms used to solve the challenge, grabbed a cold beer and a slice of pizza and discussed with students. We’ve listed some solutions on the Coveo Blitz 2016 GitHub account. Send us your solution if yours isn’t listed! Also, be sure to check out the [Vindinium subreddit](https://www.reddit.com/r/vindinium) for great AI solutions.

We hope you’ve enjoyed your day as much as we did and hope to se you next year for another awesome challenge. Be sure to take a look at the [video](https://youtu.be/OfA94Ds6BWU) and the [photo album](https://goo.gl/photos/qMLEorRdrejnjpx79).

<iframe width="560" height="315" src="https://www.youtube.com/embed/OfA94Ds6BWU" frameborder="0" allowfullscreen></iframe>

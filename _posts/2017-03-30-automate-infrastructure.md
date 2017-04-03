---
layout: post

title: "Automate your infrastructure"

tags: [Automation, Devops, Coveo]

author:
  name: Serge Ohl
  bio: I am an engineer somewhere between code and infrastructure, but I have to admit I prefer one of them
  image: sohl.png
---

_In my life, I really love to automate recurring tasks. In my private life, I've been conceptualizing, building, and developing my home automation for many years. At work, I automate everything: scripts, servers, deployments, etc. And now in the cloud, I am automating the infrastructure._

It is not a new things; automation is old, but it's not in all data centers or cloud infrastructures.
Let’s see why you would have to automate your infrastructure, except because it's cool. There are other points to consider.

<!-- more -->

## Who has to automate infrastructure?

First, everybody has to do automation, from little company to big giant of web. Like I often hear **no matter the size**, this precept philosophical is working here too. Whether your infrastructure has 3 servers or 1000 servers, it is really the same thing, the same importance, and maybe most important for little infrastructure.

If you consider your infrastructure important, you must do it. And if you do not, we need to talk.


## What do I have to automate?

Simple answer: **everything**. If you go the way of automation you have to keep in mind than everything has to be automated. If there is human action, is it really automation ? Of course, you will have one human action to push on the button to launch the deployment; if I automate it I will lose my job.

If you can deploy your new application with one button and let the magic of automation operate but you have to add manually a new subnet or route, you failed. Reminder everything !


## Where do I do that?

The easiest is in the cloud everybody has heard about, may it be AWS, Google Cloud, or others. The cloud was created for be modular and easy to use. All cloud providers have tools or APIs helps you to control their products. With AWS you can deploy without having to connect a single time in their web console. Take the controls of all APIs.

By the way, there are no excuses either in a private cloud or datacenter. I have been in data center world for many years and I saw automation before the cloud advent. Now there are API everywhere, you can do automation, not easily, but you can. Ok except for add a server on a rack, those techs are harder to automate.


## When do I have to start ?

As soon as possible. Like I said earlier, do not wait to have 1000 servers to do automation. The sooner you start, the easier it will be for you to do that automation. My big issue today is to automate a network creation. I can automate it but I have to create a new one and do a migration on this network. It is like restarting from zero.


## How do I do that?

It is a large topic; we can talk about cloud providers, tools, methods... For me the most important point is to **take the time to think**. I saw too often people choose a techno or solution and go fast, do, re do, and have workarounds on workarounds. Yes it is quick, there are results in few hours or days, but you lose in quality and you have to do changes too often.

Yes, we don’t have the time, but that's the reason why it is better to take the time to think. You will have a solid infrastructure and you will return in code for add features not for debug your kraken.

I hear for the dev teams here : do it iteratively. Yes it is true and better for change management but you cannot do it if you didn’t think about what can be your infra for next years. How can you iterate without target?  Try to change the network topology after deploying without downtime.

Here's a small tip: when you plan your infrastructure, even if you have one server, think about how it will be with 100 servers.

## Why would you do that?

It is a lot of work, it takes a lot of time, it is legitmate to ask why I will automate all the infrastructure. There are answers for all positions in your company.
The dev teams will be happy to see the new features go to production quickly.
The security team will be happy to know than you can recreate all the infrastructure in case of a disaster.
The ops team will be happy to have an easy way to maintain the infrastructure.
Your team will be happy to do cool stuff.
And of course your boss will be happy to see everybody happy (if it is even possible).


## Do what I say, not what I am doing?

At Coveo I cannot say we have one button to deploy our application, but automation is everywhere. It is an important topic and everybody contributes it.

We have established targets and are now working hard for them. Not just with code; we changed our team's organization to have Devops close to Dev teams and we added an infrastructure team for automate infra and build tools for devops/devteams.


## And you?

I spoke with some Devops in other companies, it's always very interesting to know where they are at with their automations. Maybe you are Devops, do you have a fully automated infrastructure ?
